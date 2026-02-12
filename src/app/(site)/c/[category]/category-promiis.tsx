"use client";

import { useEffect, useState } from "react";
import { PromiiCard, type Promii } from "@/components/ui/promii-card";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/config/colors";
import { TrendingUp, Loader2 } from "lucide-react";
import { getPromiisByCategory, type PromiiFilters } from "@/lib/services/category/category.service";
import { ToastService } from "@/lib/toast/toast.service";

type Props = {
  categoryKey: string;
  categoryLabel: string;
};

export default function CategoryPromiis({ categoryKey, categoryLabel }: Props) {
  const [promiis, setPromiis] = useState<Promii[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  const LIMIT = 12;

  useEffect(() => {
    loadPromiis();
  }, [categoryKey]);

  async function loadPromiis(isLoadMore = false) {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    const filters: PromiiFilters = {
      category: categoryKey,
      limit: LIMIT,
      offset: isLoadMore ? offset : 0,
      sortBy: "popular",
    };

    const response = await getPromiisByCategory(filters);

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

  if (loading) {
    return (
      <section
        className="rounded-2xl border p-12"
        style={{
          backgroundColor: COLORS.background.secondary,
          borderColor: COLORS.border.light,
        }}
      >
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="size-12 animate-spin mb-4" style={{ color: COLORS.primary.main }} />
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            Cargando promociones...
          </p>
        </div>
      </section>
    );
  }

  if (promiis.length === 0) {
    return (
      <section
        className="rounded-2xl border p-12"
        style={{
          backgroundColor: COLORS.background.secondary,
          borderColor: COLORS.border.light,
        }}
      >
        <div className="text-center">
          <TrendingUp className="size-16 mx-auto mb-4" style={{ color: COLORS.text.tertiary }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
            No hay promociones disponibles
          </h3>
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            Aún no hay promiis activos en esta categoría. Vuelve pronto.
          </p>
        </div>
      </section>
    );
  }

  return (
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
            <h2 className="text-xl font-bold" style={{ color: COLORS.text.primary }}>
              Destacados en {categoryLabel}
            </h2>
            <p className="text-sm" style={{ color: COLORS.text.secondary }}>
              {total} promocion{total !== 1 ? "es" : ""} disponible{total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {promiis.map((p) => (
          <PromiiCard key={p.id} p={p} />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center">
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
  );
}
