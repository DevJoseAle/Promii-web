import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, TrendingUp, Sparkles } from "lucide-react";
import { COLORS } from "@/config/colors";

export type Promii = {
  id: string;
  title: string;
  merchant: string;
  location: string;
  rating: number;
  sold: number;
  oldPrice: number;
  price: number;
  discountPct: number;
  tag?: string;
};

// New type for Supabase data
export type HomePromii = {
  id: string;
  title: string;
  price_amount: number;
  price_currency: string;
  original_price_amount: number | null;
  discount_label: string | null;
  city: string;
  state: string;
  merchant_name: string | null;
  photo_url: string | null;
  category_primary: string;
};

type Props = {
  p?: Promii;
  data?: HomePromii;
};

export function PromiiCard({ p, data }: Props) {
  // Use either format
  const promii = data ? {
    id: data.id,
    title: data.title,
    merchant: data.merchant_name ?? "Comercio",
    location: `${data.city} · ${data.state}`,
    rating: 0, // TODO: Implement ratings system
    sold: 0,   // TODO: Implement sales counter
    oldPrice: data.original_price_amount ?? data.price_amount,
    price: data.price_amount,
    discountPct: data.original_price_amount
      ? Math.round(((data.original_price_amount - data.price_amount) / data.original_price_amount) * 100)
      : 0,
    photoUrl: data.photo_url,
    currency: data.price_currency,
    discountLabel: data.discount_label,
  } : {
    id: p!.id,
    title: p!.title,
    merchant: p!.merchant,
    location: p!.location,
    rating: p!.rating,
    sold: p!.sold,
    oldPrice: p!.oldPrice,
    price: p!.price,
    discountPct: p!.discountPct,
    photoUrl: null,
    currency: "$",
    discountLabel: null,
    tag: p!.tag,
  };

  return (
    <Link
      href={`/p/${promii.id}`}
      className="group block overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
      style={{
        backgroundColor: COLORS.background.primary,
        borderColor: COLORS.border.light,
      }}
    >
      {/* Image or gradient placeholder */}
      <div className="relative h-44 overflow-hidden">
        {promii.photoUrl ? (
          <Image
            src={promii.photoUrl}
            alt={promii.title}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-110"
          />
        ) : (
          <div
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary.lighter} 0%, ${COLORS.primary.light} 50%, ${COLORS.primary.main} 100%)`,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles className="size-12" style={{ color: COLORS.background.primary, opacity: 0.5 }} />
          </div>
        )}

        {(promii as any).tag && (
          <div
            className="absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm"
            style={{
              backgroundColor: COLORS.success.main,
              color: COLORS.text.inverse,
            }}
          >
            {(promii as any).tag}
          </div>
        )}

        {/* Badge de descuento */}
        {promii.discountPct > 0 && (
          <div
            className="absolute bottom-3 left-3 rounded-lg px-3 py-1.5 font-bold shadow-md"
            style={{
              backgroundColor: COLORS.error.main,
              color: COLORS.text.inverse,
            }}
          >
            {promii.discountLabel || `-${promii.discountPct}%`}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3
          className="line-clamp-2 text-sm font-semibold leading-tight min-h-[2.5rem]"
          style={{ color: COLORS.text.primary }}
        >
          {promii.title}
        </h3>

        {/* Merchant */}
        <div className="text-xs font-medium" style={{ color: COLORS.text.secondary }}>
          {promii.merchant}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: COLORS.text.tertiary }}>
          <MapPin className="size-3" />
          <span>{promii.location}</span>
        </div>

        {/* Rating + Sold (only show if we have data) */}
        {(promii.rating > 0 || promii.sold > 0) && (
          <div className="flex items-center gap-3 text-xs">
            {promii.rating > 0 && (
              <>
                <div className="flex items-center gap-1" style={{ color: COLORS.warning.dark }}>
                  <Star className="size-3 fill-current" />
                  <span className="font-semibold">{promii.rating.toFixed(1)}</span>
                </div>
                <span style={{ color: COLORS.text.tertiary }}>•</span>
              </>
            )}
            {promii.sold > 0 && (
              <div className="flex items-center gap-1" style={{ color: COLORS.success.dark }}>
                <TrendingUp className="size-3" />
                <span>{promii.sold}+ vendidos</span>
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-t pt-3" style={{ borderColor: COLORS.border.light }}>
          {/* Prices */}
          <div className="flex items-end justify-between gap-2">
            <div>
              {promii.oldPrice !== promii.price && (
                <div className="text-xs line-through" style={{ color: COLORS.text.tertiary }}>
                  {promii.currency} {promii.oldPrice.toFixed(2)}
                </div>
              )}
              <div className="text-xl font-bold" style={{ color: COLORS.primary.main }}>
                {promii.currency} {promii.price.toFixed(2)}
              </div>
            </div>

            {/* CTA */}
            <div
              className="rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
                color: COLORS.text.inverse,
              }}
            >
              Ver
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
