"use client";

import { useEffect, useState } from "react";
import { PromiiCard, type Promii } from "@/components/ui/promii-card";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/config/colors";
import {
  SlidersHorizontal,
  Star,
  MapPin,
  DollarSign,
  Loader2,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { getPromiisByCategory, type PromiiFilters } from "@/lib/services/category/category.service";
import { ToastService } from "@/lib/toast/toast.service";

type Props = {
  categoryKey: string;
  subcategoryKey: string;
  subcategoryLabel: string;
};

type ActiveFilters = {
  priceRange?: string;
  minDiscount?: number;
  minRating?: number;
  sortBy?: "newest" | "price_low" | "price_high" | "rating" | "popular";
};

export default function SubcategoryPromiis({ categoryKey, subcategoryKey, subcategoryLabel }: Props) {
  const [promiis, setPromiis] = useState<Promii[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ActiveFilters>({});

  const LIMIT = 12;

  useEffect(() => {
    loadPromiis();
  }, [categoryKey, subcategoryKey, filters]);

  async function loadPromiis(isLoadMore = false) {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setOffset(0);
    }

    // Build filters
    const promiiFilters: PromiiFilters = {
      category: categoryKey,
      subcategory: subcategoryKey,
      limit: LIMIT,
      offset: isLoadMore ? offset : 0,
      sortBy: filters.sortBy || "popular",
    };

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map((v) => parseInt(v.replace(/\D/g, "")));
      if (min) promiiFilters.minPrice = min;
      if (max) promiiFilters.maxPrice = max;
    }

    if (filters.minDiscount) {
      promiiFilters.minDiscount = filters.minDiscount;
    }

    if (filters.minRating) {
      promiiFilters.minRating = filters.minRating;
    }

    const response = await getPromiisByCategory(promiiFilters);

    if (response.status === "success" && response.data) {
      if (isLoadMore) {
        setPromiis((prev) => [...prev, ...response.data!.promiis]);
        setOffset((prev) => prev + LIMIT);
      } else {
        setPromiis(response.data.promiis);
        setOffset(LIMIT);
      }
      setTotal(response.data.total);
      setHasMore(response.data.hasMore);
    } else {
      ToastService.showErrorToast("Error al cargar promociones");
    }

    setLoading(false);
    setLoadingMore(false);
  }

  function handleLoadMore() {
    loadPromiis(true);
  }

  function handleQuickFilter(filterType: string) {
    switch (filterType) {
      case "best-rated":
        setFilters({ ...filters, sortBy: "rating", minRating: 4.5 });
        break;
      case "price-low-high":
        setFilters({ ...filters, sortBy: "price_low" });
        break;
      case "newest":
        setFilters({ ...filters, sortBy: "newest" });
        break;
      default:
        break;
    }
  }

  function handlePriceRangeChange(range: string) {
    setFilters({ ...filters, priceRange: range });
    setShowFilters(false);
  }

  function handleDiscountChange(discount: number) {
    setFilters({ ...filters, minDiscount: discount });
    setShowFilters(false);
  }

  function handleRatingChange(rating: number) {
    setFilters({ ...filters, minRating: rating });
    setShowFilters(false);
  }

  function clearFilters() {
    setFilters({});
    setShowFilters(false);
  }

  if (loading && !promiis.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="size-12 animate-spin mb-4" style={{ color: COLORS.primary.main }} />
        <p className="text-sm" style={{ color: COLORS.text.secondary }}>
          Cargando promociones...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with count */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: COLORS.text.primary }}>
          {subcategoryLabel}
        </h2>
        <p className="text-sm mt-2" style={{ color: COLORS.text.secondary }}>
          {total} promoción{total !== 1 ? "es" : ""} disponible{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters bar */}
      <div
        className="flex items-center gap-3 flex-wrap rounded-xl border p-4"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="font-semibold transition-all duration-200"
          style={{
            borderColor: COLORS.border.main,
            color: COLORS.text.primary,
          }}
        >
          <SlidersHorizontal className="size-4 mr-2" />
          Filtros
          <ChevronDown
            className={`size-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`}
          />
        </Button>

        <div className="h-6 w-px" style={{ backgroundColor: COLORS.border.main }} />

        {/* Quick filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleQuickFilter("best-rated")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-105 ${
              filters.sortBy === "rating" ? "ring-2" : ""
            }`}
            style={{
              backgroundColor: COLORS.primary.lighter,
              color: COLORS.primary.dark,
              ringColor: COLORS.primary.main,
            }}
          >
            <Star className="size-3.5 inline mr-1" />
            Mejor valorados
          </button>

          <button
            onClick={() => handleQuickFilter("price-low-high")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-105 ${
              filters.sortBy === "price_low" ? "ring-2" : ""
            }`}
            style={{
              backgroundColor: COLORS.background.tertiary,
              color: COLORS.text.primary,
              border: `1px solid ${COLORS.border.main}`,
              ringColor: COLORS.primary.main,
            }}
          >
            <DollarSign className="size-3.5 inline mr-1" />
            Precio: bajo a alto
          </button>

          <button
            onClick={() => handleQuickFilter("newest")}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-105 ${
              filters.sortBy === "newest" ? "ring-2" : ""
            }`}
            style={{
              backgroundColor: COLORS.background.tertiary,
              color: COLORS.text.primary,
              border: `1px solid ${COLORS.border.main}`,
              ringColor: COLORS.primary.main,
            }}
          >
            <TrendingUp className="size-3.5 inline mr-1" />
            Más recientes
          </button>
        </div>

        {/* Clear filters button */}
        {Object.keys(filters).length > 0 && (
          <>
            <div className="h-6 w-px" style={{ backgroundColor: COLORS.border.main }} />
            <button
              onClick={clearFilters}
              className="text-sm font-medium transition-colors"
              style={{ color: COLORS.error.main }}
            >
              Limpiar filtros
            </button>
          </>
        )}
      </div>

      {/* Filters panel (collapsible) */}
      {showFilters && (
        <div
          className="rounded-xl border p-6 animate-in slide-in-from-top-4"
          style={{
            backgroundColor: COLORS.background.secondary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="grid gap-6 md:grid-cols-3">
            {/* Price range */}
            <div>
              <label className="text-sm font-semibold mb-3 block" style={{ color: COLORS.text.primary }}>
                Rango de precio
              </label>
              <div className="space-y-2">
                {[
                  { label: "$0 - $10", value: "0-10" },
                  { label: "$10 - $20", value: "10-20" },
                  { label: "$20 - $50", value: "20-50" },
                  { label: "$50+", value: "50-" },
                ].map((range) => (
                  <button
                    key={range.value}
                    onClick={() => handlePriceRangeChange(range.value)}
                    className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      filters.priceRange === range.value ? "ring-2" : ""
                    }`}
                    style={{
                      backgroundColor:
                        filters.priceRange === range.value ? COLORS.primary.lighter : "transparent",
                      color: filters.priceRange === range.value ? COLORS.primary.dark : COLORS.text.secondary,
                      ringColor: COLORS.primary.main,
                    }}
                  >
                    <span className="text-sm">{range.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Discount */}
            <div>
              <label className="text-sm font-semibold mb-3 block" style={{ color: COLORS.text.primary }}>
                Descuento mínimo
              </label>
              <div className="space-y-2">
                {[
                  { label: "30%+", value: 30 },
                  { label: "40%+", value: 40 },
                  { label: "50%+", value: 50 },
                  { label: "60%+", value: 60 },
                ].map((discount) => (
                  <button
                    key={discount.value}
                    onClick={() => handleDiscountChange(discount.value)}
                    className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      filters.minDiscount === discount.value ? "ring-2" : ""
                    }`}
                    style={{
                      backgroundColor:
                        filters.minDiscount === discount.value ? COLORS.success.lighter : "transparent",
                      color:
                        filters.minDiscount === discount.value ? COLORS.success.dark : COLORS.text.secondary,
                      ringColor: COLORS.success.main,
                    }}
                  >
                    <span className="text-sm">{discount.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="text-sm font-semibold mb-3 block" style={{ color: COLORS.text.primary }}>
                Calificación mínima
              </label>
              <div className="space-y-2">
                {[
                  { label: "4.5+", value: 4.5 },
                  { label: "4.0+", value: 4.0 },
                  { label: "3.5+", value: 3.5 },
                  { label: "3.0+", value: 3.0 },
                ].map((rating) => (
                  <button
                    key={rating.value}
                    onClick={() => handleRatingChange(rating.value)}
                    className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      filters.minRating === rating.value ? "ring-2" : ""
                    }`}
                    style={{
                      backgroundColor:
                        filters.minRating === rating.value ? COLORS.warning.lighter : "transparent",
                      color: filters.minRating === rating.value ? COLORS.warning.dark : COLORS.text.secondary,
                      ringColor: COLORS.warning.main,
                    }}
                  >
                    <Star className="size-3.5 fill-current" style={{ color: COLORS.warning.main }} />
                    <span className="text-sm">{rating.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {promiis.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center"
          style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
        >
          <TrendingUp className="size-16 mx-auto mb-4" style={{ color: COLORS.text.tertiary }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
            No hay promociones disponibles
          </h3>
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            No encontramos promiis con estos filtros. Intenta ajustar tu búsqueda.
          </p>
        </div>
      ) : (
        <section>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {promiis.map((p) => (
              <PromiiCard key={p.id} p={p} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="font-semibold transition-all duration-200 hover:scale-105 disabled:scale-100"
                style={{
                  background: loadingMore
                    ? COLORS.text.tertiary
                    : `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
                  color: COLORS.text.inverse,
                }}
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Cargando...
                  </span>
                ) : (
                  "Cargar más promociones"
                )}
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
