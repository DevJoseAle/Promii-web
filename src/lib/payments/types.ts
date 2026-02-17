// ─── Plan types ───────────────────────────────────────────────────────────────

export type PlanId = "founder" | "starter" | "growth" | "pro";
export type BillingType = "recurring" | "one_time";

export type PlanConfig = {
  id: PlanId;
  label: string;
  priceUsd: number;
  monthlyPromiiLimit: number;
  maxInfluencers: number;
};

export const PLANS: Record<PlanId, PlanConfig> = {
  founder: { id: "founder", label: "Founder", priceUsd: 17, monthlyPromiiLimit: 5, maxInfluencers: 2 },
  starter: { id: "starter", label: "Starter", priceUsd: 22, monthlyPromiiLimit: 5, maxInfluencers: 1 },
  growth:  { id: "growth",  label: "Growth",  priceUsd: 39, monthlyPromiiLimit: 20, maxInfluencers: 5 },
  pro:     { id: "pro",     label: "Pro",     priceUsd: 75, monthlyPromiiLimit: 100, maxInfluencers: 20 },
};

// ─── Checkout ─────────────────────────────────────────────────────────────────

export type CheckoutParams = {
  plan: PlanId;
  billingType: BillingType;
  merchantId: string;        // para metadata y actualizar Supabase en webhook
  merchantEmail: string;
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutResult = {
  checkoutUrl: string;
  sessionId: string;
};

// ─── Webhook event (normalizado, independiente del gateway) ───────────────────

export type WebhookEventType =
  | "payment.succeeded"      // pago completado (one-time o primer mes)
  | "subscription.activated" // suscripción activa
  | "subscription.cancelled" // cancelada por el usuario
  | "subscription.expired"   // expiró / falló el cobro
  | "unknown";

export type WebhookEvent = {
  type: WebhookEventType;
  merchantId: string;
  plan: PlanId;
  billingType: BillingType;
  externalSubscriptionId?: string; // ID de la suscripción en el gateway
  periodEnd?: Date;                // cuándo vence el período actual
};

// ─── Provider interface (contrato que todo gateway debe implementar) ──────────

export interface PaymentProvider {
  /**
   * Crea una sesión de checkout y retorna la URL para redirigir al merchant.
   */
  createCheckout(params: CheckoutParams): Promise<CheckoutResult>;

  /**
   * Procesa el payload del webhook y retorna un evento normalizado.
   * Cada gateway tiene su propio formato — esta función lo unifica.
   */
  handleWebhook(rawBody: string, signature: string): Promise<WebhookEvent>;

  /**
   * Cancela una suscripción activa en el gateway.
   */
  cancelSubscription(externalSubscriptionId: string): Promise<void>;
}
