import Link from "next/link";
import { Sparkles, CheckCircle2, Info, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreatePromiiDisclaimer } from "@/components/ui/merchant/promii-disclaimer";
import { PendingBanner } from "@/components/ui/pending-banner";

export default function CreatePromiiPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Crear Promii
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Crea una promoción para tu negocio y publícala en Promii para atraer clientes.
          </p>
        </div>
      </div>  
      {/* Main card */}
      <div className="rounded-2xl border border-border bg-surface shadow-sm">
        <div className="p-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Left: Explanation + CTA */}
            <section className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="size-5" />
                </div>

                <div>
                  <div className="text-base font-semibold text-text-primary">
                    ¿Qué es un Promii?
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                    Un <span className="font-semibold text-text-primary">Promii</span> es una promoción
                    que publicas en Promii para que la gente la compre y la use en tu negocio.
                    Define el descuento, condiciones y vigencia. Tú ganas visibilidad, ventas y flujo de clientes.
                  </p>
                </div>
              </div>

              {/* CTA row */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild className="h-10 bg-primary text-white hover:bg-primary/90">
                  {/* Cuando tengas el form real, cambia a la ruta del form */}
                  <Link href="/business/dashboard/create-promii/new">
                    Crear Promii
                    <Zap className="ml-1 size-4" />
                  </Link>
                </Button>

                <Button variant="outline" asChild className="h-10">
                  <Link href="/business/dashboard">Volver al dashboard</Link>
                </Button>
              </div>

              {/* Disclaimer (solo si pending) */}
              <CreatePromiiDisclaimer />
            </section>

            {/* Right: Checklist + Tip */}
            <aside className="space-y-4">
              {/* Checklist card */}
              <div className="rounded-2xl border border-border bg-background/50 p-5">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-5 text-primary" />
                  <div>
                    <div className="text-sm font-semibold text-text-primary">
                      Qué va a contener un Promii
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">
                      Mientras más claro, más conversiones.
                    </p>
                  </div>
                </div>

                <ul className="mt-4 space-y-3 text-sm text-text-secondary">
                  {[
                    "Título claro y atractivo",
                    "Descuento real (ej. 30–60%)",
                    "Condiciones simples",
                    "Vigencia y cupos definidos",
                    "Horarios de uso, dirección",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                        ✓
                      </span>
                      <span className="leading-relaxed">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tip card */}
              <div className="rounded-2xl border border-border bg-primary/5 p-5">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-5 text-primary" />
                  <div>
                    <div className="text-sm font-semibold text-text-primary">
                      Tip: dinero del futuro ✨
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      Los Promiis con más vigencia de uso te permiten que la gente pueda comprar Promiis a futuro,
                      y tú puedas traer dinero <span className="font-semibold text-text-primary">del futuro</span>.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
