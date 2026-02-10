import Link from "next/link";
import { Sparkles, CheckCircle2, Info, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreatePromiiDisclaimer } from "@/components/ui/merchant/promii-disclaimer";
import { COLORS } from "@/config/colors";

export default function CreatePromiiPage() {
  return (
    <div className="space-y-6">
      {/* Header con diseño consistente */}
      <div className="flex items-start gap-4">
        <div
          className="flex size-12 items-center justify-center rounded-xl shrink-0"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
          }}
        >
          <Sparkles className="size-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: COLORS.text.primary }}>
            Crear Promii
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: COLORS.text.secondary }}>
            Crea una promoción para tu negocio y publícala en Promii para atraer clientes.
          </p>
        </div>
      </div>

      {/* Main card con Section Card pattern */}
      <div
        className="rounded-xl border shadow-sm p-6"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Left: Explanation + CTA */}
          <section className="space-y-5">
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex size-10 items-center justify-center rounded-xl shrink-0"
                style={{ backgroundColor: COLORS.primary.lighter, color: COLORS.primary.main }}
              >
                <Sparkles className="size-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold" style={{ color: COLORS.text.primary }}>
                  ¿Qué es un Promii?
                </div>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: COLORS.text.secondary }}>
                  Un <span className="font-semibold" style={{ color: COLORS.text.primary }}>Promii</span> es una promoción
                  que publicas en Promii para que la gente la compre y la use en tu negocio.
                  Define el descuento, condiciones y vigencia. Tú ganas visibilidad, ventas y flujo de clientes.
                </p>
              </div>
            </div>

            {/* CTA row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                className="h-11 font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
                  color: COLORS.text.inverse,
                }}
              >
                <Link href="/business/dashboard/create-promii/new">
                  <Zap className="mr-2 size-4" />
                  Crear Promii
                </Link>
              </Button>

              <Button
                variant="outline"
                asChild
                className="h-11 transition-all duration-200 hover:scale-105"
                style={{
                  borderColor: COLORS.border.main,
                  color: COLORS.text.secondary,
                }}
              >
                <Link href="/business/dashboard">Volver al dashboard</Link>
              </Button>
            </div>

            {/* Disclaimer (solo si pending) */}
            <CreatePromiiDisclaimer />
          </section>

          {/* Right: Checklist + Tip */}
          <aside className="space-y-4">
            {/* Checklist card */}
            <div
              className="rounded-xl border shadow-sm p-5"
              style={{
                backgroundColor: COLORS.background.secondary,
                borderColor: COLORS.border.light,
              }}
            >
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" style={{ color: COLORS.primary.main }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                    Qué va a contener un Promii
                  </div>
                  <p className="mt-1 text-xs" style={{ color: COLORS.text.secondary }}>
                    Mientras más claro, más conversiones.
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-3 text-sm" style={{ color: COLORS.text.secondary }}>
                {[
                  "Título claro y atractivo",
                  "Descuento real (ej. 30–60%)",
                  "Condiciones simples",
                  "Vigencia y cupos definidos",
                  "Horarios de uso, dirección",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span
                      className="mt-0.5 inline-flex size-5 items-center justify-center rounded-full shrink-0 text-xs font-semibold"
                      style={{ backgroundColor: COLORS.primary.lighter, color: COLORS.primary.main }}
                    >
                      ✓
                    </span>
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tip card */}
            <div
              className="rounded-xl border shadow-sm p-5"
              style={{
                backgroundColor: COLORS.primary.lighter,
                borderColor: COLORS.border.light,
              }}
            >
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 size-5 shrink-0" style={{ color: COLORS.primary.main }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                    Tip: dinero del futuro
                  </div>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: COLORS.text.secondary }}>
                    Los Promiis con más vigencia de uso te permiten que la gente pueda comprar Promiis a futuro,
                    y tú puedas traer dinero <span className="font-semibold" style={{ color: COLORS.text.primary }}>del futuro</span>.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
