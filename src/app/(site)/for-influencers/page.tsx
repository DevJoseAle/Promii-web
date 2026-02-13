import Link from "next/link";
import { COLORS } from "@/config/colors";
import { WhatsAppShareButton } from "@/components/ui/whatsapp-share-button";
import {
  Sparkles,
  DollarSign,
  Users,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Gift,
  Target,
  Clock,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programa de Influencers - Promii",
  description:
    "Monetiza tu audiencia con Promii. Comparte códigos de descuento, gana comisiones por cada venta y conecta con marcas verificadas en Venezuela.",
  openGraph: {
    title: "Monetiza tu audiencia con Promii",
    description: "Comparte códigos de descuento, gana comisiones por cada venta y conecta con marcas verificadas. 100% gratis.",
    type: "website",
    url: "https://promii.com/for-influencers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Monetiza tu audiencia con Promii",
    description: "Comparte códigos de descuento, gana comisiones por cada venta y conecta con marcas verificadas. 100% gratis.",
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

export default function ForInfluencersPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background.secondary }}>
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Hero */}
        <section
          className="relative overflow-hidden rounded-2xl p-8 md:p-12 mb-12"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
          }}
        >
          <div
            className="absolute -right-20 -top-20 size-80 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: "#fff" }}
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
              Cupos limitados para fundadores
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
              Monetiza tu audiencia sin invertir un centavo
            </h1>
            <p className="text-base md:text-lg leading-relaxed text-white/80 mb-8">
              Comparte códigos de descuento exclusivos con tu comunidad, gana comisiones por cada venta y conecta con marcas verificadas en toda Venezuela.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/inf/apply"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: COLORS.accent.main,
                  color: "white",
                }}
              >
                Aplicar ahora
                <ArrowRight className="size-4" />
              </Link>
              <WhatsAppShareButton
                message="Mira este programa para influencers en Venezuela. Puedes ganar comisiones compartiendo descuentos con tu audiencia, es gratis 👀 https://promii.com/for-influencers"
                variant="hero"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-10 grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">20%</div>
              <div className="text-xs text-white/70 mt-1">Comisión máx.</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">$0</div>
              <div className="text-xs text-white/70 mt-1">Sin costo de entrada</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">24/7</div>
              <div className="text-xs text-white/70 mt-1">Panel disponible</div>
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
              En 4 simples pasos empiezas a ganar
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StepCard
              number={1}
              icon={Users}
              title="Aplica al programa"
              description="Completa el formulario con tus datos y redes sociales. Nuestro equipo revisa tu perfil en menos de 48 horas."
              color={COLORS.primary.main}
              bg={COLORS.primary.lighter}
            />
            <StepCard
              number={2}
              icon={Target}
              title="Conecta con marcas"
              description="Explora comercios verificados en tu ciudad y envía solicitudes de partnership a los que te interesen."
              color={COLORS.accent.main}
              bg={COLORS.accent.lighter}
            />
            <StepCard
              number={3}
              icon={Gift}
              title="Comparte códigos"
              description="Genera códigos únicos para cada promoción y compártelos con tu audiencia en redes sociales."
              color={COLORS.warning.main}
              bg={COLORS.warning.lighter}
            />
            <StepCard
              number={4}
              icon={DollarSign}
              title="Gana comisiones"
              description="Por cada venta generada con tu código, recibes un porcentaje de comisión directo del merchant."
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
              ¿Por qué Promii?
            </h2>
            <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
              Beneficios que hacen la diferencia
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <BenefitItem
              icon={DollarSign}
              title="Comisiones competitivas"
              description="Gana entre 5% y 20% por cada venta. Tú negocias directamente con el merchant."
              color={COLORS.success.main}
              bg={COLORS.success.lighter}
            />
            <BenefitItem
              icon={BarChart3}
              title="Panel de métricas"
              description="Visualiza tus ventas, ganancias y rendimiento en tiempo real desde tu dashboard."
              color={COLORS.info.main}
              bg={COLORS.info.lighter}
            />
            <BenefitItem
              icon={Shield}
              title="Comercios verificados"
              description="Todos los merchants pasan por un proceso de verificación. Promueve con confianza."
              color={COLORS.primary.main}
              bg={COLORS.primary.lighter}
            />
            <BenefitItem
              icon={Zap}
              title="Códigos al instante"
              description="Genera códigos personalizados o automáticos en segundos. Sin burocracia."
              color={COLORS.warning.main}
              bg={COLORS.warning.lighter}
            />
            <BenefitItem
              icon={Star}
              title="Sin costo de entrada"
              description="El programa de influencers es 100% gratuito. No pagas nada para empezar ni para mantenerte."
              color={COLORS.accent.main}
              bg={COLORS.accent.lighter}
            />
            <BenefitItem
              icon={TrendingUp}
              title="Sin límite de marcas"
              description="Conecta con todos los comercios que quieras. Más partnerships = más ingresos."
              color={COLORS.discount.main}
              bg={COLORS.discount.main + "15"}
            />
          </div>
        </section>

        {/* Requisitos */}
        <section
          className="rounded-2xl border p-8 md:p-10 mb-12"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.text.primary }}>
            Requisitos para aplicar
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Ser mayor de 18 años",
              "Tener al menos una red social activa",
              "Residir en Venezuela",
              "Contar con audiencia real (no bots)",
              "Compromiso de promoción honesta",
              "Disposición a seguir los TyC de Promii",
            ].map((req) => (
              <div key={req} className="flex items-center gap-3">
                <CheckCircle className="size-5 shrink-0" style={{ color: COLORS.success.main }} />
                <span className="text-sm" style={{ color: COLORS.text.secondary }}>{req}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ rápido */}
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
                q: "¿Cuánto puedo ganar?",
                a: "Depende de tu audiencia y las promociones que compartas. Influencers activos generan entre $50 y $500+ mensuales en comisiones.",
              },
              {
                q: "¿Necesito muchos seguidores?",
                a: "No hay un mínimo estricto. Valoramos la calidad de la audiencia y el engagement más que el número de seguidores.",
              },
              {
                q: "¿Cómo me pagan?",
                a: "Las comisiones se negocian y pagan directamente entre tú y el merchant. Promii facilita la conexión pero no interviene en los pagos.",
              },
              {
                q: "¿Puedo promocionar cualquier negocio?",
                a: "Solo puedes generar códigos para merchants con los que tengas una partnership aprobada. Tú decides con quién trabajar.",
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
            background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-4"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
          >
            <Clock className="size-3.5" />
            Cupos limitados
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            ¿Listo para empezar a ganar?
          </h2>
          <p className="text-base text-white/80 max-w-lg mx-auto mb-8">
            Únete al programa de influencers de Promii y empieza a monetizar tu audiencia hoy mismo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/inf/apply"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: COLORS.accent.main,
                color: "white",
              }}
            >
              Aplicar al programa
              <ArrowRight className="size-5" />
            </Link>
            <WhatsAppShareButton
              message="Mira este programa para influencers en Venezuela. Puedes ganar comisiones compartiendo descuentos con tu audiencia, es gratis 👀 https://promii.com/for-influencers"
              variant="hero"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
