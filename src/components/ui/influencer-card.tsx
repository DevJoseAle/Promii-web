"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { COLORS } from "@/config/colors";
import { MapPin, Users, Briefcase, TrendingUp } from "lucide-react";

type Props = {
  name: string;
  slug: string;
  handle: string;
  city: string;
  followers: number;
  tags: string[];
  brandsCount: number;
  avatarUrl?: string;
};

function formatFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

export function InfluencerCard({
  name,
  slug,
  handle,
  city,
  followers,
  tags,
  brandsCount,
  avatarUrl,
}: Props) {
  const visibleTags = tags.slice(0, 2);
  const extra = tags.length - visibleTags.length;

  return (
    <Link
      href={`/influencers/${slug}`}
      className="group block overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
      style={{
        backgroundColor: COLORS.background.primary,
        borderColor: COLORS.border.light,
      }}
    >
      {/* Cover with gradient */}
      <div
        className="relative h-24"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
        }}
      >
        {/* Decorative element */}
        <div
          className="absolute -right-10 -top-10 size-32 rounded-full opacity-30 blur-2xl"
          style={{ backgroundColor: COLORS.background.primary }}
        />
      </div>

      {/* Avatar */}
      <div className="relative px-5 pb-4">
        <div
          className="absolute -top-10 size-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold shadow-lg"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.background.primary,
            color: COLORS.primary.main,
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="size-full rounded-full object-cover"
            />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>

        {/* Content */}
        <div className="pt-12">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className="font-bold text-base truncate"
                style={{ color: COLORS.text.primary }}
              >
                {name}
              </h3>
              <p
                className="text-sm truncate"
                style={{ color: COLORS.text.secondary }}
              >
                {handle}
              </p>
            </div>

            {/* Verified badge or stat */}
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: COLORS.primary.lighter,
                color: COLORS.primary.main,
              }}
            >
              <TrendingUp className="size-5" />
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 mt-3 text-xs" style={{ color: COLORS.text.tertiary }}>
            <MapPin className="size-3.5" />
            <span>{city}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-sm">
              <Users className="size-4" style={{ color: COLORS.primary.main }} />
              <span className="font-semibold" style={{ color: COLORS.text.primary }}>
                {formatFollowers(followers)}
              </span>
            </div>

            <div
              className="w-px h-4"
              style={{ backgroundColor: COLORS.border.main }}
            />

            <div className="flex items-center gap-1.5 text-sm">
              <Briefcase className="size-4" style={{ color: COLORS.success.main }} />
              <span className="font-semibold" style={{ color: COLORS.text.primary }}>
                {brandsCount}
              </span>
              <span className="text-xs" style={{ color: COLORS.text.secondary }}>
                marcas
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {visibleTags.map((t) => (
              <span
                key={t}
                className="rounded-md px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: COLORS.primary.lighter,
                  color: COLORS.primary.dark,
                }}
              >
                {t}
              </span>
            ))}
            {extra > 0 && (
              <span
                className="rounded-md px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  color: COLORS.text.secondary,
                }}
              >
                +{extra}
              </span>
            )}
          </div>

          {/* CTA */}
          <div className="mt-4 pt-3 border-t" style={{ borderColor: COLORS.border.light }}>
            <span
              className="text-sm font-semibold group-hover:underline inline-flex items-center gap-1"
              style={{ color: COLORS.primary.main }}
            >
              Ver perfil completo
              <svg
                className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
