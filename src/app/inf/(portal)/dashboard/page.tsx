"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { COLORS } from "@/config/colors";
import {
  TrendingUp,
  DollarSign,
  Users,
  Sparkles,
  Code,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InfluencerDashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background.secondary }}>
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-5" style={{ color: COLORS.primary.main }} />
            <span className="text-sm font-semibold" style={{ color: COLORS.primary.main }}>
              Portal de Influencer
            </span>
          </div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: COLORS.text.primary }}
          >
            ¡Hola, {profile?.first_name || "Influencer"}!
          </h1>
          <p
            className="mt-2 text-base"
            style={{ color: COLORS.text.secondary }}
          >
            Bienvenido a tu portal de creador. Aquí podrás gestionar tus códigos y ver tus comisiones.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div
            className="rounded-xl border p-6"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className="flex size-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: COLORS.primary.lighter, color: COLORS.primary.main }}
              >
                <Code className="size-5" />
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
              0
            </div>
            <div className="text-sm" style={{ color: COLORS.text.secondary }}>
              Códigos activos
            </div>
          </div>

          <div
            className="rounded-xl border p-6"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className="flex size-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: COLORS.success.lighter, color: COLORS.success.main }}
              >
                <TrendingUp className="size-5" />
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
              0
            </div>
            <div className="text-sm" style={{ color: COLORS.text.secondary }}>
              Ventas generadas
            </div>
          </div>

          <div
            className="rounded-xl border p-6"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className="flex size-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: COLORS.warning.lighter, color: COLORS.warning.main }}
              >
                <DollarSign className="size-5" />
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
              $0.00
            </div>
            <div className="text-sm" style={{ color: COLORS.text.secondary }}>
              Comisiones ganadas
            </div>
          </div>

          <div
            className="rounded-xl border p-6"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className="flex size-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: COLORS.info.lighter, color: COLORS.info.main }}
              >
                <Users className="size-5" />
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
              0
            </div>
            <div className="text-sm" style={{ color: COLORS.text.secondary }}>
              Marcas colaborando
            </div>
          </div>
        </div>

        {/* Coming soon section */}
        <div
          className="rounded-xl border p-8"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary.lighter} 0%, ${COLORS.background.primary} 100%)`,
            borderColor: COLORS.border.light,
          }}
        >
          {/* Decorative element */}
          <div
            className="absolute -right-20 -top-20 size-64 rounded-full opacity-30 blur-3xl pointer-events-none"
            style={{ backgroundColor: COLORS.primary.main }}
          />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm mb-4"
              style={{
                backgroundColor: COLORS.background.primary,
                color: COLORS.primary.main,
              }}
            >
              <Sparkles className="size-3.5" />
              Próximamente
            </div>

            <h2
              className="text-2xl font-bold mb-3"
              style={{ color: COLORS.text.primary }}
            >
              Tu portal está en construcción
            </h2>

            <p
              className="text-base mb-6"
              style={{ color: COLORS.text.secondary }}
            >
              Estamos trabajando en las herramientas que necesitas: códigos de descuento, tracking de ventas, dashboard de comisiones y más.
            </p>

            <div className="flex gap-3 justify-center flex-wrap">
              <Button
                className="font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
                  color: COLORS.text.inverse,
                }}
                asChild
              >
                <a
                  href="/influencers"
                  className="inline-flex items-center gap-2"
                >
                  <Users className="size-4" />
                  Ver directorio de influencers
                  <ExternalLink className="size-4" />
                </a>
              </Button>

              <Button
                variant="outline"
                className="font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  borderColor: COLORS.border.main,
                  color: COLORS.text.primary,
                }}
                asChild
              >
                <a href="/" className="inline-flex items-center gap-2">
                  Explorar promiis
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <h3
            className="text-lg font-bold mb-4 flex items-center gap-2"
            style={{ color: COLORS.text.primary }}
          >
            <BarChart3 className="size-5" style={{ color: COLORS.primary.main }} />
            Funcionalidades próximas
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              className="rounded-lg border p-4"
              style={{
                backgroundColor: COLORS.background.secondary,
                borderColor: COLORS.border.light,
              }}
            >
              <div className="font-semibold text-sm mb-1" style={{ color: COLORS.text.primary }}>
                Códigos de descuento
              </div>
              <p className="text-xs" style={{ color: COLORS.text.secondary }}>
                Genera códigos únicos para compartir con tu audiencia
              </p>
            </div>

            <div
              className="rounded-lg border p-4"
              style={{
                backgroundColor: COLORS.background.secondary,
                borderColor: COLORS.border.light,
              }}
            >
              <div className="font-semibold text-sm mb-1" style={{ color: COLORS.text.primary }}>
                Tracking de ventas
              </div>
              <p className="text-xs" style={{ color: COLORS.text.secondary }}>
                Ve en tiempo real cuántas ventas generas
              </p>
            </div>

            <div
              className="rounded-lg border p-4"
              style={{
                backgroundColor: COLORS.background.secondary,
                borderColor: COLORS.border.light,
              }}
            >
              <div className="font-semibold text-sm mb-1" style={{ color: COLORS.text.primary }}>
                Comisiones
              </div>
              <p className="text-xs" style={{ color: COLORS.text.secondary }}>
                Calcula y retira tus ganancias fácilmente
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
