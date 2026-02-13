import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PromiiCard } from "@/components/ui/promii-card";
import { COLORS } from "@/config/colors";
import {
  TrendingUp,
  Utensils,
  Sparkles,
  ArrowRight,
  Zap,
  Store,
  Star,
} from "lucide-react";
import {
  fetchFeaturedPromiis,
  fetchTrendingPromiis,
  fetchPopularPromiis,
} from "@/lib/services/promiis/homePromiis.service.server";
import { PricingSection } from "@/components/pricing/pricing-section";

export default async function HomePage() {
  // Fetch data from Supabase
  const featuredResponse = await fetchFeaturedPromiis(6);
  const trendingResponse = await fetchTrendingPromiis(8);
  const popularResponse = await fetchPopularPromiis(8);

  console.log("[HomePage] Featured response:", {
    status: featuredResponse.status,
    count: featuredResponse.data?.length,
    error: featuredResponse.error,
  });

  console.log("[HomePage] Trending response:", {
    status: trendingResponse.status,
    count: trendingResponse.data?.length,
    error: trendingResponse.error,
  });

  console.log("[HomePage] Popular response:", {
    status: popularResponse.status,
    count: popularResponse.data?.length,
    error: popularResponse.error,
  });

  const featuredPromiis = featuredResponse.status === "success" ? featuredResponse.data : [];
  const trendingPromiis = trendingResponse.status === "success" ? trendingResponse.data : [];
  const popularPromiis = popularResponse.status === "success" ? popularResponse.data : [];

  return (
    <div className="space-y-12">
      {/* Hero section */}
      <section className="relative overflow-hidden rounded-2xl border p-8 md:p-12"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary.lighter} 0%, ${COLORS.background.primary} 100%)`,
          borderColor: COLORS.border.light,
        }}
      >
        {/* Decorative elements */}
        <div
          className="absolute -right-20 -top-20 size-64 rounded-full opacity-30 blur-3xl"
          style={{ backgroundColor: COLORS.primary.main }}
        />

        <div className="relative z-10">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm mb-4"
            style={{
              backgroundColor: COLORS.background.primary,
              color: COLORS.primary.main,
            }}
          >
            <Sparkles className="size-3.5" />
            Nuevas promociones cada día
          </div>

          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight max-w-2xl"
            style={{ color: COLORS.text.primary }}
          >
            Descubre ofertas increíbles cerca de ti
          </h1>

          <p
            className="mt-4 text-base max-w-xl leading-relaxed"
            style={{ color: COLORS.text.secondary }}
          >
            Ahorra hasta 70% en restaurantes, spas, entretenimiento y más. Compra directo y canjea con tu código único.
          </p>
        </div>
      </section>

      {/* Featured promiis */}
      {featuredPromiis.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="flex size-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: COLORS.warning.lighter, color: COLORS.warning.main }}
              >
                <Star className="size-5" />
              </div>
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: COLORS.text.primary }}
                >
                  Destacados del día
                </h2>
                <p
                  className="text-sm"
                  style={{ color: COLORS.text.secondary }}
                >
                  Los promiis más populares ahora
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPromiis.map((promii) => (
              <PromiiCard key={promii.id} data={promii} />
            ))}
          </div>
        </section>
      )}

      {/* Trending section */}
      {trendingPromiis.length > 0 && (
        <section
          className="rounded-2xl border p-8"
          style={{
            backgroundColor: COLORS.background.secondary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="flex size-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: COLORS.success.lighter, color: COLORS.success.main }}
              >
                <TrendingUp className="size-5" />
              </div>
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: COLORS.text.primary }}
                >
                  En tendencia
                </h2>
                <p
                  className="text-sm"
                  style={{ color: COLORS.text.secondary }}
                >
                  Lo que todos están comprando
                </p>
              </div>
            </div>

            <Link href="/c/all">
              <Button
                variant="outline"
                className="font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  borderColor: COLORS.border.main,
                  color: COLORS.text.primary,
                }}
              >
                Ver todo
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trendingPromiis.slice(0, 4).map((promii) => (
              <PromiiCard key={promii.id} data={promii} />
            ))}
          </div>
        </section>
      )}

      {/* Categories CTAs */}
      <section className="grid gap-5 md:grid-cols-2">
        <Link
          href="/c/gastronomia"
          className="group relative overflow-hidden rounded-2xl border p-8 transition-all duration-200 hover:shadow-lg"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          {/* Decorative background */}
          <div
            className="absolute -right-10 -top-10 size-40 rounded-full opacity-20 blur-2xl transition-all duration-300 group-hover:scale-110"
            style={{ backgroundColor: COLORS.warning.main }}
          />

          <div className="relative z-10">
            <div
              className="flex size-12 items-center justify-center rounded-xl mb-4"
              style={{ backgroundColor: COLORS.warning.lighter, color: COLORS.warning.main }}
            >
              <Utensils className="size-6" />
            </div>

            <h3
              className="text-2xl font-bold"
              style={{ color: COLORS.text.primary }}
            >
              Ofertas de comida
            </h3>
            <p
              className="mt-2 text-sm leading-relaxed"
              style={{ color: COLORS.text.secondary }}
            >
              Descubre promos en restaurantes, cafés, postres y más. Desde comida rápida hasta fine dining.
            </p>

            <Button
              className="mt-6 font-semibold transition-all duration-200 hover:scale-105 group-hover:translate-x-1"
              style={{
                background: `linear-gradient(135deg, ${COLORS.warning.main} 0%, ${COLORS.warning.light} 100%)`,
                color: COLORS.text.inverse,
              }}
            >
              Ver gastronomía
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>
        </Link>

        <Link
          href="/c/entretenimiento"
          className="group relative overflow-hidden rounded-2xl border p-8 transition-all duration-200 hover:shadow-lg"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          {/* Decorative background */}
          <div
            className="absolute -right-10 -top-10 size-40 rounded-full opacity-20 blur-2xl transition-all duration-300 group-hover:scale-110"
            style={{ backgroundColor: COLORS.primary.main }}
          />

          <div className="relative z-10">
            <div
              className="flex size-12 items-center justify-center rounded-xl mb-4"
              style={{ backgroundColor: COLORS.primary.lighter, color: COLORS.primary.main }}
            >
              <Zap className="size-6" />
            </div>

            <h3
              className="text-2xl font-bold"
              style={{ color: COLORS.text.primary }}
            >
              Planes y experiencias
            </h3>
            <p
              className="mt-2 text-sm leading-relaxed"
              style={{ color: COLORS.text.secondary }}
            >
              Cine, eventos, actividades y experiencias únicas. Todo lo que necesitas para salir y disfrutar.
            </p>

            <Button
              className="mt-6 font-semibold transition-all duration-200 hover:scale-105 group-hover:translate-x-1"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
                color: COLORS.text.inverse,
              }}
            >
              Ver experiencias
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>
        </Link>
      </section>

      {/* Popular section */}
      {popularPromiis.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="flex size-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: COLORS.info.lighter, color: COLORS.info.main }}
              >
                <Store className="size-5" />
              </div>
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: COLORS.text.primary }}
                >
                  Popular en Promii
                </h2>
                <p
                  className="text-sm"
                  style={{ color: COLORS.text.secondary }}
                >
                  Descubre los favoritos de la comunidad
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popularPromiis.map((promii) => (
              <PromiiCard key={promii.id} data={promii} />
            ))}
          </div>
        </section>
      )}

      {/* Pricing section for merchants */}
      <section
        className="rounded-2xl border p-8 md:p-10"
        style={{
          backgroundColor: COLORS.background.secondary,
          borderColor: COLORS.border.light,
        }}
      >
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-4"
            style={{
              backgroundColor: COLORS.primary.lighter,
              color: COLORS.primary.main,
            }}
          >
            <Store className="size-3.5" />
            Para comercios
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold tracking-tight"
            style={{ color: COLORS.text.primary }}
          >
            Publica tus promociones en Promii
          </h2>
          <p className="mt-2 text-sm max-w-lg mx-auto" style={{ color: COLORS.text.secondary }}>
            Atrae nuevos clientes y aumenta tus ventas. Sin contratos largos, cancela cuando quieras.
          </p>
        </div>
        <PricingSection compact />
      </section>

      {/* Empty state */}
      {featuredPromiis.length === 0 && trendingPromiis.length === 0 && popularPromiis.length === 0 && (
        <section
          className="rounded-2xl border p-12 text-center"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div
            className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full"
            style={{ backgroundColor: COLORS.primary.lighter, color: COLORS.primary.main }}
          >
            <Sparkles className="size-8" />
          </div>
          <h3
            className="text-xl font-bold mb-2"
            style={{ color: COLORS.text.primary }}
          >
            Próximamente
          </h3>
          <p
            className="text-sm max-w-md mx-auto"
            style={{ color: COLORS.text.secondary }}
          >
            Estamos trabajando en traer las mejores ofertas para ti. ¡Vuelve pronto!
          </p>
        </section>
      )}
    </div>
  );
}
