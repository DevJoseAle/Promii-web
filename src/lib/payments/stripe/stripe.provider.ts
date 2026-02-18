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
    try {
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
    } catch (error) {
      console.error("Error creating Stripe checkout session:", error);
      throw new Error("Failed to create checkout session");
    }
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
    switch (event.type) {

      // Pago one-time completado
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "payment") break;
        return {
          eventId: event.id,
          type: "payment.succeeded",
          merchantId: session.metadata?.merchant_id ?? "",
          plan: (session.metadata?.plan ?? "starter") as PlanId,
          billingType: "one_time",
          externalSubscriptionId: session.id,
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };
      }

      // Suscripción activada/renovada
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription | null;
          subscription_details?: { metadata?: Record<string, string> };
        };
        const subscription = typeof invoice.subscription === "string"
          ? null
          : invoice.subscription;
        const metadata = invoice.subscription_details?.metadata
          ?? subscription?.metadata
          ?? {};
        const periodEnd = invoice.lines?.data?.[0]?.period?.end;
        const externalSubscriptionId =
          subscription?.id ??
          (typeof invoice.subscription === "string"
            ? invoice.subscription
            : undefined);

        return {
          eventId: event.id,
          type: "subscription.activated",
          merchantId: metadata.merchant_id ?? "",
          plan: (metadata.plan ?? "starter") as PlanId,
          billingType: "recurring",
          externalSubscriptionId,
          periodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
        };
      }

      // Suscripción cancelada por el usuario
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        return {
          eventId: event.id,
          type: "subscription.cancelled",
          merchantId: subscription.metadata?.merchant_id ?? "",
          plan: (subscription.metadata?.plan ?? "starter") as PlanId,
          billingType: "recurring",
          externalSubscriptionId: subscription.id,
        };
      }

      // Pago fallido → expirar
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription | null;
          subscription_details?: { metadata?: Record<string, string> };
        };
        const subscription = typeof invoice.subscription === "string"
          ? null
          : invoice.subscription;
        const metadata = invoice.subscription_details?.metadata
          ?? subscription?.metadata
          ?? {};
        const externalSubscriptionId =
          subscription?.id ??
          (typeof invoice.subscription === "string"
            ? invoice.subscription
            : undefined);

        return {
          eventId: event.id,
          type: "subscription.expired",
          merchantId: metadata.merchant_id ?? "",
          plan: (metadata.plan ?? "starter") as PlanId,
          billingType: "recurring",
          externalSubscriptionId,
        };
      }
    }

    return {
      eventId: event.id,
      type: "unknown",
      merchantId: "",
      plan: "starter",
      billingType: "one_time",
    };
  }
}
