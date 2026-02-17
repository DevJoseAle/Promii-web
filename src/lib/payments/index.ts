import type { PaymentProvider } from "./types";
import { StripeProvider } from "./stripe/stripe.provider";

export type GatewayId = "stripe"; // | "pagomovil" | "otro" → agregar aquí

/**
 * Retorna la instancia del payment provider solicitado.
 * Agregar un gateway nuevo = crear su provider + añadir un case aquí.
 */
export function getPaymentProvider(gateway: GatewayId): PaymentProvider {
  switch (gateway) {
    case "stripe":
      return new StripeProvider();
    default:
      throw new Error(`Payment provider "${gateway}" not implemented`);
  }
}

// Re-exportar tipos para que el resto de la app solo importe de aquí
export type { PaymentProvider, CheckoutParams, CheckoutResult, WebhookEvent, PlanId, BillingType } from "./types";
export { PLANS } from "./types";
