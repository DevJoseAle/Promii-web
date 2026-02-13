"use client";

import Link from "next/link";
import { COLORS } from "@/config/colors";
import { Check, Crown, Sparkles, Rocket, Building2 } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  price: number;
  badge?: string;
  badgeColor: string;
  badgeBg: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  description: string;
  features: string[];
  highlight?: boolean;
  cta: string;
  note?: string;
};

const PLANS: Plan[] = [
  {
    id: "founder",
    name: "Founder",
    price: 17,
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
    cta: "Ser Founder",
    note: "Precio garantizado por 24 meses",
  },
  {
    id: "starter",
    name: "Starter",
    price: 22,
    icon: Sparkles,
    badgeColor: COLORS.success.main,
    badgeBg: COLORS.success.lighter,
    iconColor: COLORS.success.main,
    iconBg: COLORS.success.lighter,
    description: "Ideal para comercios que están comenzando",
    features: [
      "Hasta 5 Promiis activos",
      "1 influencer activo",
      "Métricas básicas de rendimiento",
      "Soporte estándar",
    ],
    cta: "Comenzar",
  },
  {
    id: "growth",
    name: "Growth",
    price: 39,
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
      "Posibilidad de destacados en categoría",
    ],
    highlight: true,
    cta: "Elegir Growth",
  },
  {
    id: "pro",
    name: "Pro",
    price: 75,
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
      "Prioridad en visibilidad",
    ],
    cta: "Contactar",
    note: "Disponible próximamente",
  },
];

function PlanCard({ plan, compact }: { plan: Plan; compact?: boolean }) {
  const Icon = plan.icon;

  return (
    <div
      className="relative rounded-2xl border p-6 flex flex-col transition-all duration-200 hover:shadow-lg"
      style={{
        backgroundColor: COLORS.background.primary,
        borderColor: plan.highlight ? COLORS.primary.main : COLORS.border.light,
        borderWidth: plan.highlight ? 2 : 1,
      }}
    >
      {/* Badge */}
      {plan.badge && (
        <div
          className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-bold"
          style={{
            backgroundColor: plan.badgeBg,
            color: plan.badgeColor,
          }}
        >
          {plan.badge}
        </div>
      )}

      {/* Icon + Name */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex size-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: plan.iconBg }}
        >
          <Icon className="size-5" style={{ color: plan.iconColor }} />
        </div>
        <h3 className="text-lg font-bold" style={{ color: COLORS.text.primary }}>
          {plan.name}
        </h3>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold" style={{ color: COLORS.text.primary }}>
            ${plan.price}
          </span>
          <span className="text-sm" style={{ color: COLORS.text.tertiary }}>
            /mes
          </span>
        </div>
      </div>

      {/* Description */}
      {!compact && (
        <p className="text-sm mb-5" style={{ color: COLORS.text.secondary }}>
          {plan.description}
        </p>
      )}

      {/* Features */}
      <ul className="space-y-2.5 mb-6 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check
              className="size-4 mt-0.5 shrink-0"
              style={{ color: plan.iconColor }}
            />
            <span className="text-sm" style={{ color: COLORS.text.secondary }}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={plan.id === "pro" ? "mailto:negocios@promii.shop" : "/business/apply"}
        className="block w-full text-center rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-105"
        style={
          plan.highlight
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
        {plan.cta}
      </Link>

      {/* Note */}
      {plan.note && (
        <p className="mt-3 text-xs text-center" style={{ color: COLORS.text.tertiary }}>
          {plan.note}
        </p>
      )}
    </div>
  );
}

export function PricingSection({ compact }: { compact?: boolean }) {
  return (
    <section>
      {!compact && (
        <div className="text-center mb-10">
          <h2
            className="text-3xl font-bold tracking-tight"
            style={{ color: COLORS.text.primary }}
          >
            Planes para tu negocio
          </h2>
          <p className="mt-2 text-sm max-w-lg mx-auto" style={{ color: COLORS.text.secondary }}>
            Elige el plan que mejor se adapte a tu comercio. Sin contratos largos, cancela cuando quieras.
          </p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} compact={compact} />
        ))}
      </div>

      {/* Add-ons */}
      <div
        className="mt-8 rounded-xl border p-5 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm"
        style={{
          backgroundColor: COLORS.background.secondary,
          borderColor: COLORS.border.light,
        }}
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
    </section>
  );
}
