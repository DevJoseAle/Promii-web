"use client";

import { useMemo, useState } from "react";
import { INFLUENCERS, CITIES, FOLLOWER_BUCKETS, inFollowerBucket } from "@/mocks/influencers";
import { Badge } from "@/components/ui/badge";
import { InfluencerCard } from "@/components/ui/incluencer-card";

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
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
              Promii Influencers
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Descubre influencers por ciudad y ve con qué marcas trabajan.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Badge variant="secondary">Público</Badge>
            <Badge variant="outline">MVP</Badge>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {/* Ciudad */}
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="text-xs font-semibold text-text-primary">Ciudad</div>
            <select
              className="mt-2 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-text-primary"
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
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="text-xs font-semibold text-text-primary">Seguidores</div>
            <select
              className="mt-2 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-text-primary"
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
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="text-xs font-semibold text-text-primary">Rubro</div>
            <select
              className="mt-2 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-text-primary"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            >
              <option value="all">Todos</option>
              {ALL_TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-text-secondary">
          {filtered.length} influencers encontrados
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          />
        ))}
      </div>
    </div>
  );
}
