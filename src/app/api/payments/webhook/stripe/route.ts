import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { PLANS } from "@/lib/payments";
import type { WebhookEvent } from "@/lib/payments";
import { createServiceRoleClient } from "@/lib/supabase/supabase.service-role";

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── 1. Leer body raw (necesario para verificar firma de Stripe) ──────────────
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  // ── 2. Verificar firma y normalizar evento ────────────────────────────────────
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

  // Ignorar eventos desconocidos sin error (Stripe puede enviar tipos extra)
  if (event.type === "unknown" || !event.merchantId) {
    return NextResponse.json({ received: true });
  }

  // ── 3. Actualizar plan del merchant en Supabase ───────────────────────────────
  try {
    await applyPlanUpdate(event);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Error applying plan update", details: message },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

// ─── Actualizar merchants según el evento normalizado ────────────────────────

async function applyPlanUpdate(event: WebhookEvent): Promise<void> {
  const supabase = createServiceRoleClient();
  const planConfig = PLANS[event.plan];

  switch (event.type) {
    case "payment.succeeded": {
      // Pago único completado → activar plan por 30 días
      const now = new Date();
      const periodEnd = event.periodEnd ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const { error } = await supabase
        .from("merchants")
        .update({
          plan_id: event.plan,
          plan_status: "active",
          plan_start_at: now.toISOString(),
          plan_end_at: periodEnd.toISOString(),
          monthly_promii_limit: planConfig.monthlyPromiiLimit,
          updated_at: now.toISOString(),
        })
        .eq("id", event.merchantId);

      if (error) throw new Error(`[webhook] payment.succeeded update failed: ${error.message}`);
      break;
    }

    case "subscription.activated": {
      // Suscripción activa o renovada
      const now = new Date();

      const updatePayload: Record<string, unknown> = {
        plan_id: event.plan,
        plan_status: "active",
        plan_start_at: now.toISOString(),
        plan_end_at: event.periodEnd?.toISOString() ?? null,
        monthly_promii_limit: planConfig.monthlyPromiiLimit,
        updated_at: now.toISOString(),
      };

      // Guardar ID de suscripción externa si está disponible
      if (event.externalSubscriptionId) {
        updatePayload.external_subscription_id = event.externalSubscriptionId;
      }

      const { error } = await supabase
        .from("merchants")
        .update(updatePayload)
        .eq("id", event.merchantId);

      if (error) throw new Error(`[webhook] subscription.activated update failed: ${error.message}`);
      break;
    }

    case "subscription.cancelled": {
      const { error } = await supabase
        .from("merchants")
        .update({
          plan_status: "cancelled",
          external_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", event.merchantId);

      if (error) throw new Error(`[webhook] subscription.cancelled update failed: ${error.message}`);
      break;
    }

    case "subscription.expired": {
      const { error } = await supabase
        .from("merchants")
        .update({
          plan_status: "expired",
          updated_at: new Date().toISOString(),
        })
        .eq("id", event.merchantId);

      if (error) throw new Error(`[webhook] subscription.expired update failed: ${error.message}`);
      break;
    }
  }
}
