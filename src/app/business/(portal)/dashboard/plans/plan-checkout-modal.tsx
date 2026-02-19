"use client";

import { useState } from "react";
import { X, Loader2, CreditCard, MessageCircle, Check } from "lucide-react";
import { COLORS } from "@/config/colors";
import { PLANS } from "@/lib/payments/types";
import type { PlanId, BillingType } from "@/lib/payments/types";
import { createPlanStripeCheckout } from "@/lib/services/payments/stripe-checkout.service";

// Número de WhatsApp para pagos en BsF — actualizar en producción
const WHATSAPP_NUMBER = "584120000000"; // +58 412-000-0000

type Props = {
  planId: PlanId;
  merchantEmail: string;
  onClose: () => void;
};

export function PlanCheckoutModal({ planId, merchantEmail, onClose }: Props) {
  const plan = PLANS[planId];
  const [billingType, setBillingType] = useState<BillingType>("recurring");
  const [loading, setLoading] = useState<"stripe" | "whatsapp" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Stripe checkout ──────────────────────────────────────────────────────────

  async function handleStripe() {
    setLoading("stripe");
    setError(null);

    try {
      const data = await createPlanStripeCheckout({ plan: planId, billingType });
      window.location.href = data.checkoutUrl;
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
      setLoading(null);
    }
  }

  // ── WhatsApp ─────────────────────────────────────────────────────────────────

  function handleWhatsApp() {
    setLoading("whatsapp");

    const billingLabel = billingType === "recurring" ? "Mensual" : "Pago único (30 días)";
    const msg = encodeURIComponent(
      `Hola! Quiero contratar el plan *${plan.label}* en Promii.\n\n` +
        `📧 Email de comercio: ${merchantEmail}\n` +
        `📦 Plan: ${plan.label} – $${plan.priceUsd}/mes\n` +
        `🔄 Modalidad: ${billingLabel}\n` +
        `💳 Método de pago: Bolívares (transferencia / Pago Móvil)`
    );

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
    setLoading(null);
    onClose();
  }

  const isRecurring = billingType === "recurring";

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: COLORS.overlay }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl"
        style={{ backgroundColor: COLORS.background.primary }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: COLORS.border.light }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: COLORS.text.primary }}>
              Contratar Plan {plan.label}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: COLORS.text.secondary }}>
              ${plan.priceUsd}/mes · {plan.monthlyPromiiLimit} Promiis · {plan.maxInfluencers} influencer{plan.maxInfluencers > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
          >
            <X className="size-5" style={{ color: COLORS.text.secondary }} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Billing type toggle */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: COLORS.text.tertiary }}>
              Modalidad
            </p>
            <div
              className="grid grid-cols-2 gap-2 rounded-xl p-1"
              style={{ backgroundColor: COLORS.background.tertiary }}
            >
              {(["recurring", "one_time"] as BillingType[]).map((type) => {
                const label = type === "recurring" ? "Mensual" : "Pago único";
                const sub = type === "recurring" ? "Se renueva cada mes" : "Activo por 30 días";
                const active = billingType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setBillingType(type)}
                    className="flex flex-col items-center rounded-lg px-3 py-3 text-center transition-all"
                    style={{
                      backgroundColor: active ? COLORS.background.primary : "transparent",
                      boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    }}
                  >
                    <span
                      className="text-sm font-semibold"
                      style={{ color: active ? COLORS.primary.main : COLORS.text.secondary }}
                    >
                      {label}
                    </span>
                    <span className="text-xs mt-0.5" style={{ color: COLORS.text.tertiary }}>
                      {sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price summary */}
          <div
            className="rounded-xl p-4 flex items-center justify-between"
            style={{ backgroundColor: COLORS.background.secondary, borderColor: COLORS.border.light, border: "1px solid" }}
          >
            <span className="text-sm font-medium" style={{ color: COLORS.text.secondary }}>
              {isRecurring ? "Cobro mensual" : "Pago único"}
            </span>
            <span className="text-xl font-bold" style={{ color: COLORS.text.primary }}>
              ${plan.priceUsd}
              <span className="text-sm font-normal ml-1" style={{ color: COLORS.text.tertiary }}>
                USD
              </span>
            </span>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: COLORS.error.lighter, color: COLORS.error.dark }}>
              {error}
            </p>
          )}

          {/* Payment options */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.text.tertiary }}>
              Método de pago
            </p>

            {/* Stripe */}
            <button
              onClick={handleStripe}
              disabled={loading !== null}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
                color: "white",
              }}
            >
              {loading === "stripe" ? (
                <Loader2 className="size-5 animate-spin shrink-0" />
              ) : (
                <CreditCard className="size-5 shrink-0" />
              )}
              <div className="flex-1">
                <span className="font-semibold text-sm block">Pagar con tarjeta (USD)</span>
                <span className="text-xs opacity-80">Visa, Mastercard, Amex · Stripe</span>
              </div>
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              disabled={loading !== null}
              className="w-full flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: COLORS.background.primary,
                borderColor: COLORS.border.main,
              }}
            >
              {loading === "whatsapp" ? (
                <Loader2 className="size-5 animate-spin shrink-0" style={{ color: "#25D366" }} />
              ) : (
                <MessageCircle className="size-5 shrink-0" style={{ color: "#25D366" }} />
              )}
              <div className="flex-1">
                <span className="font-semibold text-sm block" style={{ color: COLORS.text.primary }}>
                  Pagar en Bolívares
                </span>
                <span className="text-xs" style={{ color: COLORS.text.tertiary }}>
                  Transferencia / Pago Móvil · WhatsApp
                </span>
              </div>
            </button>
          </div>

          {/* Features reminder */}
          <div
            className="rounded-xl p-3 space-y-1.5"
            style={{ backgroundColor: COLORS.background.tertiary }}
          >
            {[
              `${plan.monthlyPromiiLimit} Promiis activos al mismo tiempo`,
              `${plan.maxInfluencers} influencer${plan.maxInfluencers > 1 ? "s" : ""} activo${plan.maxInfluencers > 1 ? "s" : ""}`,
              isRecurring ? "Cancela cuando quieras" : "Sin renovación automática",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <Check className="size-3.5 shrink-0" style={{ color: COLORS.success.main }} />
                <span className="text-xs" style={{ color: COLORS.text.secondary }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
