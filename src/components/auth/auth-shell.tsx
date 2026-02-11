import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { COLORS } from "@/config/colors";
import { Store, TrendingUp, Shield, Zap, Check, Sparkles, Users, DollarSign, Handshake, BarChart3 } from "lucide-react";

type Props = {
  brandLabel?: string;
  title: string;
  subtitle?: string;
  badgeText?: string;
  children: ReactNode;
  variant?: "consumer" | "business" | "influencer";
};

export function AuthShell({
  brandLabel = "Promii",
  title,
  subtitle,
  badgeText,
  children,
  variant = "consumer",
}: Props) {
  return (
    <div className="min-h-dvh" style={{ backgroundColor: COLORS.background.secondary }}>
      {/* Header con gradiente sutil */}
      <header
        className="border-b"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="transition-transform duration-200 hover:scale-105"
          >
            <Image
              src="/images/promiiLogo.png"
              alt="Promii"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </Link>

          {badgeText && (
            <div
              className="rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
                color: COLORS.text.inverse,
              }}
            >
              {badgeText}
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-12 lg:grid-cols-2 lg:gap-12">
        {/* Left: Form card */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div
              className="rounded-2xl border shadow-lg p-8"
              style={{
                backgroundColor: COLORS.background.primary,
                borderColor: COLORS.border.light,
              }}
            >
              <div className="space-y-6 mb-8">
                <div className="flex justify-center">
                  <Image
                    src="/images/promiiLogo.png"
                    alt="Promii"
                    width={140}
                    height={48}
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <div className="text-center">
                  <h1
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: COLORS.text.primary }}
                  >
                    {title}
                  </h1>
                  {subtitle && (
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: COLORS.text.secondary }}
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8">{children}</div>
            </div>
          </div>
        </div>

        {/* Right: Feature panel */}
        <div className="relative hidden lg:block">
          <div
            className="relative h-full min-h-[600px] rounded-2xl border shadow-lg overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary.lighter} 0%, ${COLORS.background.primary} 100%)`,
              borderColor: COLORS.border.light,
            }}
          >
            {/* Decorative elements */}
            <div
              className="absolute -right-20 top-20 size-64 rounded-full opacity-30 blur-3xl"
              style={{ backgroundColor: COLORS.primary.main }}
            />
            <div
              className="absolute -left-20 bottom-20 size-64 rounded-full opacity-20 blur-3xl"
              style={{ backgroundColor: COLORS.primary.light }}
            />

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col justify-between p-12">
              <div>
                <div
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm"
                  style={{
                    backgroundColor: COLORS.background.primary,
                    color: COLORS.primary.main,
                  }}
                >
                  <Sparkles className="size-4" />
                  {variant === "business"
                    ? "Portal de Negocios"
                    : variant === "influencer"
                    ? "Portal de Creadores"
                    : "Para Usuarios"}
                </div>

                <h2
                  className="mt-6 text-4xl font-bold tracking-tight"
                  style={{ color: COLORS.text.primary }}
                >
                  {variant === "business"
                    ? "Haz crecer tu negocio"
                    : variant === "influencer"
                    ? "Monetiza tu audiencia"
                    : "Ahorra en cada compra"}
                </h2>

                <p
                  className="mt-4 text-base leading-relaxed max-w-md"
                  style={{ color: COLORS.text.secondary }}
                >
                  {variant === "business"
                    ? "Publica promociones, atrae nuevos clientes y valida compras en tiempo real. Todo desde un solo lugar."
                    : variant === "influencer"
                    ? "Gana comisiones por cada venta que generes. Comparte códigos únicos con tu audiencia y cobra por resultados reales."
                    : "Descubre las mejores ofertas cerca de ti, compra directo y canjea con tu código único."}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4 mt-8">
                <div className="flex items-start gap-3">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: COLORS.success.lighter, color: COLORS.success.main }}
                  >
                    {variant === "influencer" ? <DollarSign className="size-5" /> : <Check className="size-5" />}
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: COLORS.text.primary }}>
                      {variant === "business"
                        ? "Panel de control completo"
                        : variant === "influencer"
                        ? "Códigos únicos personalizados"
                        : "Ofertas verificadas"}
                    </div>
                    <div className="text-sm mt-0.5" style={{ color: COLORS.text.secondary }}>
                      {variant === "business"
                        ? "Gestiona tus promiis, valida compras y ve estadísticas"
                        : variant === "influencer"
                        ? "Genera códigos de descuento para compartir con tus seguidores"
                        : "Todas las promociones están verificadas y garantizadas"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: COLORS.primary.lighter, color: COLORS.primary.main }}
                  >
                    {variant === "influencer" ? <BarChart3 className="size-5" /> : <TrendingUp className="size-5" />}
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: COLORS.text.primary }}>
                      {variant === "business"
                        ? "Atrae más clientes"
                        : variant === "influencer"
                        ? "Tracking en tiempo real"
                        : "Ahorra más"}
                    </div>
                    <div className="text-sm mt-0.5" style={{ color: COLORS.text.secondary }}>
                      {variant === "business"
                        ? "Llega a nuevos clientes con promociones atractivas"
                        : variant === "influencer"
                        ? "Ve cuántas ventas generas y cuánto has ganado al instante"
                        : "Descuentos reales del 30% hasta el 70%"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: COLORS.info.lighter, color: COLORS.info.main }}
                  >
                    {variant === "influencer" ? <Handshake className="size-5" /> : <Shield className="size-5" />}
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: COLORS.text.primary }}>
                      {variant === "business"
                        ? "Proceso de aprobación"
                        : variant === "influencer"
                        ? "Colabora con marcas locales"
                        : "Compra segura"}
                    </div>
                    <div className="text-sm mt-0.5" style={{ color: COLORS.text.secondary }}>
                      {variant === "business"
                        ? "Verificamos cada negocio para proteger a los usuarios"
                        : variant === "influencer"
                        ? "Trabaja con negocios verificados y recibe pagos seguros"
                        : "Pago directo al comercio, sin intermediarios"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: COLORS.warning.lighter, color: COLORS.warning.main }}
                  >
                    {variant === "influencer" ? <Users className="size-5" /> : <Zap className="size-5" />}
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: COLORS.text.primary }}>
                      {variant === "business"
                        ? "Validación instantánea"
                        : variant === "influencer"
                        ? "Crece tu comunidad"
                        : "Canje instantáneo"}
                    </div>
                    <div className="text-sm mt-0.5" style={{ color: COLORS.text.secondary }}>
                      {variant === "business"
                        ? "Valida compras al instante con códigos únicos"
                        : variant === "influencer"
                        ? "Ofrece valor real a tu audiencia con descuentos exclusivos"
                        : "Usa tu código y canjea tu promii al momento"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="border-t"
        style={{ borderColor: COLORS.border.light }}
      >
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div
            className="flex flex-wrap items-center justify-center gap-6 text-sm"
            style={{ color: COLORS.text.secondary }}
          >
            <Link
              className="transition-colors duration-200 hover:text-primary"
              href="/help"
              style={{ color: COLORS.text.secondary }}
            >
              Ayuda
            </Link>
            <span>·</span>
            <Link
              className="transition-colors duration-200 hover:text-primary"
              href="/legal/terms"
              style={{ color: COLORS.text.secondary }}
            >
              Términos
            </Link>
            <span>·</span>
            <Link
              className="transition-colors duration-200 hover:text-primary"
              href="/legal/privacy"
              style={{ color: COLORS.text.secondary }}
            >
              Privacidad
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
