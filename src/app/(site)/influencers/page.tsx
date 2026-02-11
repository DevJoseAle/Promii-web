"use client";

import { useMemo, useState } from "react";
import { INFLUENCERS, CITIES, FOLLOWER_BUCKETS, inFollowerBucket } from "@/mocks/influencers";
import { Badge } from "@/components/ui/badge";
import { InfluencerCard } from "@/components/ui/influencer-card";
import { COLORS } from "@/config/colors";
import { Users2, TrendingUp, Sparkles, Search } from "lucide-react";

const ALL_TAGS = [
  "Gastronomía",
  "Turismo",
  "Entretenimiento",
  "Servicios",
  "Belleza",
  "Fitness",
  "Moda",
  "Tecnología",
  "Educación",
  "Familia",
  "Mascotas",
  "Hogar",
] as const;

export default function InfluencersDirectoryPage() {
  const [city, setCity] = useState<string>("Caracas");
  const [bucket, setBucket] = useState<string>("all");
  const [tag, setTag] = useState<string>("all");

  const filtered = useMemo(() => {
    return INFLUENCERS
      .filter((i) => (city ? i.city === city : true))
      .filter((i) => inFollowerBucket(i.followers, bucket))
      .filter((i) => (tag === "all" ? true : i.tags.includes(tag as any)))
      .sort((a, b) => b.followers - a.followers);
  }, [city, bucket, tag]);

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div
        className="relative overflow-hidden rounded-2xl border p-8 md:p-12"
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
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm mb-4"
                style={{
                  backgroundColor: COLORS.background.primary,
                  color: COLORS.primary.main,
                }}
              >
                <Sparkles className="size-3.5" />
                Directorio de Influencers
              </div>

              <h1
                className="text-3xl md:text-4xl font-bold tracking-tight"
                style={{ color: COLORS.text.primary }}
              >
                Promii Influencers
              </h1>

              <p
                className="mt-3 text-base max-w-2xl leading-relaxed"
                style={{ color: COLORS.text.secondary }}
              >
                Descubre creadores de contenido verificados, conoce sus colaboraciones con marcas locales y encuentra el perfil perfecto para tu negocio.
              </p>
            </div>

            <div
              className="flex items-center gap-3 rounded-xl px-4 py-2 shadow-sm"
              style={{
                backgroundColor: COLORS.background.primary,
                borderColor: COLORS.border.light,
              }}
            >
              <Users2 className="size-5" style={{ color: COLORS.primary.main }} />
              <div>
                <div className="text-xs" style={{ color: COLORS.text.tertiary }}>
                  Total
                </div>
                <div className="text-lg font-bold" style={{ color: COLORS.text.primary }}>
                  {INFLUENCERS.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <section
        className="rounded-xl border p-6"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Search className="size-5" style={{ color: COLORS.primary.main }} />
          <h2
            className="text-lg font-bold"
            style={{ color: COLORS.text.primary }}
          >
            Filtrar influencers
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Ciudad */}
          <div>
            <label
              htmlFor="city"
              className="text-sm font-semibold mb-2 block"
              style={{ color: COLORS.text.primary }}
            >
              Ciudad
            </label>
            <select
              id="city"
              className="h-11 w-full rounded-lg border px-4 text-sm transition-all duration-200 focus:ring-2"
              style={{
                backgroundColor: COLORS.background.tertiary,
                borderColor: COLORS.border.main,
                color: COLORS.text.primary,
              }}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Seguidores */}
          <div>
            <label
              htmlFor="followers"
              className="text-sm font-semibold mb-2 block"
              style={{ color: COLORS.text.primary }}
            >
              Seguidores
            </label>
            <select
              id="followers"
              className="h-11 w-full rounded-lg border px-4 text-sm transition-all duration-200 focus:ring-2"
              style={{
                backgroundColor: COLORS.background.tertiary,
                borderColor: COLORS.border.main,
                color: COLORS.text.primary,
              }}
              value={bucket}
              onChange={(e) => setBucket(e.target.value)}
            >
              {FOLLOWER_BUCKETS.map((b) => (
                <option key={b.key} value={b.key}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rubro */}
          <div>
            <label
              htmlFor="category"
              className="text-sm font-semibold mb-2 block"
              style={{ color: COLORS.text.primary }}
            >
              Categoría
            </label>
            <select
              id="category"
              className="h-11 w-full rounded-lg border px-4 text-sm transition-all duration-200 focus:ring-2"
              style={{
                backgroundColor: COLORS.background.tertiary,
                borderColor: COLORS.border.main,
                color: COLORS.text.primary,
              }}
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {ALL_TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: COLORS.success.lighter, color: COLORS.success.main }}
          >
            <TrendingUp className="size-5" />
          </div>
          <div>
            <h2
              className="text-lg font-bold"
              style={{ color: COLORS.text.primary }}
            >
              {filtered.length} influencer{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </h2>
            <p
              className="text-sm"
              style={{ color: COLORS.text.secondary }}
            >
              Ordenados por número de seguidores
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((i) => (
          <InfluencerCard
            key={i.id}
            name={i.name}
            slug={i.slug}
            handle={i.handle}
            city={i.city}
            followers={i.followers}
            tags={i.tags}
            brandsCount={i.brands.length}
            avatarUrl={i.avatarUrl}
          />
        ))}
      </div>
    </div>
  );
}
