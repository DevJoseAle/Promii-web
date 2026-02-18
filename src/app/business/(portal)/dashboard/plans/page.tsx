"use client";

import { useState, useEffect } from "react";
import { Check, Crown, Sparkles, Rocket, Building2, Loader2, BadgeCheck } from "lucide-react";
import { COLORS } from "@/config/colors";
import { useAuth } from "@/lib/context/AuthContext";
import { supabase } from "@/lib/supabase/supabase.client";
import { PLANS } from "@/lib/payments/types";
import type { PlanId } from "@/lib/payments/types";
import { PlanCheckoutModal } from "./plan-checkout-modal";

// ─── Config visual de cada plan ───────────────────────────────────────────────

const PLAN_META: Record<
  PlanId,
  {
    badge?: string;
    badgeColor: string;
    badgeBg: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    description: string;
    features: string[];
    highlight?: boolean;
  }
> = {
  founder: {
    badge: "Solo 20 cupos",
    badgeColor: "#7C3AED",
    badgeBg: "#F3E8FF",
    icon: Crown,
    iconColor: COLORS.primary.main,
    iconBg: COLORS.primary.lighter,
    description: "Para los primeros 20 comercios que crean en Promii",
    features: [
      "Hasta 5 Promiis activos",
      "Hasta 2 influencers activos",
      "Badge exclusivo Founder",
      "Acceso anticipado a nuevas funciones",
      "Precio garantizado por 24 meses",
    ],
  },
  starter: {
    icon: Sparkles,
    badgeColor: COLORS.success.main,
    badgeBg: COLORS.success.lighter,
    iconColor: COLORS.success.main,
    iconBg: COLORS.success.lighter,
    description: "Ideal para comercios que están comenzando",
    features: [
      "Hasta 5 Promiis activos",
      "1 influencer activo",
      "Métricas básicas",
      "Soporte estándar",
    ],
  },
  growth: {
    badge: "Popular",
    badgeColor: COLORS.info.dark,
    badgeBg: COLORS.info.lighter,
    icon: Rocket,
    iconColor: COLORS.info.main,
    iconBg: COLORS.info.lighter,
    description: "Para negocios que ya están moviendo volumen",
    features: [
      "Hasta 20 Promiis activos",
      "Hasta 5 influencers activos",
      "Badge Comercio Verificado",
      "Métricas avanzadas",
      "Soporte prioritario",
    ],
    highlight: true,
  },
  pro: {
    badge: "Pronto",
    badgeColor: COLORS.warning.dark,
    badgeBg: COLORS.warning.lighter,
    icon: Building2,
    iconColor: COLORS.warning.main,
    iconBg: COLORS.warning.lighter,
    description: "Para empresas grandes y multi-sucursal",
    features: [
      "Hasta 100 Promiis activos",
      "Hasta 20 influencers activos",
      "Multi-sucursal",
      "Manager dedicado",
    ],
  },
};

// ─── Tipo del plan activo del merchant ────────────────────────────────────────

type MerchantPlan = {
  plan_id: string;
  plan_status: string;
  plan_end_at: string | null;
  monthly_promii_limit: number;
  contact_email: string;
};

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: "Activo",    color: COLORS.success.dark, bg: COLORS.success.lighter },
  cancelled: { label: "Cancelado", color: COLORS.error.dark,   bg: COLORS.error.lighter },
  expired:   { label: "Expirado",  color: COLORS.warning.dark, bg: COLORS.warning.lighter },
};

// ─── Componente principal ─────────────────────────────────────────────────────

export default function MerchantPlansPage() {
  const { user } = useAuth();

  const [merchantPlan, setMerchantPlan] = useState<MerchantPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);

  // Detectar si volvió de Stripe con ?payment=success o ?payment=cancelled
  const [paymentMsg, setPaymentMsg] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const timeoutId = payment === "cancelled"
      ? setTimeout(() => {
          setPaymentMsg("El pago fue cancelado. Puedes intentarlo de nuevo cuando quieras.");
        }, 0)
      : null;
    // Limpiar el query param sin recargar
    if (payment) {
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      url.searchParams.delete("plan");
      window.history.replaceState({}, "", url.toString());
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    async function fetchPlan() {
      const { data } = await supabase
        .from("merchants")
        .select("plan_id, plan_status, plan_end_at, monthly_promii_limit, contact_email")
        .eq("id", user!.id)
        .single();

      setMerchantPlan(data ?? null);
      setLoadingPlan(false);
    }

    fetchPlan();
  }, [user]);

  const activePlan = merchantPlan?.plan_status === "active" ? merchantPlan : null;
  const planOrder: PlanId[] = ["founder", "starter", "growth", "pro"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
          Planes y Precios
        </h1>
        <p className="text-sm mt-1" style={{ color: COLORS.text.secondary }}>
          Elige el plan ideal para tu negocio. Sin contratos largos, cancela cuando quieras.
        </p>
      </div>

      {/* Mensaje de cancelación de Stripe */}
      {paymentMsg && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: COLORS.warning.lighter, color: COLORS.warning.dark }}
        >
          {paymentMsg}
        </div>
      )}

      {/* Plan actual */}
      {loadingPlan ? (
        <div className="flex items-center gap-2 text-sm" style={{ color: COLORS.text.tertiary }}>
          <Loader2 className="size-4 animate-spin" />
          Cargando tu plan actual…
        </div>
      ) : activePlan ? (
        <div
          className="rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{
            backgroundColor: COLORS.background.secondary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3">
            <BadgeCheck className="size-6 shrink-0" style={{ color: COLORS.success.main }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                Plan actual:{" "}
                <span style={{ color: COLORS.primary.main }}>
                  {PLANS[activePlan.plan_id as PlanId]?.label ?? activePlan.plan_id}
                </span>
              </p>
              {activePlan.plan_end_at && (
                <p className="text-xs mt-0.5" style={{ color: COLORS.text.tertiary }}>
                  Válido hasta{" "}
                  {new Date(activePlan.plan_end_at).toLocaleDateString("es-VE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
          <span
            className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold"
            style={{
              backgroundColor: STATUS_LABEL[activePlan.plan_status]?.bg ?? COLORS.neutral[100],
              color: STATUS_LABEL[activePlan.plan_status]?.color ?? COLORS.text.secondary,
            }}
          >
            {STATUS_LABEL[activePlan.plan_status]?.label ?? activePlan.plan_status}
          </span>
        </div>
      ) : null}

      {/* Grid de planes */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {planOrder.map((planId) => {
          const config = PLAN_META[planId];
          const plan = PLANS[planId];
          const Icon = config.icon;
          const isCurrent =
            activePlan?.plan_id === planId;
          const isPromo = planId === "pro"; // próximamente

          return (
            <div
              key={planId}
              className="relative rounded-2xl border p-6 flex flex-col transition-all duration-200 hover:shadow-lg"
              style={{
                backgroundColor: COLORS.background.primary,
                borderColor: config.highlight ? COLORS.primary.main : COLORS.border.light,
                borderWidth: config.highlight ? 2 : 1,
              }}
            >
              {/* Badge */}
              {config.badge && (
                <div
                  className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: config.badgeBg, color: config.badgeColor }}
                >
                  {config.badge}
                </div>
              )}

              {/* Icon + Name */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex size-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: config.iconBg }}
                >
                  <Icon className="size-5" style={{ color: config.iconColor }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: COLORS.text.primary }}>
                  {plan.label}
                </h3>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold" style={{ color: COLORS.text.primary }}>
                    ${plan.priceUsd}
                  </span>
                  <span className="text-sm" style={{ color: COLORS.text.tertiary }}>
                    /mes
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm mb-5" style={{ color: COLORS.text.secondary }}>
                {config.description}
              </p>

              {/* Features */}
              <ul className="space-y-2.5 mb-6 flex-1">
                {config.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      className="size-4 mt-0.5 shrink-0"
                      style={{ color: config.iconColor }}
                    />
                    <span className="text-sm" style={{ color: COLORS.text.secondary }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isPromo ? (
                <button
                  disabled
                  className="block w-full text-center rounded-xl px-6 py-3 text-sm font-semibold opacity-50 cursor-not-allowed"
                  style={{
                    backgroundColor: COLORS.background.tertiary,
                    color: COLORS.text.secondary,
                  }}
                >
                  Próximamente
                </button>
              ) : isCurrent ? (
                <div
                  className="block w-full text-center rounded-xl px-6 py-3 text-sm font-semibold"
                  style={{ backgroundColor: COLORS.success.lighter, color: COLORS.success.dark }}
                >
                  Plan actual
                </div>
              ) : (
                <button
                  onClick={() => setSelectedPlan(planId)}
                  className="block w-full text-center rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-105"
                  style={
                    config.highlight
                      ? {
                          background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
                          color: "white",
                        }
                      : {
                          backgroundColor: COLORS.background.tertiary,
                          color: COLORS.text.primary,
                          border: `1px solid ${COLORS.border.main}`,
                        }
                  }
                >
                  Contratar
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add-ons */}
      <div
        className="rounded-xl border p-5 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm"
        style={{ backgroundColor: COLORS.background.secondary, borderColor: COLORS.border.light }}
      >
        <span className="font-semibold" style={{ color: COLORS.text.primary }}>
          ¿Necesitas más?
        </span>
        <div className="flex items-center gap-6 flex-wrap justify-center">
          <div className="flex items-center gap-2">
            <span
              className="rounded-lg px-2.5 py-1 text-xs font-bold"
              style={{ backgroundColor: COLORS.accent.lighter, color: COLORS.accent.dark }}
            >
              +$5/mes
            </span>
            <span style={{ color: COLORS.text.secondary }}>Promii adicional activo</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="rounded-lg px-2.5 py-1 text-xs font-bold"
              style={{ backgroundColor: COLORS.primary.lighter, color: COLORS.primary.dark }}
            >
              +$7/mes
            </span>
            <span style={{ color: COLORS.text.secondary }}>Influencer adicional</span>
          </div>
        </div>
      </div>

      {/* Modal de checkout */}
      {selectedPlan && merchantPlan && (
        <PlanCheckoutModal
          planId={selectedPlan}
          merchantEmail={merchantPlan.contact_email}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}
