import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type Props = {
  name: string;
  slug: string;
  handle: string;
  city: string;
  followers: number;
  tags: string[];
  brandsCount: number;
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
}: Props) {
  const visibleTags = tags.slice(0, 3);
  const extra = tags.length - visibleTags.length;

  return (
    <Link
      href={`/influencers/${slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-28 bg-muted" />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-bold text-text-primary">{name}</div>
            <div className="text-xs text-text-secondary">{handle}</div>
          </div>

          <div className="text-right">
            <div className="text-sm font-semibold text-text-primary">
              {formatFollowers(followers)}
            </div>
            <div className="text-xs text-text-secondary">seguidores</div>
          </div>
        </div>

        <div className="mt-2 text-xs text-text-secondary">{city}</div>

        <div className="mt-3 flex flex-wrap gap-2">
          {visibleTags.map((t) => (
            <Badge key={t} variant="secondary">
              {t}
            </Badge>
          ))}
          {extra > 0 ? (
            <Badge variant="outline">+{extra}</Badge>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-text-secondary">
          <span>{brandsCount} marcas</span>
          <span className="font-semibold text-text-primary group-hover:underline">
            Ver perfil
          </span>
        </div>
      </div>
    </Link>
  );
}
