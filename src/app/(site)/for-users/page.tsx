import Link from "next/link";
import { COLORS } from "@/config/colors";
import { WhatsAppShareButton } from "@/components/ui/whatsapp-share-button";
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  Tag,
  MapPin,
  ShieldCheck,
  Smartphone,
  Clock,
  Percent,
  Search,
  QrCode,
  Heart,
  Utensils,
  Scissors,
  Dumbbell,
  Ticket,
  ShoppingBag,
  Star,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Descubre Ofertas Increíbles - Promii",
  description:
    "Ahorra hasta 70% en restaurantes, spas, entretenimiento y más cerca de ti. Compra directo, canjea con tu código único. Sin trucos.",
  openGraph: {
    title: "Ahorra hasta 70% en lo que ya compras - Promii",
    description: "Descubre ofertas verificadas en restaurantes, spas, entretenimiento y más cerca de ti en Venezuela. Sin trucos.",
    type: "website",
    url: "https://promii.shop/for-users",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahorra hasta 70% en lo que ya compras - Promii",
    description: "Descubre ofertas verificadas en restaurantes, spas, entretenimiento y más cerca de ti en Venezuela. Sin trucos.",
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

function CategoryCard({ icon: Icon, name, color, bg }: {
  icon: React.ElementType;
  name: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      className="flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200 hover:shadow-md"
      style={{
        backgroundColor: COLORS.background.primary,
        borderColor: COLORS.border.light,
      }}
    >
      <div
        className="flex size-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: bg }}
      >
        <Icon className="size-6" style={{ color }} />
      </div>
      <span className="text-xs font-semibold" style={{ color: COLORS.text.primary }}>{name}</span>
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

export default function ForUsersPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background.secondary }}>
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Hero */}
        <section
          className="relative overflow-hidden rounded-2xl p-8 md:p-12 mb-12"
          style={{
            background: `linear-gradient(135deg, ${COLORS.discount.dark} 0%, ${COLORS.discount.main} 50%, ${COLORS.primary.light} 100%)`,
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
              Nuevas ofertas cada día
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
              Ahorra hasta 70% en lo que ya compras
            </h1>
            <p className="text-base md:text-lg leading-relaxed text-white/80 mb-8">
              Descubre promociones verificadas en restaurantes, spas, entretenimiento y más cerca de ti. Compra directo, canjea con tu código único. Sin trucos, sin letra pequeña.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: COLORS.accent.main,
                  color: "white",
                }}
              >
                Crear cuenta gratis
                <ArrowRight className="size-4" />
              </Link>
              <WhatsAppShareButton
                message="Mira esta app para conseguir descuentos de hasta 70% en restaurantes, spas y más en tu ciudad 🔥 https://promii.shop/for-users"
                variant="hero"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-10 grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">70%</div>
              <div className="text-xs text-white/70 mt-1">Descuento máx.</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">$0</div>
              <div className="text-xs text-white/70 mt-1">Gratis para ti</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">100%</div>
              <div className="text-xs text-white/70 mt-1">Comercios verificados</div>
            </div>
          </div>
        </section>

        {/* Categorías */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
              Ofertas en lo que más te gusta
            </h2>
            <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
              Explora por categoría y encuentra lo tuyo
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            <CategoryCard icon={Utensils} name="Comida" color={COLORS.warning.main} bg={COLORS.warning.lighter} />
            <CategoryCard icon={Scissors} name="Belleza" color={COLORS.discount.main} bg={COLORS.discount.main + "15"} />
            <CategoryCard icon={Dumbbell} name="Fitness" color={COLORS.success.main} bg={COLORS.success.lighter} />
            <CategoryCard icon={Ticket} name="Eventos" color={COLORS.primary.main} bg={COLORS.primary.lighter} />
            <CategoryCard icon={ShoppingBag} name="Compras" color={COLORS.info.main} bg={COLORS.info.lighter} />
            <CategoryCard icon={Star} name="Y más..." color={COLORS.accent.main} bg={COLORS.accent.lighter} />
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
              Así de fácil es ahorrar
            </h2>
            <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
              3 pasos y empiezas a disfrutar descuentos
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <StepCard
              number={1}
              icon={Search}
              title="Busca ofertas"
              description="Explora promociones por categoría, ciudad o busca tu negocio favorito. Nuevas ofertas cada día."
              color={COLORS.primary.main}
              bg={COLORS.primary.lighter}
            />
            <StepCard
              number={2}
              icon={Tag}
              title="Compra tu promii"
              description="Elige la promo que te guste y cómprala al instante. Recibes un código único que es solo tuyo."
              color={COLORS.discount.main}
              bg={COLORS.discount.main + "15"}
            />
            <StepCard
              number={3}
              icon={QrCode}
              title="Canjea y disfruta"
              description="Presenta tu código en el comercio. El merchant lo valida y tú disfrutas tu descuento. Así de simple."
              color={COLORS.success.main}
              bg={COLORS.success.lighter}
            />
          </div>
        </section>

        {/* Ejemplo de ahorro */}
        <section
          className="rounded-2xl border p-8 md:p-10 mb-12"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
              Mira cuánto puedes ahorrar
            </h2>
            <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
              Ejemplos reales de lo que encuentras en Promii
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                category: "Restaurante",
                original: "$25",
                promii: "$12.50",
                discount: "50%",
                desc: "Cena para 2 en restaurante italiano",
                color: COLORS.warning.main,
                bg: COLORS.warning.lighter,
              },
              {
                category: "Spa & Belleza",
                original: "$40",
                promii: "$16",
                discount: "60%",
                desc: "Sesión de masaje relajante 60 min",
                color: COLORS.discount.main,
                bg: COLORS.discount.main + "15",
              },
              {
                category: "Entretenimiento",
                original: "$15",
                promii: "$7.50",
                discount: "50%",
                desc: "2 entradas de cine + combo",
                color: COLORS.primary.main,
                bg: COLORS.primary.lighter,
              },
            ].map((item) => (
              <div
                key={item.category}
                className="rounded-xl border p-5"
                style={{ borderColor: COLORS.border.light }}
              >
                <div
                  className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold mb-3"
                  style={{ backgroundColor: item.bg, color: item.color }}
                >
                  {item.category}
                </div>
                <p className="text-sm mb-3" style={{ color: COLORS.text.secondary }}>
                  {item.desc}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold" style={{ color: COLORS.success.main }}>{item.promii}</span>
                  <span className="text-sm line-through" style={{ color: COLORS.text.tertiary }}>{item.original}</span>
                  <span
                    className="ml-auto rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{ backgroundColor: COLORS.discount.main, color: "white" }}
                  >
                    -{item.discount}
                  </span>
                </div>
              </div>
            ))}
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
              ¿Por qué usar Promii?
            </h2>
            <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
              No es otro cupón genérico. Es distinto.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <BenefitItem
              icon={Percent}
              title="Descuentos reales"
              description="Hasta 70% de descuento en negocios verificados. No son precios inflados ni ofertas falsas."
              color={COLORS.discount.main}
              bg={COLORS.discount.main + "15"}
            />
            <BenefitItem
              icon={MapPin}
              title="Cerca de ti"
              description="Filtra por tu ciudad y encuentra ofertas que puedes disfrutar hoy, no al otro lado del país."
              color={COLORS.primary.main}
              bg={COLORS.primary.lighter}
            />
            <BenefitItem
              icon={ShieldCheck}
              title="Comercios verificados"
              description="Cada negocio en Promii pasa por un proceso de verificación. Compra con confianza."
              color={COLORS.success.main}
              bg={COLORS.success.lighter}
            />
            <BenefitItem
              icon={Smartphone}
              title="Todo desde tu celular"
              description="Compra, recibe tu código y canjea directo desde el teléfono. Sin imprimir nada."
              color={COLORS.info.main}
              bg={COLORS.info.lighter}
            />
            <BenefitItem
              icon={Heart}
              title="100% gratis para ti"
              description="No pagas suscripción ni membresía. Solo pagas cuando compras una promo que te gusta."
              color={COLORS.accent.main}
              bg={COLORS.accent.lighter}
            />
            <BenefitItem
              icon={Clock}
              title="Ofertas que se renuevan"
              description="Nuevas promociones todos los días. Siempre hay algo nuevo que descubrir cerca de ti."
              color={COLORS.warning.main}
              bg={COLORS.warning.lighter}
            />
          </div>
        </section>

        {/* Seguridad */}
        <section
          className="rounded-2xl border p-8 md:p-10 mb-12"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.text.primary }}>
            Tu compra está protegida
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Comercios verificados por nuestro equipo",
              "Código único e intransferible por compra",
              "Soporte si tienes algún inconveniente",
              "Condiciones claras en cada promoción",
              "Sin cargos ocultos ni suscripciones",
              "Tus datos protegidos y encriptados",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="size-5 shrink-0" style={{ color: COLORS.success.main }} />
                <span className="text-sm" style={{ color: COLORS.text.secondary }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section
          className="rounded-2xl border p-8 md:p-10 mb-12"
          style={{
            backgroundColor: COLORS.discount.main + "08",
            borderColor: COLORS.discount.main + "20",
          }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.text.primary }}>
            Preguntas frecuentes
          </h2>
          <div className="space-y-5">
            {[
              {
                q: "¿Promii es gratis?",
                a: "Sí, para los usuarios es 100% gratis. Solo pagas cuando decides comprar una promoción. No hay suscripción ni membresía.",
              },
              {
                q: "¿Cómo canjeo mi código?",
                a: "Después de comprar, recibes un código único. Lo presentas en el comercio (físico o digital) y el merchant lo valida al instante.",
              },
              {
                q: "¿Qué pasa si no puedo usar mi código?",
                a: "Cada promoción tiene sus condiciones (fechas, horarios, restricciones). Revísalas antes de comprar. Si tienes un problema, nuestro equipo te ayuda.",
              },
              {
                q: "¿Puedo regalar un promii?",
                a: "Próximamente podrás comprar promiis como regalo. Por ahora, cada código está vinculado a tu cuenta.",
              },
              {
                q: "¿En qué ciudades está disponible?",
                a: "Estamos creciendo en las principales ciudades de Venezuela: Caracas, Valencia, Maracaibo, Barquisimeto, Puerto La Cruz, Mérida y más.",
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
            background: `linear-gradient(135deg, ${COLORS.discount.dark} 0%, ${COLORS.discount.main} 50%, ${COLORS.primary.light} 100%)`,
          }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Empieza a ahorrar hoy
          </h2>
          <p className="text-base text-white/80 max-w-lg mx-auto mb-8">
            Crea tu cuenta gratis y descubre las mejores ofertas cerca de ti. Nuevas promos todos los días.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: COLORS.accent.main,
                color: "white",
              }}
            >
              Crear cuenta gratis
              <ArrowRight className="size-5" />
            </Link>
            <WhatsAppShareButton
              message="Mira esta app para conseguir descuentos de hasta 70% en restaurantes, spas y más en tu ciudad 🔥 https://promii.shop/for-users"
              variant="hero"
            />
          </div>

          {/* Social proof nudge */}
          <p className="mt-6 text-sm text-white/60">
            Únete a la comunidad de ahorradores inteligentes en Venezuela
          </p>
        </section>
      </div>
    </div>
  );
}
