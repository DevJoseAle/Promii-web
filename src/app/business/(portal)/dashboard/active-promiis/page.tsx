"use client";

import * as React from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastService } from "@/lib/toast/toast.service";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PromiiRow } from "@/config/types/promiis";
import { fetchMyPromiis } from "@/lib/services/promiis/myPromiss.service";
import { supabase } from "@/lib/supabase/supabase.client";
import { COLORS } from "@/config/colors";
import { Activity, Search, RefreshCw, Pause, Edit, Eye, TrendingUp, Users, Calendar } from "lucide-react";

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(Number(amount ?? 0));
  } catch {
    return `${amount} ${currency}`;
  }
}

export default function ActivePromiisPage() {
  const { profile, loading: authLoading } = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<PromiiRow[]>([]);
  const [q, setQ] = React.useState("");

  const fetchActive = React.useCallback(async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const { data, error } = await fetchMyPromiis({ merchantId: profile.id });
      if (error) throw error;
      // Solo mostrar los activos
      setRows(data?.rows.filter(r => r.status === "active") || []);
    } catch (e: any) {
      ToastService.showErrorToast(
        e?.message ?? "No se pudieron cargar tus Promiis activos."
      );
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  React.useEffect(() => {
    if (authLoading) return;
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    fetchActive();
  }, [authLoading, profile?.id, fetchActive]);

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      return (
        !needle ||
        r.title?.toLowerCase().includes(needle) ||
        r.city?.toLowerCase().includes(needle) ||
        r.state?.toLowerCase().includes(needle)
      );
    });
  }, [rows, q]);

  async function pausePromii(promiiId: string) {
    try {
      const { error } = await supabase
        .from("promiis")
        .update({ status: "paused" })
        .eq("id", promiiId)
        .eq("merchant_id", profile?.id);

      if (error) throw error;

      setRows((prev) => prev.filter((p) => p.id !== promiiId));

      ToastService.showSuccessToast("Promii pausado exitosamente");
    } catch (e: any) {
      ToastService.showErrorToast(
        e?.message ?? "No se pudo pausar el Promii."
      );
    }
  }

  // Calcular estadísticas rápidas
  const totalActive = filtered.length;
  const totalRevenue = filtered.reduce((sum, r) => sum + (r.price_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header con diseño consistente - igual que Mis Promiis */}
      <div className="flex items-start gap-4">
        <div
          className="flex size-12 items-center justify-center rounded-xl shrink-0"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
          }}
        >
          <Activity className="size-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: COLORS.text.primary }}>
            Promiis Activos
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: COLORS.text.secondary }}>
            Promociones activas que los usuarios pueden ver y comprar ahora mismo.
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div
          className="rounded-xl border shadow-sm p-5"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS.success.lighter, color: COLORS.success.main }}
            >
              <TrendingUp className="size-5" />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
                {totalActive}
              </div>
              <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                Promiis activos
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl border shadow-sm p-5"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS.primary.lighter, color: COLORS.primary.main }}
            >
              <Users className="size-5" />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
                {formatMoney(totalRevenue, "USD")}
              </div>
              <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                Valor total en venta
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl border shadow-sm p-5"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS.info.lighter, color: COLORS.info.main }}
            >
              <Calendar className="size-5" />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
                --
              </div>
              <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                Ventas este mes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and refresh */}
      <div
        className="rounded-xl border shadow-sm p-6"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
              style={{ color: COLORS.text.tertiary }}
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por título, ciudad o estado..."
              className="h-10 pl-9"
              style={{
                backgroundColor: COLORS.background.tertiary,
                borderColor: COLORS.border.main,
              }}
            />
          </div>

          <Button
            variant="outline"
            onClick={fetchActive}
            disabled={loading}
            className="h-10 transition-all duration-200 hover:scale-105"
            style={{
              borderColor: COLORS.border.main,
              color: COLORS.text.secondary,
            }}
          >
            <RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} />
            {loading ? "Actualizando" : "Actualizar"}
          </Button>
        </div>
      </div>

      {/* Promiis grid */}
      <div className="space-y-4">
        {loading ? (
          <div
            className="rounded-xl border shadow-sm p-12 text-center"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <RefreshCw className="size-8 mx-auto mb-3 animate-spin" style={{ color: COLORS.primary.main }} />
            <p className="text-sm" style={{ color: COLORS.text.secondary }}>
              Cargando tus Promiis activos…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="rounded-xl border shadow-sm p-12 text-center"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <Activity className="size-12 mx-auto mb-3" style={{ color: COLORS.text.tertiary }} />
            <p className="text-sm mb-2" style={{ color: COLORS.text.secondary }}>
              {q ? "No hay Promiis activos que coincidan con la búsqueda." : "No tienes Promiis activos en este momento."}
            </p>
            <p className="text-xs mb-4" style={{ color: COLORS.text.tertiary }}>
              Los Promiis activos son visibles para todos los usuarios en la plataforma.
            </p>
            <Button
              asChild
              className="h-11 font-semibold transition-all duration-200 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
                color: COLORS.text.inverse,
              }}
            >
              <Link href="/business/dashboard/my-promiis">
                Ver todos mis Promiis
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border shadow-sm p-6 transition-all duration-200 hover:shadow-md"
                style={{
                  backgroundColor: COLORS.background.primary,
                  borderColor: COLORS.border.light,
                }}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex size-10 items-center justify-center rounded-lg shrink-0"
                        style={{
                          backgroundColor: COLORS.success.lighter,
                          color: COLORS.success.main,
                        }}
                      >
                        <Activity className="size-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1" style={{ color: COLORS.text.primary }}>
                          {r.title}
                        </h3>
                        {r.discount_label && (
                          <p className="text-sm mb-2" style={{ color: COLORS.text.secondary }}>
                            {r.discount_label}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 text-xs" style={{ color: COLORS.text.secondary }}>
                          <span className="flex items-center gap-1">
                            <span className="size-1 rounded-full" style={{ backgroundColor: COLORS.success.main }} />
                            {formatMoney(r.price_amount, r.price_currency)}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="size-1 rounded-full" style={{ backgroundColor: COLORS.text.tertiary }} />
                            {r.city}, {r.state}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="size-1 rounded-full" style={{ backgroundColor: COLORS.text.tertiary }} />
                            Hasta {new Date(r.end_at).toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 lg:shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 transition-all duration-200 hover:scale-105"
                      style={{
                        borderColor: COLORS.warning.main,
                        color: COLORS.warning.dark,
                      }}
                      onClick={() => pausePromii(r.id)}
                    >
                      <Pause className="mr-1 size-3" />
                      Pausar
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="h-9 transition-all duration-200 hover:scale-105"
                      style={{
                        borderColor: COLORS.border.main,
                        color: COLORS.text.secondary,
                      }}
                    >
                      <Link href={`/business/dashboard/create-promii/${r.id}`}>
                        <Edit className="mr-1 size-3" />
                        Editar
                      </Link>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="h-9 transition-all duration-200 hover:scale-105"
                      style={{
                        borderColor: COLORS.primary.main,
                        color: COLORS.primary.main,
                      }}
                    >
                      <Link href={`/p/${r.id}`}>
                        <Eye className="mr-1 size-3" />
                        Ver público
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
