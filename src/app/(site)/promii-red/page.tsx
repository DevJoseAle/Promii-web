import Link from "next/link";
import { COLORS } from "@/config/colors";
import { WhatsAppShareButton } from "@/components/ui/whatsapp-share-button";
import {
  Gift,
  ArrowRight,
  DollarSign,
  Users,
  Store,
  CheckCircle,
  TrendingUp,
  Clock,
  Target,
  Zap,
  Shield,
  Heart,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promii Red - Programa de Referidos",
  description:
    "Gana $5 por cada comercio que refieras a Promii + $5 de bono al 3er mes. Sin costo, sin límites. Únete al programa de referidos oficial de Promii.",
  openGraph: {
    title: "Promii Red - Gana dinero recomendando comercios locales",
    description: "Refiere comercios a Promii y gana $5 por activación + $5 bono de retención. 100% gratis.",
    type: "website",
    url: "https://promii.shop/promii-red",
  },
  twitter: {
    card: "summary_large_image",
    title: "Promii Red - Gana dinero recomendando comercios locales",
    description: "Refiere comercios a Promii y gana $5 por activación + $5 bono de retención. 100% gratis.",
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

export default function PromiiRedPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background.secondary }}>
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Hero */}
        <section
          className="relative overflow-hidden rounded-2xl p-8 md:p-12 mb-12"
          style={{
            background: `linear-gradient(135deg, ${COLORS.accent.dark} 0%, ${COLORS.accent.main} 50%, ${COLORS.primary.light} 100%)`,
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
              <Gift className="size-3.5" />
              Programa de Referidos Oficial
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
              Gana dinero recomendando comercios locales
            </h1>
            <p className="text-base md:text-lg leading-relaxed text-white/80 mb-8">
              Invita negocios a unirse a Promii y recibe recompensas por cada comercio que se active. Sin límites, 100% gratis.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: "white",
                  color: COLORS.primary.main,
                }}
              >
                Empezar a ganar
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-10 grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">$5</div>
              <div className="text-xs text-white/70 mt-1">Por activación</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">$5</div>
              <div className="text-xs text-white/70 mt-1">Bono 3 meses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">∞</div>
              <div className="text-xs text-white/70 mt-1">Sin límite</div>
            </div>
          </div>
        </section>

        {/* ¿Cuánto puedes ganar? */}
        <section
          className="rounded-2xl border p-8 md:p-10 mb-12"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: COLORS.text.primary }}>
            💰 ¿Cuánto puedes ganar?
          </h2>

          <div className="max-w-2xl mx-auto space-y-6">
            <div
              className="rounded-xl border p-6"
              style={{
                backgroundColor: COLORS.success.lighter,
                borderColor: COLORS.success.light,
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex size-12 items-center justify-center rounded-xl shrink-0"
                  style={{ backgroundColor: COLORS.success.main }}
                >
                  <DollarSign className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: COLORS.text.primary }}>
                    $5 USD por comercio activado
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: COLORS.text.secondary }}>
                    Cuando el comercio que referiste se registra, es aprobado, activa su plan pago y permanece activo 30 días.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="rounded-xl border p-6"
              style={{
                backgroundColor: COLORS.warning.lighter,
                borderColor: COLORS.warning.light,
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex size-12 items-center justify-center rounded-xl shrink-0"
                  style={{ backgroundColor: COLORS.warning.main }}
                >
                  <TrendingUp className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: COLORS.text.primary }}>
                    +$5 USD de bono de retención
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: COLORS.text.secondary }}>
                    Si el comercio sigue activo durante 3 meses (90 días), recibes un bono adicional de $5.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <div className="inline-block">
                <div className="text-4xl font-bold mb-2" style={{ color: COLORS.accent.main }}>
                  Total: $10 USD
                </div>
                <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                  Por cada comercio que refieras y permanezca activo
                </p>
              </div>
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
              4 pasos simples para empezar a ganar
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StepCard
              number={1}
              icon={Users}
              title="Regístrate gratis"
              description="Crea tu cuenta en Promii. Es gratis y solo toma 1 minuto. Obtendrás tu código único de referido."
              color={COLORS.primary.main}
              bg={COLORS.primary.lighter}
            />
            <StepCard
              number={2}
              icon={Target}
              title="Comparte tu código"
              description="Invita comercios locales que conozcas. Comparte tu link único por WhatsApp, redes sociales o en persona."
              color={COLORS.accent.main}
              bg={COLORS.accent.lighter}
            />
            <StepCard
              number={3}
              icon={Store}
              title="El comercio se registra"
              description="Cuando el comercio se registra con tu código, es aprobado y activa su plan, empiezas a ganar."
              color={COLORS.warning.main}
              bg={COLORS.warning.lighter}
            />
            <StepCard
              number={4}
              icon={DollarSign}
              title="Recibe tu pago"
              description="Al final del mes en que el comercio cumple 30 días activo, recibes tu recompensa de $5."
              color={COLORS.success.main}
              bg={COLORS.success.lighter}
            />
          </div>
        </section>

        {/* ¿Cuándo se paga? */}
        <section
          className="rounded-2xl border p-8 md:p-10 mb-12"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.text.primary }}>
            📆 ¿Cuándo se paga?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="size-5 shrink-0 mt-0.5" style={{ color: COLORS.info.main }} />
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: COLORS.text.primary }}>
                  Recompensa base ($5):
                </p>
                <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                  Se liquida el último día del mes en que el comercio complete su primer mes activo (30 días desde que activó su plan).
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="size-5 shrink-0 mt-0.5" style={{ color: COLORS.warning.main }} />
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: COLORS.text.primary }}>
                  Bono de retención ($5):
                </p>
                <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                  Se liquida cuando el comercio cumple 90 días activo (3 meses). Esto incentiva que recomiendes negocios de calidad.
                </p>
              </div>
            </div>
            <div
              className="rounded-lg border p-4 mt-4"
              style={{
                backgroundColor: COLORS.info.lighter,
                borderColor: COLORS.info.light,
              }}
            >
              <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                <strong style={{ color: COLORS.text.primary }}>Método de pago:</strong> Los pagos se realizan mediante transferencia bancaria directa. Nuestro equipo coordina contigo los detalles al momento del pago.
              </p>
            </div>
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
              ¿Por qué unirse a Promii Red?
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <BenefitItem
              icon={Gift}
              title="100% gratis"
              description="No pagas nada para unirte ni para mantenerte. Solo ganas cuando generas valor."
              color={COLORS.primary.main}
              bg={COLORS.primary.lighter}
            />
            <BenefitItem
              icon={Zap}
              title="Sin límite de referidos"
              description="Refiere todos los comercios que quieras. Más negocios = más ingresos."
              color={COLORS.accent.main}
              bg={COLORS.accent.lighter}
            />
            <BenefitItem
              icon={Shield}
              title="Recompensas garantizadas"
              description="Si el comercio cumple los requisitos, tu recompensa está asegurada. Sin letra pequeña."
              color={COLORS.success.main}
              bg={COLORS.success.lighter}
            />
            <BenefitItem
              icon={TrendingUp}
              title="Ingresos pasivos"
              description="Una vez que refieres, el sistema trabaja solo. Tú solo esperas tu pago."
              color={COLORS.warning.main}
              bg={COLORS.warning.lighter}
            />
            <BenefitItem
              icon={Heart}
              title="Ayudas a comercios locales"
              description="Tu recomendación ayuda a negocios venezolanos a crecer y atraer más clientes."
              color={COLORS.discount.main}
              bg={COLORS.discount.main + "15"}
            />
            <BenefitItem
              icon={Target}
              title="Dashboard de seguimiento"
              description="Ve en tiempo real cuántos comercios has referido, su status y cuánto has ganado."
              color={COLORS.info.main}
              bg={COLORS.info.lighter}
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
            ✅ ¿Qué necesitas?
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Ser mayor de 18 años",
              "Tener una cuenta en Promii (usuario o influencer)",
              "Residir en Venezuela",
              "Conocer comercios locales dispuestos a crecer",
              "Seguir los Términos y Condiciones de Promii Red",
            ].map((req) => (
              <div key={req} className="flex items-center gap-3">
                <CheckCircle className="size-5 shrink-0" style={{ color: COLORS.success.main }} />
                <span className="text-sm" style={{ color: COLORS.text.secondary }}>{req}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section
          className="rounded-2xl border p-8 md:p-10 mb-12"
          style={{
            backgroundColor: COLORS.accent.lighter + "30",
            borderColor: COLORS.accent.light + "50",
          }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.text.primary }}>
            Preguntas frecuentes
          </h2>
          <div className="space-y-5">
            {[
              {
                q: "¿Hay límite de comercios que puedo referir?",
                a: "No hay ningún límite. Puedes referir todos los comercios que quieras. Mientras más refieras, más ganas.",
              },
              {
                q: "¿Qué significa 'comercio activado'?",
                a: "Un comercio se considera activado cuando: se registra con tu código, es aprobado por Promii, activa un plan pago y permanece activo durante al menos 30 días.",
              },
              {
                q: "¿Puedo referir mi propio negocio?",
                a: "No. Los auto-referidos no son válidos. El objetivo es que promuevas comercios de terceros.",
              },
              {
                q: "¿Cómo sé si mi referido fue aprobado?",
                a: "En tu dashboard de Promii Red puedes ver en tiempo real el status de todos tus referidos: registrado, aprobado, activado, etc.",
              },
              {
                q: "¿Qué pasa si el comercio cancela antes de 30 días?",
                a: "Si el comercio cancela antes de cumplir 30 días activo, no se genera la recompensa base. Por eso incentivamos que recomiendes negocios serios.",
              },
              {
                q: "¿Puedo combinar Promii Red con el programa de influencers?",
                a: "Sí. Si eres influencer, puedes ganar comisiones por promiis Y además ganar por referir merchants. Son dos programas independientes.",
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
              href="/terms"
              className="text-sm font-semibold inline-flex items-center gap-1 transition-colors hover:underline"
              style={{ color: COLORS.primary.main }}
            >
              Ver términos completos de Promii Red
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>

        {/* CTA Final */}
        <section
          className="rounded-2xl p-8 md:p-12 text-center"
          style={{
            background: `linear-gradient(135deg, ${COLORS.accent.dark} 0%, ${COLORS.accent.main} 50%, ${COLORS.primary.light} 100%)`,
          }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Empieza a ganar hoy mismo
          </h2>
          <p className="text-base text-white/80 max-w-lg mx-auto mb-8">
            Únete a Promii Red y ayuda a comercios locales mientras generas ingresos. Sin costo, sin límites.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: "white",
                color: COLORS.primary.main,
              }}
            >
              Crear cuenta gratis
              <ArrowRight className="size-5" />
            </Link>
            <WhatsAppShareButton
              message="Mira Promii Red, un programa donde puedes ganar dinero recomendando comercios locales a Promii. Ganas $5 por cada comercio activado + $5 de bono. Es gratis 💰 https://promii.shop/promii-red"
              variant="hero"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
