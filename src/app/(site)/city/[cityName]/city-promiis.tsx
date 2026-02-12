"use client";

import { useEffect, useState } from "react";
import { PromiiCard, type Promii } from "@/components/ui/promii-card";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/config/colors";
import { TrendingUp, Loader2, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase/supabase.client";
import { ToastService } from "@/lib/toast/toast.service";

type Props = {
  cityName: string;
};

export default function CityPromiis({ cityName }: Props) {
  const [promiis, setPromiis] = useState<Promii[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  const LIMIT = 12;

  useEffect(() => {
    loadPromiis();
  }, [cityName]);

  async function loadPromiis(isLoadMore = false) {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setOffset(0);
    }

    try {
      // Query promiis by city
      let query = supabase
        .from("promiis")
        .select(
          `
          id,
          title,
          price_amount,
          price_currency,
          original_price_amount,
          discount_label,
          city,
          state,
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
        .gte("end_at", new Date().toISOString())
        .ilike("city", `%${cityName}%`) // Case-insensitive partial match
        .order("created_at", { ascending: false })
        .range(isLoadMore ? offset : 0, (isLoadMore ? offset : 0) + LIMIT - 1);

      const { data: promiisData, error, count } = await query;

      if (error) {
        console.error("[CityPromiis] Error:", error);
        ToastService.showErrorToast("Error al cargar promociones");
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
          // Get purchase count
          const { count: purchaseCount } = await supabase
            .from("promii_purchases")
            .select("*", { count: "exact", head: true })
            .eq("promii_id", promii.id);

          // Calculate discount
          const discount = promii.original_price_amount && promii.price_amount
            ? Math.round(((promii.original_price_amount - promii.price_amount) / promii.original_price_amount) * 100)
            : 0;

          return {
            id: promii.id,
            title: promii.title,
            merchant: promii.merchant?.business_name || "Sin nombre",
            location: promii.merchant
              ? `${promii.merchant.city || promii.city} · ${promii.merchant.state || promii.state}`
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
      console.error("[CityPromiis] Unexpected error:", error);
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
          <MapPin className="size-16 mx-auto mb-4" style={{ color: COLORS.text.tertiary }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
            No hay promociones disponibles
          </h3>
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            Aún no hay promiis activos en {cityName}. Vuelve pronto.
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
              Promociones en {cityName}
            </h2>
            <p className="text-sm" style={{ color: COLORS.text.secondary }}>
              {total} promoción{total !== 1 ? "es" : ""} disponible{total !== 1 ? "s" : ""}
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
