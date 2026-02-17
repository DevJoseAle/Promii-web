"use client";

import { useState, useEffect } from "react";
import { COLORS } from "@/config/colors";
import {
  getPromiis,
  pausePromii,
  activatePromii,
  type PromiiAdmin,
  type PromiiStatus,
} from "@/lib/services/admin/promiis.admin.service";
import { Button } from "@/components/ui/button";
import {
  Tag,
  Pause,
  Play,
  Clock,
  CheckCircle,
  Ban,
  Loader2,
  Filter,
  Pencil,
} from "lucide-react";
import { ToastService } from "@/lib/toast/toast.service";
import { PromiiEditModal } from "./promii-edit-modal";

const STATUS_CONFIG = {
  draft: { label: "Borrador", icon: Ban, color: COLORS.text.tertiary, bg: COLORS.neutral[200] },
  active: { label: "Activo", icon: CheckCircle, color: COLORS.success.main, bg: COLORS.success.lighter },
  paused: { label: "Pausado", icon: Pause, color: COLORS.warning.main, bg: COLORS.warning.lighter },
  expired: { label: "Expirado", icon: Clock, color: COLORS.error.main, bg: COLORS.error.lighter },
};

export default function PromiisAdminPage() {
  const [promiis, setPromiis] = useState<PromiiAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<PromiiStatus | "all">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPromii, setEditingPromii] = useState<PromiiAdmin | null>(null);

  useEffect(() => {
    loadPromiis();
  }, [filterStatus]);

  async function loadPromiis() {
    setLoading(true);
    const status = filterStatus === "all" ? undefined : filterStatus;
    const response = await getPromiis(status);

    if (response.status === "success") {
      setPromiis(response.data);
    } else {
      ToastService.showErrorToast(response.error || "Error al cargar promiis");
    }
    setLoading(false);
  }

  async function handlePause(promiiId: string) {
    if (!confirm("¿Estás seguro de pausar este promii?")) return;

    setActionLoading(promiiId);
    const response = await pausePromii(promiiId);

    if (response.status === "success") {
      ToastService.showSuccessToast("Promii pausado exitosamente");
      loadPromiis();
    } else {
      ToastService.showErrorToast(response.error || "Error al pausar promii");
    }
    setActionLoading(null);
  }

  async function handleActivate(promiiId: string) {
    setActionLoading(promiiId);
    const response = await activatePromii(promiiId);

    if (response.status === "success") {
      ToastService.showSuccessToast("Promii activado exitosamente");
      loadPromiis();
    } else {
      ToastService.showErrorToast(response.error || "Error al activar promii");
    }
    setActionLoading(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.text.primary }}>
          Gestión de Promiis
        </h1>
        <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
          Moderar y gestionar promiis de la plataforma
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="size-4" style={{ color: COLORS.text.secondary }} />
          <span className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
            Filtrar por estado:
          </span>
        </div>
        {(["all", "active", "paused", "expired"] as const).map((status) => (
          <Button
            key={status}
            onClick={() => setFilterStatus(status)}
            variant={filterStatus === status ? "default" : "outline"}
            size="sm"
            className="transition-all duration-200"
            style={
              filterStatus === status
                ? {
                    backgroundColor: COLORS.primary.main,
                    color: "white",
                    borderColor: COLORS.primary.main,
                  }
                : {
                    color: COLORS.text.secondary,
                    borderColor: COLORS.border.main,
                  }
            }
          >
            {status === "all" ? "Todos" : STATUS_CONFIG[status].label}
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {(["active", "paused", "expired"] as PromiiStatus[]).map((status) => {
          const config = STATUS_CONFIG[status];
          const Icon = config.icon;
          const count = promiis.filter((p) => p.status === status).length;

          return (
            <div
              key={status}
              className="rounded-xl border p-5"
              style={{
                backgroundColor: COLORS.background.primary,
                borderColor: COLORS.border.light,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: config.bg }}>
                  <Icon className="size-5" style={{ color: config.color }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
                    {filterStatus === "all" ? count : promiis.length}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                    {config.label}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin" style={{ color: COLORS.primary.main }} />
          </div>
        ) : promiis.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="size-12 mx-auto mb-3" style={{ color: COLORS.text.tertiary }} />
            <p className="text-sm" style={{ color: COLORS.text.secondary }}>
              No hay promiis {filterStatus !== "all" && `en estado "${STATUS_CONFIG[filterStatus].label}"`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: COLORS.background.secondary }}>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Merchant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Precios
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Descuento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Expira
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {promiis.map((promii) => {
                  const config = STATUS_CONFIG[promii.status];
                  const Icon = config.icon;
                  const isActionLoading = actionLoading === promii.id;

                  return (
                    <tr
                      key={promii.id}
                      className="border-t transition-colors hover:bg-gray-50"
                      style={{ borderColor: COLORS.border.light }}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm max-w-xs truncate" style={{ color: COLORS.text.primary }}>
                          {promii.title}
                        </div>
                        {promii.description && (
                          <div className="text-xs max-w-xs truncate mt-1" style={{ color: COLORS.text.tertiary }}>
                            {promii.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm" style={{ color: COLORS.text.secondary }}>
                          {promii.merchant_name || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm" style={{ color: COLORS.text.secondary }}>
                          {promii.original_price_amount && (
                            <span className="line-through text-xs" style={{ color: COLORS.text.tertiary }}>
                              ${promii.original_price_amount.toFixed(2)}
                            </span>
                          )}
                          <span className={promii.original_price_amount ? "ml-2 font-semibold" : "font-semibold"} style={{ color: COLORS.success.main }}>
                            ${promii.price_amount.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                          {promii.discount_label || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                          style={{ backgroundColor: config.bg, color: config.color }}
                        >
                          <Icon className="size-3" />
                          {config.label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm" style={{ color: COLORS.text.secondary }}>
                          {promii.end_at
                            ? new Date(promii.end_at).toLocaleDateString("es-VE")
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {promii.status === "active" && (
                            <Button
                              onClick={() => handlePause(promii.id)}
                              disabled={isActionLoading}
                              size="sm"
                              variant="outline"
                              className="transition-all duration-200 hover:scale-105"
                              style={{
                                color: COLORS.warning.main,
                                borderColor: COLORS.warning.main,
                              }}
                            >
                              {isActionLoading ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <>
                                  <Pause className="size-4 mr-1" />
                                  Pausar
                                </>
                              )}
                            </Button>
                          )}
                          {promii.status === "paused" && (
                            <Button
                              onClick={() => handleActivate(promii.id)}
                              disabled={isActionLoading}
                              size="sm"
                              className="transition-all duration-200 hover:scale-105"
                              style={{
                                backgroundColor: COLORS.success.main,
                                color: "white",
                              }}
                            >
                              {isActionLoading ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <>
                                  <Play className="size-4 mr-1" />
                                  Activar
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            onClick={() => {
                              setEditingPromii(promii);
                              setEditModalOpen(true);
                            }}
                            size="sm"
                            variant="outline"
                            className="transition-all duration-200"
                            style={{
                              color: COLORS.text.secondary,
                              borderColor: COLORS.border.main,
                            }}
                          >
                            <Pencil className="size-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Edit Modal */}
      {editingPromii && (
        <PromiiEditModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingPromii(null);
          }}
          promiiId={editingPromii.id}
          promiiTitle={editingPromii.title}
          onSaved={loadPromiis}
        />
      )}
    </div>
  );
}
