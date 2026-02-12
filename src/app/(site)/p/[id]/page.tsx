import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchPromiiDetail, fetchRelatedPromiis } from "@/lib/services/promiis/promiiDetail.service.server";
import { COLORS } from "@/config/colors";
import {
  MapPin,
  Store,
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  Users,
  Award,
  Sparkles,
} from "lucide-react";
import { PhotoGallery } from "@/components/promii/photo-gallery";
import { PromiiDetailClient } from "./detail-client";

export default async function PromiiDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { id } = await params;
  const { ref: influencerCode } = await searchParams;

  console.log("[PromiiDetailPage] Loading promii:", id);

  const response = await fetchPromiiDetail(id);

  console.log("[PromiiDetailPage] Response:", {
    status: response.status,
    hasData: !!response.data,
    error: response.error,
  });

  if (response.status !== "success" || !response.data) {
    console.log("[PromiiDetailPage] Not found - redirecting to 404");
    return notFound();
  }

  const promii = response.data;

  console.log("[PromiiDetailPage] Merchant info:", {
    hasPhone: !!promii.merchant?.phone,
    phone: promii.merchant?.phone,
    merchantName: promii.merchant?.business_name,
  });

  // Check if promii is active (allow paused during development)
  const isDevelopment = process.env.NODE_ENV === "development";
  const isAvailable = promii.status === "active" || (isDevelopment && promii.status === "paused");
    if (!isAvailable) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.background.secondary }}>
        <div
          className="max-w-md w-full rounded-2xl border p-8 text-center"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div
            className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full"
            style={{ backgroundColor: COLORS.warning.lighter, color: COLORS.warning.main }}
          >
            <AlertCircle className="size-8" />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
            Promii no disponible
          </h2>
          <p className="text-sm mb-6" style={{ color: COLORS.text.secondary }}>
            Este promii no está activo en este momento.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
              color: COLORS.text.inverse,
            }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Check date validity
  const now = new Date();
  const startDate = new Date(promii.start_at);
  const endDate = new Date(promii.end_at);
  const isExpired = now > endDate;
  const notStarted = now < startDate;
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isEndingSoon = daysUntilExpiry <= 3 && daysUntilExpiry > 0;

  // Calculate discount percentage
  const discountPercent = promii.original_price_amount
    ? Math.round(((promii.original_price_amount - promii.price_amount) / promii.original_price_amount) * 100)
    : null;

  // Fetch related promiis
  const relatedResponse = await fetchRelatedPromiis({
    categoryPrimary: promii.category_primary,
    excludeId: promii.id,
  });
  const relatedPromiis = relatedResponse.status === "success" ? relatedResponse.data : [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background.secondary }}>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Photo gallery */}
            <PhotoGallery photos={promii.photos} title={promii.title} />

            {/* Title and basic info */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: COLORS.primary.lighter,
                      color: COLORS.primary.main,
                    }}
                  >
                    <Sparkles className="size-3" />
                    {promii.category_primary}
                  </span>
                  {promii.category_secondary && (
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: COLORS.background.tertiary,
                        color: COLORS.text.secondary,
                      }}
                    >
                      {promii.category_secondary}
                    </span>
                  )}
                  {isEndingSoon && (
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: COLORS.warning.lighter,
                        color: COLORS.warning.main,
                      }}
                    >
                      <Clock className="size-3" />
                      Termina pronto
                    </span>
                  )}
                </div>

                <h1
                  className="text-3xl lg:text-4xl font-bold tracking-tight"
                  style={{ color: COLORS.text.primary }}
                >
                  {promii.title}
                </h1>

                <div className="flex items-center gap-3 mt-3 text-sm" style={{ color: COLORS.text.secondary }}>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-4" />
                    <span>{promii.city}, {promii.state}</span>
                  </div>
                  {promii.merchant && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <Store className="size-4" />
                        <span className="font-semibold" style={{ color: COLORS.text.primary }}>
                          {promii.merchant.business_name}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {promii.description && (
              <div
                className="rounded-2xl border p-6"
                style={{
                  backgroundColor: COLORS.background.primary,
                  borderColor: COLORS.border.light,
                }}
              >
                <h2 className="text-lg font-bold mb-3" style={{ color: COLORS.text.primary }}>
                  Descripción
                </h2>
                <p
                  className="text-sm leading-relaxed whitespace-pre-line"
                  style={{ color: COLORS.text.secondary }}
                >
                  {promii.description}
                </p>
              </div>
            )}

            {/* Terms & Conditions */}
            {promii.terms && (
              <div
                className="rounded-2xl border p-6"
                style={{
                  backgroundColor: COLORS.background.primary,
                  borderColor: COLORS.border.light,
                }}
              >
                <h2 className="text-lg font-bold mb-3" style={{ color: COLORS.text.primary }}>
                  Términos y condiciones
                </h2>
                <div
                  className="text-sm leading-relaxed whitespace-pre-line"
                  style={{ color: COLORS.text.secondary }}
                >
                  {promii.terms}
                </div>
              </div>
            )}

            {/* Merchant info */}
            {promii.merchant && (
              <div
                className="rounded-2xl border p-6"
                style={{
                  backgroundColor: COLORS.background.primary,
                  borderColor: COLORS.border.light,
                }}
              >
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: COLORS.text.primary }}>
                  <Store className="size-5" style={{ color: COLORS.primary.main }} />
                  Sobre el comercio
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {promii.merchant.logo_url ? (
                      <div className="size-16 rounded-xl overflow-hidden border" style={{ borderColor: COLORS.border.light }}>
                        <img
                          src={promii.merchant.logo_url}
                          alt={promii.merchant.business_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="size-16 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: COLORS.background.tertiary }}
                      >
                        <Store className="size-8" style={{ color: COLORS.text.tertiary }} />
                      </div>
                    )}
                    <div>
                      <div className="font-bold" style={{ color: COLORS.text.primary }}>
                        {promii.merchant.business_name}
                      </div>
                    </div>
                  </div>

                  {promii.address_line && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="size-4 mt-0.5 shrink-0" style={{ color: COLORS.text.tertiary }} />
                      <div style={{ color: COLORS.text.secondary }}>
                        <div className="font-medium">{promii.address_line}</div>
                        <div>{promii.zone && `${promii.zone}, `}{promii.city}, {promii.state}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Restrictions */}
            {(promii.max_redemptions || !promii.allow_multiple_per_user || promii.max_units_per_user) && (
              <div
                className="rounded-2xl border p-6"
                style={{
                  backgroundColor: COLORS.info.lighter,
                  borderColor: COLORS.info.light,
                }}
              >
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: COLORS.info.dark }}>
                  <AlertCircle className="size-5" />
                  Restricciones
                </h2>
                <div className="space-y-2 text-sm" style={{ color: COLORS.info.dark }}>
                  {promii.max_redemptions && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="size-4 mt-0.5 shrink-0" />
                      <span>Máximo {promii.max_redemptions} canjes disponibles en total</span>
                    </div>
                  )}
                  {!promii.allow_multiple_per_user && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="size-4 mt-0.5 shrink-0" />
                      <span>Solo un canje por usuario</span>
                    </div>
                  )}
                  {promii.max_units_per_user && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="size-4 mt-0.5 shrink-0" />
                      <span>Máximo {promii.max_units_per_user} unidades por usuario</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Related promiis */}
            {relatedPromiis.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.text.primary }}>
                  Promiis similares
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {relatedPromiis.map((related: any) => (
                    <Link
                      key={related.id}
                      href={`/p/${related.id}`}
                      className="group rounded-xl border overflow-hidden transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: COLORS.background.primary,
                        borderColor: COLORS.border.light,
                      }}
                    >
                      {related.photo_url ? (
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={related.photo_url}
                            alt={related.title}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                          />
                        </div>
                      ) : (
                        <div
                          className="h-40 flex items-center justify-center"
                          style={{ backgroundColor: COLORS.background.tertiary }}
                        >
                          <Sparkles className="size-12" style={{ color: COLORS.text.tertiary }} />
                        </div>
                      )}
                      <div className="p-4">
                        <h3
                          className="font-bold mb-2 line-clamp-2"
                          style={{ color: COLORS.text.primary }}
                        >
                          {related.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div>
                            {related.original_price_amount && (
                              <div className="text-xs line-through" style={{ color: COLORS.text.tertiary }}>
                                {related.price_currency} {related.original_price_amount.toFixed(2)}
                              </div>
                            )}
                            <div className="text-xl font-bold" style={{ color: COLORS.text.primary }}>
                              {related.price_currency} {related.price_amount.toFixed(2)}
                            </div>
                          </div>
                          {related.discount_label && (
                            <span
                              className="px-2 py-1 rounded-full text-xs font-semibold"
                              style={{
                                backgroundColor: COLORS.success.lighter,
                                color: COLORS.success.main,
                              }}
                            >
                              {related.discount_label}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-xs flex items-center gap-1" style={{ color: COLORS.text.secondary }}>
                          <MapPin className="size-3" />
                          <span>{related.city}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column - Sticky purchase card */}
          <aside className="lg:sticky lg:top-6 h-fit">
            <div
              className="rounded-2xl border shadow-lg p-6"
              style={{
                backgroundColor: COLORS.background.primary,
                borderColor: COLORS.border.light,
              }}
            >
              {/* Price */}
              <div className="mb-6">
                {promii.original_price_amount && (
                  <div className="text-sm line-through" style={{ color: COLORS.text.tertiary }}>
                    {promii.price_currency} {promii.original_price_amount.toFixed(2)}
                  </div>
                )}
                <div className="flex items-end justify-between gap-4">
                  <div className="text-4xl font-bold" style={{ color: COLORS.text.primary }}>
                    {promii.price_currency} {promii.price_amount.toFixed(2)}
                  </div>
                  {discountPercent && (
                    <span
                      className="px-3 py-1.5 rounded-full text-sm font-bold"
                      style={{
                        backgroundColor: COLORS.success.lighter,
                        color: COLORS.success.main,
                      }}
                    >
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Validity period */}
              <div
                className="mb-6 rounded-lg border p-3"
                style={{
                  backgroundColor: COLORS.background.secondary,
                  borderColor: COLORS.border.light,
                }}
              >
                <div className="flex items-center gap-2 text-sm mb-2">
                  <Calendar className="size-4" style={{ color: COLORS.text.tertiary }} />
                  <span className="font-semibold" style={{ color: COLORS.text.primary }}>
                    Válido hasta
                  </span>
                </div>
                <div className="text-sm" style={{ color: COLORS.text.secondary }}>
                  {new Date(promii.end_at).toLocaleDateString("es-VE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                {isEndingSoon && (
                  <div className="mt-2 text-xs font-semibold" style={{ color: COLORS.warning.main }}>
                    ⏰ ¡Solo quedan {daysUntilExpiry} días!
                  </div>
                )}
              </div>

              {/* Client-side interactive components */}
              <PromiiDetailClient
                promiiId={promii.id}
                promiiTitle={promii.title}
                priceAmount={promii.price_amount}
                priceCurrency={promii.price_currency}
                merchantId={promii.merchant_id}
                merchantName={promii.merchant?.business_name ?? "Comercio"}
                influencerCode={influencerCode ?? null}
                isExpired={isExpired}
                phone={promii.merchant?.phone ?? ""}
                notStarted={notStarted}
              />

              {/* Verification badge */}
              <div
                className="mt-6 pt-6 border-t text-center"
                style={{ borderColor: COLORS.border.light }}
              >
                <div className="flex items-center justify-center gap-2 text-sm font-semibold" style={{ color: COLORS.success.main }}>
                  <CheckCircle className="size-5" />
                  Promii verificado
                </div>
                <p className="mt-1 text-xs" style={{ color: COLORS.text.tertiary }}>
                  Comercio validado por Promii
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
