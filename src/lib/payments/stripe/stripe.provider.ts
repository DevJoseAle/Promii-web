import Stripe from "stripe";
import { stripeClient } from "./stripe.client";
import type {
  PaymentProvider,
  CheckoutParams,
  CheckoutResult,
  WebhookEvent,
  PlanId,
  BillingType,
} from "../types";

// ─── Price ID map (cargado desde env) ────────────────────────────────────────

const PRICE_IDS: Record<PlanId, Record<BillingType, string>> = {
  founder: {
    recurring: process.env.STRIPE_PRICE_SUB_FOUNDER!,
    one_time:  process.env.STRIPE_PRICE_UNIT_FOUNDER!,
  },
  starter: {
    recurring: process.env.STRIPE_PRICE_SUB_STARTER!,
    one_time:  process.env.STRIPE_PRICE_UNIT_STARTER!,
  },
  growth: {
    recurring: process.env.STRIPE_PRICE_SUB_GROWTH!,
    one_time:  process.env.STRIPE_PRICE_UNIT_GROWTH!,
  },
  pro: {
    recurring: process.env.STRIPE_PRICE_SUB_PRO!,
    one_time:  process.env.STRIPE_PRICE_UNIT_PRO!,
  },
};

// ─── StripeProvider ───────────────────────────────────────────────────────────

export class StripeProvider implements PaymentProvider {
  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const priceId = PRICE_IDS[params.plan][params.billingType];
    const isSubscription = params.billingType === "recurring";

    const session = await stripeClient.checkout.sessions.create({
      mode: isSubscription ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: params.merchantEmail,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        merchant_id: params.merchantId,
        plan: params.plan,
        billing_type: params.billingType,
      },
      // Pasar metadata también a la suscripción para que llegue al webhook
      ...(isSubscription && {
        subscription_data: {
          metadata: {
            merchant_id: params.merchantId,
            plan: params.plan,
            billing_type: params.billingType,
          },
        },
      }),
    });

    return {
      checkoutUrl: session.url!,
      sessionId: session.id,
    };
  }

  async handleWebhook(rawBody: string, signature: string): Promise<WebhookEvent> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    let event: Stripe.Event;

    try {
      event = stripeClient.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new Error("Invalid Stripe webhook signature");
    }

    return this.normalizeEvent(event);
  }

  async cancelSubscription(externalSubscriptionId: string): Promise<void> {
    await stripeClient.subscriptions.cancel(externalSubscriptionId);
  }

  // ─── Normaliza eventos de Stripe al formato genérico ───────────────────────

  private normalizeEvent(event: Stripe.Event): WebhookEvent {
    // Usamos any para los objetos del evento porque los tipos de Stripe
    // cambian entre versiones del SDK. La lógica de negocio es la misma.
    const obj = event.data.object as any;

    switch (event.type) {

      // Pago one-time completado
      case "checkout.session.completed": {
        if (obj.mode !== "payment") break;
        return {
          type: "payment.succeeded",
          merchantId: obj.metadata?.merchant_id ?? "",
          plan: (obj.metadata?.plan ?? "starter") as PlanId,
          billingType: "one_time",
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };
      }

      // Suscripción activada/renovada
      case "invoice.payment_succeeded": {
        const metadata = obj.subscription_details?.metadata
          ?? obj.subscription?.metadata
          ?? {};
        const periodEnd = obj.lines?.data?.[0]?.period?.end;
        return {
          type: "subscription.activated",
          merchantId: metadata.merchant_id ?? "",
          plan: (metadata.plan ?? "starter") as PlanId,
          billingType: "recurring",
          externalSubscriptionId: obj.subscription?.id ?? obj.subscription,
          periodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
        };
      }

      // Suscripción cancelada por el usuario
      case "customer.subscription.deleted": {
        return {
          type: "subscription.cancelled",
          merchantId: obj.metadata?.merchant_id ?? "",
          plan: (obj.metadata?.plan ?? "starter") as PlanId,
          billingType: "recurring",
          externalSubscriptionId: obj.id,
        };
      }

      // Pago fallido → expirar
      case "invoice.payment_failed": {
        const metadata = obj.subscription_details?.metadata
          ?? obj.subscription?.metadata
          ?? {};
        return {
          type: "subscription.expired",
          merchantId: metadata.merchant_id ?? "",
          plan: (metadata.plan ?? "starter") as PlanId,
          billingType: "recurring",
          externalSubscriptionId: obj.subscription?.id ?? obj.subscription,
        };
      }
    }

    return {
      type: "unknown",
      merchantId: "",
      plan: "starter",
      billingType: "one_time",
    };
  }
}
