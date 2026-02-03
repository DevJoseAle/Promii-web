"use client";

import * as React from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastService } from "@/lib/toast/toast.service";
import { getSupabaseBrowserClient } from "@/lib/supabase.ssr";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PromiiStatus, PromiiRow } from "@/config/types/promiis";
import { fetchMyPromiis } from "@/lib/services/promiis/myPromiss.service";

const STATUS_LABELS: Record<PromiiStatus, string> = {
  draft: "Borrador",
  active: "Activo",
  paused: "Pausado",
  expired: "Expirado",
};

const STATUS_BADGE: Record<PromiiStatus, string> = {
  draft: "bg-muted text-text-primary",
  active: "bg-emerald-50 text-emerald-700",
  paused: "bg-amber-50 text-amber-700",
  expired: "bg-slate-100 text-slate-600",
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
   const supabase = React.useMemo(() => getSupabaseBrowserClient(), []);
  const { profile, loading: authLoading } = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<PromiiRow[]>([]);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<PromiiStatus | "all">("all");
  const isMerchantPending = profile?.state === "pending";
  console.log(isMerchantPending);
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
      {/* Header */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">
              Mis Promiis
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Aquí ves todas tus promociones: borradores, pausadas, activas y
              expiradas.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              asChild
              className="bg-primary text-white hover:bg-primary/90"
            >
              <Link href="/business/dashboard/create-promii/new">
                Crear Promii
              </Link>
            </Button>
            <Button variant="outline" onClick={fetchMine} disabled={loading}>
              {loading ? "Actualizando..." : "Buscar"}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_220px]">
          <div className="relative">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por título, ciudad o estado..."
              className="h-10"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="all">Todos</option>
            <option value="draft">Borrador</option>
            <option value="paused">Pausado</option>
            <option value="active">Activo</option>
            <option value="expired">Expirado</option>
          </select>
        </div>
      </div>

      {/* Table / List */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="px-2 pb-3">
          <div className="text-sm font-semibold text-text-primary">
            {loading ? "Cargando..." : `${filtered.length} Promiis`}
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-text-secondary">
            Cargando tus Promiis…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-text-secondary">
            No hay Promiis para mostrar.
            <div className="mt-3">
              <Button
                asChild
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Link href="/business/dashboard/create-promii/new">
                  Crear Promii
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="text-left text-text-secondary">
                <tr className="border-b border-border">
                  <th className="px-3 py-3">Título</th>
                  <th className="px-3 py-3">Estado</th>
                  <th className="px-3 py-3">Precio</th>
                  <th className="px-3 py-3">Vigencia</th>
                  <th className="px-3 py-3">Ubicación</th>
                  <th className="px-3 py-3 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-3 py-4">
                      <div className="font-medium text-text-primary">
                        {r.title}
                      </div>
                      {r.discount_label ? (
                        <div className="mt-1 text-xs text-text-secondary">
                          {r.discount_label}
                        </div>
                      ) : null}
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                          STATUS_BADGE[r.status],
                        )}
                      >
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <div className="font-medium text-text-primary">
                        {formatMoney(r.price_amount, r.price_currency)}
                      </div>
                    </td>

                    <td className="px-3 py-4 text-text-secondary">
                      <div>
                        {new Date(r.start_at).toLocaleDateString("es-VE")}
                      </div>
                      <div>
                        → {new Date(r.end_at).toLocaleDateString("es-VE")}
                      </div>
                    </td>

                    <td className="px-3 py-4 text-text-secondary">
                      <div>{r.city}</div>
                      <div className="text-xs">{r.state}</div>
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex justify-end gap-2">
                        {!isMerchantPending &&(r.status === "draft" || r.status === "paused") ? (
                          <Button
                            size="sm"
                            className="bg-primary text-white hover:bg-primary/90"
                            onClick={() => setPromiiStatus(r.id, "active")}
                          >
                            Activar
                          </Button>
                        ) : null}

                        {r.status === "active" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPromiiStatus(r.id, "paused")}
                          >
                            Pausar
                          </Button>
                        ) : null}

                        <Button size="sm" variant="ghost" asChild>
                          <Link
                            href={`/business/dashboard/create-promii/${r.id}`}
                          >
                            Editar
                          </Link>
                        </Button>
                        <Button size="sm" variant="destructive" >
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
