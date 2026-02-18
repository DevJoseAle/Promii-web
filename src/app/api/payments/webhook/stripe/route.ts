import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider, PLANS } from "@/lib/payments";
import type { WebhookEvent } from "@/lib/payments";
import { createServiceRoleClient } from "@/lib/supabase/supabase.service-role";

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── 1. Leer body raw (necesario para verificar firma de Stripe) ───────────────
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  // ── 2. Verificar firma y normalizar evento ─────────────────────────────────────
  let event: WebhookEvent;
  try {
    const provider = getPaymentProvider("stripe");
    event = await provider.handleWebhook(rawBody, signature);
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  // ── 3. Idempotencia: registrar event_id (evitar replays) ─────────────────────
  const supabase = createServiceRoleClient();
  const { error: eventInsertError } = await supabase
    .from("stripe_webhook_events")
    .insert({
      event_id: event.eventId,
      event_type: event.type,
    });

  if (eventInsertError) {
    if (eventInsertError.code === "23505") {
      return NextResponse.json({ received: true, status: "already_processed" });
    }
    const message = eventInsertError.message;
    return NextResponse.json(
      { error: "Error recording webhook event", details: message },
      { status: 500 }
    );
  }

  // Ignorar eventos desconocidos (Stripe puede enviar tipos no relevantes)
  if (event.type === "unknown" || !event.merchantId) {
    return NextResponse.json({ received: true });
  }

  // ── 4. Aplicar cambios en DB ───────────────────────────────────────────────────
  try {
    await applyPlanUpdate(supabase, event);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Error applying plan update", details: message },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

// ─── Lógica principal: actualiza merchants + registra en merchant_subscriptions ─

async function applyPlanUpdate(
  supabase: ReturnType<typeof createServiceRoleClient>,
  event: WebhookEvent
): Promise<void> {
  const planConfig = PLANS[event.plan];
  const now = new Date();

  switch (event.type) {

    // ── Pago único completado ────────────────────────────────────────────────
    case "payment.succeeded": {
      const endsAt = event.periodEnd ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await updateMerchantPlan(supabase, event.merchantId, {
        plan_id: event.plan,
        plan_status: "active",
        plan_start_at: now.toISOString(),
        plan_end_at: endsAt.toISOString(),
        monthly_promii_limit: planConfig.monthlyPromiiLimit,
      });

      await upsertSubscription(supabase, {
        merchant_id: event.merchantId,
        plan_id: event.plan,
        billing_type: "one_time",
        status: "active",
        gateway: "stripe",
        external_id: event.externalSubscriptionId ?? null,
        amount_usd: planConfig.priceUsd,
        started_at: now.toISOString(),
        ends_at: endsAt.toISOString(),
      });
      break;
    }

    // ── Suscripción activada o renovada ──────────────────────────────────────
    case "subscription.activated": {
      const endsAt = event.periodEnd ?? null;

      await updateMerchantPlan(supabase, event.merchantId, {
        plan_id: event.plan,
        plan_status: "active",
        plan_start_at: now.toISOString(),
        plan_end_at: endsAt?.toISOString() ?? null,
        monthly_promii_limit: planConfig.monthlyPromiiLimit,
        external_subscription_id: event.externalSubscriptionId ?? null,
      });

      // Upsert por external_id para no duplicar en cada renovación
      await upsertSubscription(supabase, {
        merchant_id: event.merchantId,
        plan_id: event.plan,
        billing_type: "recurring",
        status: "active",
        gateway: "stripe",
        external_id: event.externalSubscriptionId ?? null,
        amount_usd: planConfig.priceUsd,
        started_at: now.toISOString(),
        ends_at: endsAt?.toISOString() ?? null,
      });
      break;
    }

    // ── Suscripción cancelada ─────────────────────────────────────────────────
    case "subscription.cancelled": {
      await updateMerchantPlan(supabase, event.merchantId, {
        plan_status: "cancelled",
        external_subscription_id: null,
      });

      if (event.externalSubscriptionId) {
        await supabase
          .from("merchant_subscriptions")
          .update({ status: "cancelled", updated_at: now.toISOString() })
          .eq("external_id", event.externalSubscriptionId);
      }
      break;
    }

    // ── Pago fallido → expirar ────────────────────────────────────────────────
    case "subscription.expired": {
      await updateMerchantPlan(supabase, event.merchantId, {
        plan_status: "expired",
      });

      if (event.externalSubscriptionId) {
        await supabase
          .from("merchant_subscriptions")
          .update({ status: "expired", updated_at: now.toISOString() })
          .eq("external_id", event.externalSubscriptionId);
      }
      break;
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function updateMerchantPlan(
  supabase: ReturnType<typeof createServiceRoleClient>,
  merchantId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase
    .from("merchants")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", merchantId);

  if (error) {
    throw new Error(`[webhook] merchants update failed: ${error.message}`);
  }
}

async function upsertSubscription(
  supabase: ReturnType<typeof createServiceRoleClient>,
  data: {
    merchant_id: string;
    plan_id: string;
    billing_type: string;
    status: string;
    gateway: string;
    external_id: string | null;
    amount_usd: number;
    started_at: string;
    ends_at: string | null;
  }
): Promise<void> {
  // Si hay external_id, upsert para no duplicar renovaciones de la misma suscripción
  if (data.external_id) {
    const { error } = await supabase
      .from("merchant_subscriptions")
      .upsert(
        { ...data, updated_at: new Date().toISOString() },
        { onConflict: "external_id" }
      );

    if (error) {
      throw new Error(`[webhook] merchant_subscriptions upsert failed: ${error.message}`);
    }
  } else {
    // Pago único sin subscription ID: siempre insertar
    const { error } = await supabase
      .from("merchant_subscriptions")
      .insert({ ...data, updated_at: new Date().toISOString() });

    if (error) {
      throw new Error(`[webhook] merchant_subscriptions insert failed: ${error.message}`);
    }
  }
}
