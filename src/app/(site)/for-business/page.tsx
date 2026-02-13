import Link from "next/link";
import { COLORS } from "@/config/colors";
import { WhatsAppShareButton } from "@/components/ui/whatsapp-share-button";
import { PricingSection } from "@/components/pricing/pricing-section";
import {
  Store,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Users,
  BarChart3,
  Shield,
  Zap,
  Target,
  Megaphone,
  Clock,
  CreditCard,
  Eye,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Para Comercios - Promii",
  description:
    "Atrae clientes nuevos y aumenta tus ventas con Promii. Publica promociones, conecta con influencers y gestiona todo desde un panel. Desde $17/mes.",
  openGraph: {
    title: "Haz crecer tu negocio con Promii",
    description: "Publica promociones verificadas, conecta con influencers locales y atrae nuevos clientes. Planes desde $17/mes.",
    type: "website",
    url: "https://promii.shop/for-business",
  },
  twitter: {
    card: "summary_large_image",
    title: "Haz crecer tu negocio con Promii",
    description: "Publica promociones verificadas, conecta con influencers locales y atrae nuevos clientes. Planes desde $17/mes.",
  },
};

function StepCard({
  number,
  icon: Icon,
  title,
  description,
  color,
  bg,
}: {
  number: number;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      className="relative rounded-2xl border p-6 transition-all duration-200 hover:shadow-lg"
      style={{
        backgroundColor: COLORS.background.primary,
        borderColor: COLORS.border.light,
      }}
    >
      <div
        className="absolute -top-3 -left-1 flex size-8 items-center justify-center rounded-full text-sm font-bold"
        style={{ backgroundColor: color, color: "white" }}
      >
        {number}
      </div>
      <div
        className="flex size-12 items-center justify-center rounded-xl mb-4"
        style={{ backgroundColor: bg }}
      >
        <Icon className="size-6" style={{ color }} />
      </div>
      <h3 className="text-base font-bold mb-2" style={{ color: COLORS.text.primary }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: COLORS.text.secondary }}>
        {description}
      </p>
    </div>
  );
}

function BenefitItem({ icon: Icon, title, description, color, bg }: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="flex size-10 items-center justify-center rounded-xl shrink-0"
        style={{ backgroundColor: bg }}
      >
        <Icon className="size-5" style={{ color }} />
      </div>
      <div>
        <h3 className="text-sm font-bold mb-1" style={{ color: COLORS.text.primary }}>
          {title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: COLORS.text.secondary }}>
          {description}
        </p>
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/70 mt-1">{label}</div>
    </div>
  );
}

export default function ForBusinessPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background.secondary }}>
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Hero */}
        <section
          className="relative overflow-hidden rounded-2xl p-8 md:p-12 mb-12"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary.dark} 0%, ${COLORS.primary.main} 50%, ${COLORS.primary.light} 100%)`,
          }}
        >
          <div
            className="absolute -right-20 -top-20 size-80 rounded-full opacity-15 blur-3xl"
            style={{ backgroundColor: COLORS.accent.main }}
          />
          <div
            className="absolute -left-10 -bottom-10 size-60 rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: "#fff" }}
          />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
            >
              <Sparkles className="size-3.5" />
              Plan Founder disponible por tiempo limitado
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
              Atrae clientes nuevos desde $17/mes
            </h1>
            <p className="text-base md:text-lg leading-relaxed text-white/80 mb-8">
              Publica promociones verificadas en Promii, conecta con influencers locales que promuevan tu negocio y gestiona todo desde un panel intuitivo. Sin contratos largos.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/business/apply"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: COLORS.accent.main,
                  color: "white",
                }}
              >
                Registrar mi negocio
                <ArrowRight className="size-4" />
              </Link>
              <WhatsAppShareButton
                message="Mira esta plataforma para publicar promociones de tu negocio y conectar con influencers en Venezuela. Planes desde $17/mes 🚀 https://promii.shop/for-business"
                variant="hero"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-10 grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/20">
            <StatItem value="$17" label="Desde / mes" />
            <StatItem value="70%" label="Descuento máx." />
            <StatItem value="0%" label="Comisión de ventas" />
          </div>
        </section>

        {/* Problema / Solución */}
        <section
          className="rounded-2xl border p-8 md:p-10 mb-12"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4"
                style={{ backgroundColor: COLORS.error.lighter, color: COLORS.error.main }}
              >
                El problema
              </div>
              <h3 className="text-lg font-bold mb-3" style={{ color: COLORS.text.primary }}>
                Conseguir clientes es caro y difícil
              </h3>
              <ul className="space-y-2.5">
                {[
                  "Publicidad en redes sin resultados claros",
                  "No sabes si la promo realmente trae gente",
                  "Influencers que cobran sin garantías",
                  "Plataformas que se quedan con un % de tu venta",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm" style={{ color: COLORS.text.secondary }}>
                    <span className="mt-1 size-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS.error.main }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4"
                style={{ backgroundColor: COLORS.success.lighter, color: COLORS.success.main }}
              >
                La solución
              </div>
              <h3 className="text-lg font-bold mb-3" style={{ color: COLORS.text.primary }}>
                Promii hace el trabajo por ti
              </h3>
              <ul className="space-y-2.5">
                {[
                  "Publica promos y la gente te encuentra",
                  "Cada venta se rastrea con códigos únicos",
                  "Influencers promueven a cambio de comisión real",
                  "Pagas una suscripción fija, sin comisiones ocultas",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm" style={{ color: COLORS.text.secondary }}>
                    <CheckCircle className="mt-0.5 size-4 shrink-0" style={{ color: COLORS.success.main }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
              ¿Cómo funciona?
            </h2>
            <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
              En 4 pasos tu negocio está en Promii
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StepCard
              number={1}
              icon={Store}
              title="Registra tu negocio"
              description="Completa el formulario de aplicación con los datos de tu comercio. Te aprobamos en menos de 48 horas."
              color={COLORS.primary.main}
              bg={COLORS.primary.lighter}
            />
            <StepCard
              number={2}
              icon={Megaphone}
              title="Publica promos"
              description="Crea promociones con fotos, precios, descuentos y fechas. Aparecen en la plataforma al instante."
              color={COLORS.accent.main}
              bg={COLORS.accent.lighter}
            />
            <StepCard
              number={3}
              icon={Users}
              title="Conecta influencers"
              description="Acepta solicitudes de influencers que quieren promover tus ofertas a cambio de comisión."
              color={COLORS.warning.main}
              bg={COLORS.warning.lighter}
            />
            <StepCard
              number={4}
              icon={BarChart3}
              title="Mide y crece"
              description="Valida códigos, mide tus ventas y optimiza tus promociones desde tu panel de control."
              color={COLORS.success.main}
              bg={COLORS.success.lighter}
            />
          </div>
        </section>

        {/* Beneficios */}
        <section
          className="rounded-2xl border p-8 md:p-10 mb-12"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
              Todo lo que necesitas para vender más
            </h2>
            <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
              Herramientas diseñadas para comercios en Venezuela
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <BenefitItem
              icon={Eye}
              title="Visibilidad garantizada"
              description="Tu negocio aparece en la plataforma, en búsquedas por categoría y ciudad. Los clientes te encuentran."
              color={COLORS.primary.main}
              bg={COLORS.primary.lighter}
            />
            <BenefitItem
              icon={Target}
              title="Marketing con influencers"
              description="Conecta con creadores de contenido locales que promueven tu marca a cambio de comisión por venta real."
              color={COLORS.accent.main}
              bg={COLORS.accent.lighter}
            />
            <BenefitItem
              icon={BarChart3}
              title="Panel de métricas"
              description="Dashboard completo con estadísticas de ventas, códigos canjeados y rendimiento de influencers."
              color={COLORS.info.main}
              bg={COLORS.info.lighter}
            />
            <BenefitItem
              icon={CreditCard}
              title="Sin comisiones por venta"
              description="Pagas una suscripción fija mensual. No cobramos porcentaje de tus ventas. Todo lo que generas es tuyo."
              color={COLORS.success.main}
              bg={COLORS.success.lighter}
            />
            <BenefitItem
              icon={Zap}
              title="Publicación inmediata"
              description="Crea y publica promociones en minutos. Sin esperas de aprobación. Tú controlas tu contenido."
              color={COLORS.warning.main}
              bg={COLORS.warning.lighter}
            />
            <BenefitItem
              icon={Shield}
              title="Validación segura"
              description="Sistema de códigos únicos para cada compra. Valida al instante desde tu celular y evita fraudes."
              color={COLORS.discount.main}
              bg={COLORS.discount.main + "15"}
            />
          </div>
        </section>

        {/* Precios */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
              Planes simples, sin sorpresas
            </h2>
            <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
              Elige el que mejor se adapte a tu negocio. Cancela cuando quieras.
            </p>
          </div>
          <PricingSection />
        </section>

        {/* Comparación */}
        <section
          className="rounded-2xl border p-8 md:p-10 mb-12"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: COLORS.text.primary }}>
            Promii vs. la competencia
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderColor: COLORS.border.light }}>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: COLORS.text.secondary }}>Característica</th>
                  <th className="text-center py-3 px-4 font-bold" style={{ color: COLORS.primary.main }}>Promii</th>
                  <th className="text-center py-3 px-4 font-semibold" style={{ color: COLORS.text.secondary }}>Otros</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Comisión por venta", promii: "0%", other: "15-30%" },
                  { feature: "Marketing con influencers", promii: "Incluido", other: "No incluido" },
                  { feature: "Panel de métricas", promii: "Incluido", other: "Extra o no disponible" },
                  { feature: "Validación de códigos", promii: "Al instante", other: "Manual" },
                  { feature: "Contratos largos", promii: "Sin contrato", other: "6-12 meses" },
                  { feature: "Costo mensual", promii: "Desde $17", other: "$50-200+" },
                ].map((row) => (
                  <tr key={row.feature} className="border-t" style={{ borderColor: COLORS.border.light }}>
                    <td className="py-3 px-4" style={{ color: COLORS.text.primary }}>{row.feature}</td>
                    <td className="py-3 px-4 text-center font-semibold" style={{ color: COLORS.success.main }}>{row.promii}</td>
                    <td className="py-3 px-4 text-center" style={{ color: COLORS.text.tertiary }}>{row.other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section
          className="rounded-2xl border p-8 md:p-10 mb-12"
          style={{
            backgroundColor: COLORS.primary.lighter + "40",
            borderColor: COLORS.primary.light + "30",
          }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.text.primary }}>
            Preguntas frecuentes
          </h2>
          <div className="space-y-5">
            {[
              {
                q: "¿Cuánto cuesta publicar una promoción?",
                a: "Nada adicional. Cada plan incluye un número de promiis activos. Si necesitas más, puedes agregar extras por $5/mes cada uno.",
              },
              {
                q: "¿Cobran comisión por mis ventas?",
                a: "No. Promii cobra una suscripción fija mensual. El 100% de tus ventas es tuyo.",
              },
              {
                q: "¿Necesito conocimientos técnicos?",
                a: "Para nada. El panel es tan fácil como publicar en Instagram. Creas la promo, subes fotos y listo.",
              },
              {
                q: "¿Qué pasa si quiero cancelar?",
                a: "Cancelas cuando quieras sin penalización. No hay contratos de permanencia.",
              },
              {
                q: "¿Los influencers me cobran aparte?",
                a: "Las comisiones de influencers las negocias directamente con ellos. Promii solo facilita la conexión.",
              },
            ].map((faq) => (
              <div key={faq.q}>
                <h3 className="text-sm font-bold mb-1" style={{ color: COLORS.text.primary }}>
                  {faq.q}
                </h3>
                <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link
              href="/faq"
              className="text-sm font-semibold inline-flex items-center gap-1 transition-colors hover:underline"
              style={{ color: COLORS.primary.main }}
            >
              Ver todas las preguntas frecuentes
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>

        {/* CTA Final */}
        <section
          className="rounded-2xl p-8 md:p-12 text-center"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary.dark} 0%, ${COLORS.primary.main} 50%, ${COLORS.primary.light} 100%)`,
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-4"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
          >
            <Clock className="size-3.5" />
            Plan Founder por tiempo limitado — $17/mes
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Haz crecer tu negocio hoy
          </h2>
          <p className="text-base text-white/80 max-w-lg mx-auto mb-8">
            Únete a Promii y empieza a atraer clientes nuevos con promociones verificadas e influencers locales.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/business/apply"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: COLORS.accent.main,
                color: "white",
              }}
            >
              Registrar mi negocio
              <ArrowRight className="size-5" />
            </Link>
            <WhatsAppShareButton
              message="Mira esta plataforma para publicar promociones de tu negocio y conectar con influencers en Venezuela. Planes desde $17/mes 🚀 https://promii.shop/for-business"
              variant="hero"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
