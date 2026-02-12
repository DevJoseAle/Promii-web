"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PromiiCard, type Promii } from "@/components/ui/promii-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COLORS } from "@/config/colors";
import {
  Search,
  SlidersHorizontal,
  X,
  Loader2,
  MapPin,
  DollarSign,
  Star,
  Grid3x3,
  ChevronDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase/supabase.client";
import { ToastService } from "@/lib/toast/toast.service";
import { VE_STATES, getCitiesForState } from "@/config/location";
import { CATEGORIES } from "@/config/categories";
import { mapCategoryToDb } from "@/lib/services/category/category.service";

type SearchFilters = {
  query: string;
  state: string;
  city: string;
  category: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy: "relevant" | "newest" | "price_low" | "price_high" | "rating";
};

export default function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [promiis, setPromiis] = useState<Promii[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get("q") || "",
    state: searchParams.get("state") || "",
    city: searchParams.get("city") || "",
    category: searchParams.get("category") || "",
    sortBy: (searchParams.get("sort") as any) || "relevant",
  });

  const LIMIT = 12;

  const cities = filters.state ? getCitiesForState(filters.state) : [];

  useEffect(() => {
    loadResults();
  }, [filters]);

  async function loadResults(isLoadMore = false) {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setOffset(0);
    }

    try {
      let query = supabase
        .from("promiis")
        .select(
          `
          id,
          title,
          description,
          price_amount,
          price_currency,
          original_price_amount,
          discount_label,
          city,
          state,
          category_primary,
          created_at,
          merchant:merchant_id (
            business_name,
            city,
            state
          )
        `,
          { count: "exact" }
        )
        .eq("status", "active")
        .gte("end_at", new Date().toISOString());

      // Text search
      if (filters.query) {
        query = query.or(
          `title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`
        );
      }

      // State filter
      if (filters.state) {
        query = query.eq("state", filters.state);
      }

      // City filter
      if (filters.city) {
        query = query.eq("city", filters.city);
      }

      // Category filter
      if (filters.category) {
        const dbCategory = mapCategoryToDb(filters.category);
        query = query.eq("category_primary", dbCategory);
      }

      // Price filters
      if (filters.minPrice !== undefined) {
        query = query.gte("price_amount", filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query = query.lte("price_amount", filters.maxPrice);
      }

      // Sorting
      switch (filters.sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "price_low":
          query = query.order("price_amount", { ascending: true });
          break;
        case "price_high":
          query = query.order("price_amount", { ascending: false });
          break;
        case "relevant":
        default:
          query = query.order("created_at", { ascending: false });
          break;
      }

      // Pagination
      query = query.range(
        isLoadMore ? offset : 0,
        (isLoadMore ? offset : 0) + LIMIT - 1
      );

      const { data: promiisData, error, count } = await query;

      if (error) {
        console.error("[SearchResults] Error:", error);
        ToastService.showErrorToast("Error al buscar");
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      if (!promiisData) {
        setPromiis([]);
        setTotal(0);
        setHasMore(false);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      // Transform to PromiiCard format
      const transformedPromiis: Promii[] = await Promise.all(
        promiisData.map(async (promii: any) => {
          const { count: purchaseCount } = await supabase
            .from("promii_purchases")
            .select("*", { count: "exact", head: true })
            .eq("promii_id", promii.id);

          const discount =
            promii.original_price_amount && promii.price_amount
              ? Math.round(
                  ((promii.original_price_amount - promii.price_amount) /
                    promii.original_price_amount) *
                    100
                )
              : 0;

          return {
            id: promii.id,
            title: promii.title,
            merchant: promii.merchant?.business_name || "Sin nombre",
            location: promii.merchant
              ? `${promii.merchant.city || promii.city} · ${
                  promii.merchant.state || promii.state
                }`
              : `${promii.city} · ${promii.state}`,
            rating: 4.5,
            sold: purchaseCount || 0,
            oldPrice: promii.original_price_amount || undefined,
            price: promii.price_amount,
            discountPct: discount,
            tag: undefined,
          };
        })
      );

      if (isLoadMore) {
        setPromiis((prev) => [...prev, ...transformedPromiis]);
        setOffset((prev) => prev + LIMIT);
      } else {
        setPromiis(transformedPromiis);
        setOffset(LIMIT);
      }

      setTotal(count || 0);
      setHasMore((isLoadMore ? offset : 0) + LIMIT < (count || 0));
    } catch (error) {
      console.error("[SearchResults] Unexpected error:", error);
      ToastService.showErrorToast("Error al buscar");
    }

    setLoading(false);
    setLoadingMore(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadResults();
  }

  function updateFilter(key: keyof SearchFilters, value: any) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setFilters({
      query: filters.query, // Keep search query
      state: "",
      city: "",
      category: "",
      sortBy: "relevant",
    });
  }

  const hasActiveFilters =
    filters.state || filters.city || filters.category || filters.minPrice;

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: COLORS.text.primary }}
        >
          Búsqueda de Promociones
        </h1>
        {filters.query && (
          <p className="text-base" style={{ color: COLORS.text.secondary }}>
            Resultados para: <strong>"{filters.query}"</strong>
          </p>
        )}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
              style={{ color: COLORS.text.tertiary }}
            />
            <Input
              type="text"
              placeholder="Buscar promociones..."
              value={filters.query}
              onChange={(e) => updateFilter("query", e.target.value)}
              className="h-12 pl-11"
              style={{
                backgroundColor: COLORS.background.primary,
                borderColor: COLORS.border.main,
              }}
            />
          </div>
          <Button
            type="submit"
            className="h-12 px-8"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
              color: COLORS.text.inverse,
            }}
          >
            Buscar
          </Button>
        </div>
      </form>

      {/* Filters Bar */}
      <div
        className="rounded-xl border p-4"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="font-semibold"
            style={{
              borderColor: COLORS.border.main,
              color: COLORS.text.primary,
            }}
          >
            <SlidersHorizontal className="size-4 mr-2" />
            Filtros
            <ChevronDown
              className={`size-4 ml-2 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </Button>

          {/* Quick filters */}
          <div className="h-6 w-px" style={{ backgroundColor: COLORS.border.main }} />

          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter("sortBy", e.target.value)}
            className="h-9 px-3 rounded-lg border text-sm"
            style={{
              backgroundColor: COLORS.background.tertiary,
              borderColor: COLORS.border.main,
              color: COLORS.text.primary,
            }}
          >
            <option value="relevant">Más relevantes</option>
            <option value="newest">Más recientes</option>
            <option value="price_low">Precio: menor a mayor</option>
            <option value="price_high">Precio: mayor a menor</option>
          </select>

          {hasActiveFilters && (
            <>
              <div className="h-6 w-px" style={{ backgroundColor: COLORS.border.main }} />
              <button
                onClick={clearFilters}
                className="text-sm font-medium transition-colors"
                style={{ color: COLORS.error.main }}
              >
                <X className="size-4 inline mr-1" />
                Limpiar filtros
              </button>
            </>
          )}

          <div className="ml-auto text-sm" style={{ color: COLORS.text.secondary }}>
            {total} resultado{total !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div
          className="rounded-xl border p-6 animate-in slide-in-from-top-4"
          style={{
            backgroundColor: COLORS.background.secondary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="grid gap-6 md:grid-cols-4">
            {/* Estado */}
            <div>
              <label
                className="text-sm font-semibold mb-3 block"
                style={{ color: COLORS.text.primary }}
              >
                <MapPin className="size-4 inline mr-1" />
                Estado
              </label>
              <select
                value={filters.state}
                onChange={(e) => {
                  updateFilter("state", e.target.value);
                  updateFilter("city", ""); // Reset city when state changes
                }}
                className="w-full h-10 px-3 rounded-lg border text-sm"
                style={{
                  backgroundColor: COLORS.background.primary,
                  borderColor: COLORS.border.main,
                  color: COLORS.text.primary,
                }}
              >
                <option value="">Todos los estados</option>
                {VE_STATES.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ciudad */}
            <div>
              <label
                className="text-sm font-semibold mb-3 block"
                style={{ color: COLORS.text.primary }}
              >
                <MapPin className="size-4 inline mr-1" />
                Ciudad
              </label>
              <select
                value={filters.city}
                onChange={(e) => updateFilter("city", e.target.value)}
                disabled={!filters.state}
                className="w-full h-10 px-3 rounded-lg border text-sm disabled:opacity-50"
                style={{
                  backgroundColor: COLORS.background.primary,
                  borderColor: COLORS.border.main,
                  color: COLORS.text.primary,
                }}
              >
                <option value="">Todas las ciudades</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label
                className="text-sm font-semibold mb-3 block"
                style={{ color: COLORS.text.primary }}
              >
                <Grid3x3 className="size-4 inline mr-1" />
                Categoría
              </label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter("category", e.target.value)}
                className="w-full h-10 px-3 rounded-lg border text-sm"
                style={{
                  backgroundColor: COLORS.background.primary,
                  borderColor: COLORS.border.main,
                  color: COLORS.text.primary,
                }}
              >
                <option value="">Todas las categorías</option>
                {CATEGORIES.filter((c) => c.href !== "/" && c.href !== "/influencers").map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Precio */}
            <div>
              <label
                className="text-sm font-semibold mb-3 block"
                style={{ color: COLORS.text.primary }}
              >
                <DollarSign className="size-4 inline mr-1" />
                Precio máximo
              </label>
              <select
                value={filters.maxPrice || ""}
                onChange={(e) =>
                  updateFilter("maxPrice", e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full h-10 px-3 rounded-lg border text-sm"
                style={{
                  backgroundColor: COLORS.background.primary,
                  borderColor: COLORS.border.main,
                  color: COLORS.text.primary,
                }}
              >
                <option value="">Sin límite</option>
                <option value="10">Hasta $10</option>
                <option value="20">Hasta $20</option>
                <option value="50">Hasta $50</option>
                <option value="100">Hasta $100</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2
            className="size-12 animate-spin mb-4"
            style={{ color: COLORS.primary.main }}
          />
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            Buscando promociones...
          </p>
        </div>
      ) : promiis.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <Search
            className="size-16 mx-auto mb-4"
            style={{ color: COLORS.text.tertiary }}
          />
          <h3
            className="text-lg font-bold mb-2"
            style={{ color: COLORS.text.primary }}
          >
            No encontramos resultados
          </h3>
          <p className="text-sm mb-4" style={{ color: COLORS.text.secondary }}>
            Intenta con otros términos de búsqueda o ajusta los filtros
          </p>
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              style={{
                borderColor: COLORS.border.main,
                color: COLORS.text.primary,
              }}
            >
              Limpiar filtros
            </Button>
          )}
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
                onClick={() => loadResults(true)}
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
                  "Cargar más resultados"
                )}
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
