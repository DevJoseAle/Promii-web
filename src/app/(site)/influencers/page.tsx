"use client";

import { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { InfluencerCard } from "@/components/ui/influencer-card";
import { COLORS } from "@/config/colors";
import { VE_STATES, getCitiesForState } from "@/config/location";
import { CATEGORIES } from "@/config/categories";
import { Users2, TrendingUp, Sparkles, Search, Loader2, AlertCircle } from "lucide-react";
import { getPublicInfluencers, type PublicInfluencer } from "@/lib/services/influencer/influencer-public.service";

const FOLLOWER_BUCKETS = [
  { key: "all", label: "Todos" },
  { key: "micro", label: "1k - 10k", min: 1000, max: 10000 },
  { key: "mid", label: "10k - 100k", min: 10000, max: 100000 },
  { key: "macro", label: "100k - 1M", min: 100000, max: 1000000 },
  { key: "mega", label: "1M+", min: 1000000 },
];

function formatFollowers(n: number | null) {
  if (!n) return "N/A";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

export default function InfluencersDirectoryPage() {
  const [influencers, setInfluencers] = useState<PublicInfluencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [bucket, setBucket] = useState<string>("all");
  const [niche, setNiche] = useState<string>("");

  const cities = useMemo(() => {
    if (!state) return [];
    return getCitiesForState(state);
  }, [state]);

  // Cargar influencers al montar
  useEffect(() => {
    loadInfluencers();
  }, []);

  async function loadInfluencers() {
    setLoading(true);
    setError(null);

    const response = await getPublicInfluencers();

    if (response.status === "success") {
      setInfluencers(response.data || []);
    } else {
      setError(response.error || "Error cargando influencers");
    }

    setLoading(false);
  }

  // Filtrar influencers en memoria
  const filtered = useMemo(() => {
    let result = [...influencers];

    // Filtro por estado
    if (state) {
      result = result.filter((i) => i.state === state);
    }

    // Filtro por ciudad
    if (city) {
      result = result.filter((i) => i.city === city);
    }

    // Filtro por nicho
    if (niche) {
      result = result.filter(
        (i) => i.niche_primary === niche || i.niche_secondary === niche
      );
    }

    // Filtro por seguidores
    if (bucket !== "all") {
      const bucketConfig = FOLLOWER_BUCKETS.find((b) => b.key === bucket);
      if (bucketConfig && bucketConfig.min !== undefined) {
        result = result.filter((i) => {
          const followers = i.instagram_followers || 0;
          const matchMin = followers >= bucketConfig.min!;
          const matchMax = bucketConfig.max ? followers <= bucketConfig.max : true;
          return matchMin && matchMax;
        });
      }
    }

    // Ordenar por seguidores (mayor a menor)
    result.sort((a, b) => (b.instagram_followers || 0) - (a.instagram_followers || 0));

    return result;
  }, [influencers, state, city, bucket, niche]);

  // Resetear ciudad cuando cambia el estado
  useEffect(() => {
    setCity("");
  }, [state]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="size-12 mx-auto mb-4 animate-spin"
            style={{ color: COLORS.primary.main }}
          />
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            Cargando influencers...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="rounded-2xl border p-12 text-center"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.error.light,
        }}
      >
        <AlertCircle
          className="size-16 mx-auto mb-4"
          style={{ color: COLORS.error.main }}
        />
        <h2 className="text-xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
          Error cargando influencers
        </h2>
        <p className="text-sm mb-6" style={{ color: COLORS.text.secondary }}>
          {error}
        </p>
        <button
          onClick={loadInfluencers}
          className="px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
            color: COLORS.text.inverse,
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

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
                  {influencers.length}
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Estado */}
          <div>
            <label
              htmlFor="state"
              className="text-sm font-semibold mb-2 block"
              style={{ color: COLORS.text.primary }}
            >
              Estado
            </label>
            <select
              id="state"
              className="h-11 w-full rounded-lg border px-4 text-sm transition-all duration-200 focus:ring-2"
              style={{
                backgroundColor: COLORS.background.tertiary,
                borderColor: COLORS.border.main,
                color: COLORS.text.primary,
              }}
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              <option value="">Todos los estados</option>
              {VE_STATES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

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
              disabled={!state}
            >
              <option value="">Todas las ciudades</option>
              {cities.map((c) => (
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

          {/* Nicho/Categoría */}
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
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
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
      {filtered.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <Search className="size-16 mx-auto mb-4" style={{ color: COLORS.text.tertiary }} />
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            No se encontraron influencers con los filtros seleccionados
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((i) => (
            <InfluencerCard
              key={i.id}
              name={i.display_name}
              slug={i.instagram_handle.replace("@", "")}
              handle={i.instagram_handle}
              city={i.city}
              followers={i.instagram_followers || 0}
              tags={[i.niche_primary, i.niche_secondary].filter(Boolean) as string[]}
              brandsCount={0} // TODO: Get real brands count
              avatarUrl={i.avatar_url || undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
