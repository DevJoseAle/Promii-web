"use client";

import * as React from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastService } from "@/lib/toast/toast.service";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PromiiStatus, PromiiRow } from "@/config/types/promiis";
import { fetchMyPromiis } from "@/lib/services/promiis/myPromiss.service";
import { FullscreenLoading } from "@/components/ui/FullScreenLoading";
import { supabase } from "@/lib/supabase/supabase.client";
import { COLORS } from "@/config/colors";
import { FileText, Search, RefreshCw, Plus, Edit, Trash2, Play, Pause } from "lucide-react";

const STATUS_LABELS: Record<PromiiStatus, string> = {
  draft: "Borrador",
  active: "Activo",
  paused: "Pausado",
  expired: "Expirado",
};

const STATUS_CONFIG: Record<PromiiStatus, { bg: string; text: string; border: string }> = {
  draft: {
    bg: COLORS.neutral[100],
    text: COLORS.text.secondary,
    border: COLORS.border.light,
  },
  active: {
    bg: COLORS.success.lighter,
    text: COLORS.success.dark,
    border: COLORS.success.light,
  },
  paused: {
    bg: COLORS.warning.lighter,
    text: COLORS.warning.dark,
    border: COLORS.warning.light,
  },
  expired: {
    bg: COLORS.neutral[100],
    text: COLORS.neutral[600],
    border: COLORS.border.light,
  },
};

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

export default function MyPromiisPage() {
  const { profile, loading: authLoading, session } = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<PromiiRow[]>([]);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<PromiiStatus | "all">("all");
  const isMerchantPending = profile?.state === "pending";
  console.log({profile, session, isMerchantPending, authLoading});

  const fetchMine = React.useCallback(async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const { data, error } = await fetchMyPromiis({ merchantId: profile.id });
      if (error) throw error;
      setRows(data?.rows || []);
    } catch (e: any) {
      ToastService.showErrorToast(
        e?.message ?? "No se pudieron cargar tus Promiis."
      );
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  React.useEffect(() => {
    // Espera a que auth termine y exista profile
    if (authLoading) return;
    if (!profile?.id) {
      setLoading(false); // opcional: no te quedas “cargando” infinito si no hay profile
      return;
    }
    fetchMine();
  }, [authLoading, profile?.id, fetchMine]);

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQ =
        !needle ||
        r.title?.toLowerCase().includes(needle) ||
        r.city?.toLowerCase().includes(needle) ||
        r.state?.toLowerCase().includes(needle);

      const matchesStatus = status === "all" ? true : r.status === status;

      return matchesQ && matchesStatus;
    });
  }, [rows, q, status]);

  async function setPromiiStatus(promiiId: string, next: PromiiStatus) {
    try {
      const { error } = await supabase
        .from("promiis")
        .update({ status: next })
        .eq("id", promiiId)
        .eq("merchant_id", profile?.id);

      if (error) throw error;

      setRows((prev) =>
        prev.map((p) => (p.id === promiiId ? { ...p, status: next } : p)),
      );

      ToastService.showSuccessToast(
        `Estado actualizado: ${STATUS_LABELS[next]}`,
      );
    } catch (e: any) {
      ToastService.showErrorToast(
        e?.message ?? "No se pudo actualizar el estado.",
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header con diseño consistente */}
      <div className="flex items-start gap-4">
        <div
          className="flex size-12 items-center justify-center rounded-xl shrink-0"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
          }}
        >
          <FileText className="size-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: COLORS.text.primary }}>
            Mis Promiis
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: COLORS.text.secondary }}>
            Gestiona todas tus promociones: borradores, pausadas, activas y expiradas.
          </p>
        </div>
      </div>

      {/* Filters card */}
      <div
        className="rounded-xl border shadow-sm p-6"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="relative">
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

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="h-10 w-full sm:w-[200px] rounded-lg border px-4 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-3"
              style={{
                backgroundColor: COLORS.background.tertiary,
                borderColor: COLORS.border.main,
                color: COLORS.text.primary,
              }}
            >
              <option value="all">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="paused">Pausado</option>
              <option value="active">Activo</option>
              <option value="expired">Expirado</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchMine}
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

            <Button
              asChild
              className="h-11 font-semibold transition-all duration-200 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
                color: COLORS.text.inverse,
              }}
            >
              <Link href="/business/dashboard/create-promii/new">
                <Plus className="mr-2 size-4" />
                Crear Promii
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div
        className="rounded-xl border shadow-sm overflow-hidden"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        <div className="px-6 py-4 border-b" style={{ borderColor: COLORS.border.light }}>
          <div className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
            {loading ? "Cargando..." : `${filtered.length} ${filtered.length === 1 ? "Promii" : "Promiis"}`}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm" style={{ color: COLORS.text.secondary }}>
            <RefreshCw className="size-8 mx-auto mb-3 animate-spin" style={{ color: COLORS.primary.main }} />
            Cargando tus Promiis…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="size-12 mx-auto mb-3" style={{ color: COLORS.text.tertiary }} />
            <p className="text-sm mb-4" style={{ color: COLORS.text.secondary }}>
              {q || status !== "all" ? "No hay Promiis que coincidan con los filtros." : "No has creado ningún Promii todavía."}
            </p>
            <Button
              asChild
              className="h-11 font-semibold transition-all duration-200 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
                color: COLORS.text.inverse,
              }}
            >
              <Link href="/business/dashboard/create-promii/new">
                <Plus className="mr-2 size-4" />
                Crear tu primer Promii
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead style={{ color: COLORS.text.secondary }}>
                <tr className="border-b" style={{ borderColor: COLORS.border.light }}>
                  <th className="px-6 py-3 text-left font-semibold">Título</th>
                  <th className="px-6 py-3 text-left font-semibold">Estado</th>
                  <th className="px-6 py-3 text-left font-semibold">Precio</th>
                  <th className="px-6 py-3 text-left font-semibold">Vigencia</th>
                  <th className="px-6 py-3 text-left font-semibold">Ubicación</th>
                  <th className="px-6 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b transition-colors duration-200 hover:bg-opacity-50"
                    style={{ borderColor: COLORS.border.light }}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium" style={{ color: COLORS.text.primary }}>
                        {r.title}
                      </div>
                      {r.discount_label ? (
                        <div className="mt-1 text-xs" style={{ color: COLORS.text.secondary }}>
                          {r.discount_label}
                        </div>
                      ) : null}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border"
                        style={{
                          backgroundColor: STATUS_CONFIG[r.status].bg,
                          color: STATUS_CONFIG[r.status].text,
                          borderColor: STATUS_CONFIG[r.status].border,
                        }}
                      >
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium" style={{ color: COLORS.text.primary }}>
                        {formatMoney(r.price_amount, r.price_currency)}
                      </div>
                    </td>

                    <td className="px-6 py-4" style={{ color: COLORS.text.secondary }}>
                      <div className="text-xs">
                        {new Date(r.start_at).toLocaleDateString("es-VE", { day: "2-digit", month: "short" })}
                      </div>
                      <div className="text-xs mt-0.5">
                        → {new Date(r.end_at).toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </td>

                    <td className="px-6 py-4" style={{ color: COLORS.text.secondary }}>
                      <div className="text-xs">{r.city}</div>
                      <div className="text-xs mt-0.5 opacity-75">{r.state}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {!isMerchantPending && (r.status === "draft" || r.status === "paused") ? (
                          <Button
                            size="sm"
                            className="h-9 font-semibold transition-all duration-200 hover:scale-105"
                            style={{
                              background: `linear-gradient(135deg, ${COLORS.success.main} 0%, ${COLORS.success.light} 100%)`,
                              color: COLORS.text.inverse,
                            }}
                            onClick={() => setPromiiStatus(r.id, "active")}
                          >
                            <Play className="mr-1 size-3" />
                            Activar
                          </Button>
                        ) : null}

                        {r.status === "active" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 transition-all duration-200 hover:scale-105"
                            style={{
                              borderColor: COLORS.warning.main,
                              color: COLORS.warning.dark,
                            }}
                            onClick={() => setPromiiStatus(r.id, "paused")}
                          >
                            <Pause className="mr-1 size-3" />
                            Pausar
                          </Button>
                        ) : null}

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
                          className="h-9 transition-all duration-200 hover:scale-105"
                          style={{
                            borderColor: COLORS.error.main,
                            color: COLORS.error.dark,
                          }}
                        >
                          <Trash2 className="mr-1 size-3" />
                          Borrar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
