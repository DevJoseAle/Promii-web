import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";

// ─── Tipos locales ─────────────────────────────────────────────────────────────

type PlanId = "founder" | "starter" | "growth" | "pro";

const PLANS: Record<PlanId, { priceUsd: number; monthlyPromiiLimit: number }> = {
  founder: { priceUsd: 17, monthlyPromiiLimit: 5 },
  starter: { priceUsd: 22, monthlyPromiiLimit: 5 },
  growth:  { priceUsd: 39, monthlyPromiiLimit: 20 },
  pro:     { priceUsd: 75, monthlyPromiiLimit: 100 },
};

// ─── Clientes ──────────────────────────────────────────────────────────────────

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2026-01-28.clover" as Stripe.LatestApiVersion,
});

function getSupabase() {
  // SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los inyecta Supabase automáticamente
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // ── 1. Verificar firma de Stripe ─────────────────────────────────────────────
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  const rawBody = await req.text();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] Invalid signature:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  console.log(`[stripe-webhook] Received: ${event.type}`);

  // ── 2. Procesar evento ────────────────────────────────────────────────────────
  try {
    await handleEvent(event);
  } catch (err) {
    console.error("[stripe-webhook] Error handling event:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

// ─── Lógica de eventos ────────────────────────────────────────────────────────

async function handleEvent(event: Stripe.Event) {
  const supabase = getSupabase();
  // deno-lint-ignore no-explicit-any
  const obj = event.data.object as any;
  const now = new Date().toISOString();

  switch (event.type) {

    // Pago único completado
    case "checkout.session.completed": {
      if (obj.mode !== "payment") break;

      const merchantId: string = obj.metadata?.merchant_id ?? "";
      const plan = (obj.metadata?.plan ?? "starter") as PlanId;
      const endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      if (!merchantId) break;

      await updateMerchant(supabase, merchantId, {
        plan_id: plan,
        plan_status: "active",
        plan_start_at: now,
        plan_end_at: endsAt,
        monthly_promii_limit: PLANS[plan].monthlyPromiiLimit,
      });

      await insertSubscription(supabase, {
        merchant_id: merchantId,
        plan_id: plan,
        billing_type: "one_time",
        status: "active",
        external_id: obj.id,
        amount_usd: PLANS[plan].priceUsd,
        started_at: now,
        ends_at: endsAt,
      });
      break;
    }

    // Suscripción activada o renovada
    case "invoice.payment_succeeded": {
      const metadata = obj.subscription_details?.metadata
        ?? obj.subscription?.metadata
        ?? {};

      const merchantId: string = metadata.merchant_id ?? "";
      const plan = (metadata.plan ?? "starter") as PlanId;
      const subscriptionId: string = obj.subscription?.id ?? obj.subscription ?? "";
      const periodEnd = obj.lines?.data?.[0]?.period?.end;
      const endsAt = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;

      if (!merchantId) break;

      await updateMerchant(supabase, merchantId, {
        plan_id: plan,
        plan_status: "active",
        plan_start_at: now,
        plan_end_at: endsAt,
        monthly_promii_limit: PLANS[plan].monthlyPromiiLimit,
        external_subscription_id: subscriptionId || null,
      });

      await upsertSubscription(supabase, {
        merchant_id: merchantId,
        plan_id: plan,
        billing_type: "recurring",
        status: "active",
        external_id: subscriptionId || null,
        amount_usd: PLANS[plan].priceUsd,
        started_at: now,
        ends_at: endsAt,
      });
      break;
    }

    // Suscripción cancelada
    case "customer.subscription.deleted": {
      const merchantId: string = obj.metadata?.merchant_id ?? "";
      if (!merchantId) break;

      await updateMerchant(supabase, merchantId, {
        plan_status: "cancelled",
        external_subscription_id: null,
      });

      if (obj.id) {
        await supabase
          .from("merchant_subscriptions")
          .update({ status: "cancelled", updated_at: now })
          .eq("external_id", obj.id);
      }
      break;
    }

    // Pago fallido → expirar
    case "invoice.payment_failed": {
      const metadata = obj.subscription_details?.metadata
        ?? obj.subscription?.metadata
        ?? {};
      const merchantId: string = metadata.merchant_id ?? "";
      const subscriptionId: string = obj.subscription?.id ?? obj.subscription ?? "";

      if (!merchantId) break;

      await updateMerchant(supabase, merchantId, { plan_status: "expired" });

      if (subscriptionId) {
        await supabase
          .from("merchant_subscriptions")
          .update({ status: "expired", updated_at: now })
          .eq("external_id", subscriptionId);
      }
      break;
    }

    default:
      console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
  }
}

// ─── Helpers DB ───────────────────────────────────────────────────────────────

async function updateMerchant(
  supabase: ReturnType<typeof getSupabase>,
  merchantId: string,
  payload: Record<string, unknown>,
) {
  const { error } = await supabase
    .from("merchants")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", merchantId);

  if (error) throw new Error(`updateMerchant failed: ${error.message}`);
}

async function upsertSubscription(
  supabase: ReturnType<typeof getSupabase>,
  data: {
    merchant_id: string;
    plan_id: string;
    billing_type: string;
    status: string;
    external_id: string | null;
    amount_usd: number;
    started_at: string;
    ends_at: string | null;
  },
) {
  if (data.external_id) {
    const { error } = await supabase
      .from("merchant_subscriptions")
      .upsert(
        { ...data, updated_at: new Date().toISOString() },
        { onConflict: "external_id" },
      );
    if (error) throw new Error(`upsertSubscription failed: ${error.message}`);
  } else {
    await insertSubscription(supabase, data);
  }
}

async function insertSubscription(
  supabase: ReturnType<typeof getSupabase>,
  data: {
    merchant_id: string;
    plan_id: string;
    billing_type: string;
    status: string;
    external_id: string | null;
    amount_usd: number;
    started_at: string;
    ends_at: string | null;
  },
) {
  const { error } = await supabase
    .from("merchant_subscriptions")
    .insert({ ...data, updated_at: new Date().toISOString() });
  if (error) throw new Error(`insertSubscription failed: ${error.message}`);
}
