"use client";

import { useCallback, useEffect, useState } from "react";
import { COLORS } from "@/config/colors";
import {
  getInfluencers,
  approveInfluencer,
  rejectInfluencer,
  type InfluencerProfile,
  type InfluencerStatus,
} from "@/lib/services/admin/influencers.admin.service";
import { Button } from "@/components/ui/button";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Loader2,
  Filter,
  Pencil,
} from "lucide-react";
import { ToastService } from "@/lib/toast/toast.service";
import { InfluencerEditModal } from "./influencer-edit-modal";

const STATUS_CONFIG = {
  pending: { label: "Pendiente", icon: Clock, color: COLORS.warning.main, bg: COLORS.warning.lighter },
  approved: { label: "Aprobado", icon: CheckCircle, color: COLORS.success.main, bg: COLORS.success.lighter },
  rejected: { label: "Rechazado", icon: XCircle, color: COLORS.error.main, bg: COLORS.error.lighter },
  blocked: { label: "Bloqueado", icon: Ban, color: COLORS.text.tertiary, bg: COLORS.neutral[200] },
};

export default function InfluencersAdminPage() {
  const [influencers, setInfluencers] = useState<InfluencerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<InfluencerStatus | "all">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState<InfluencerProfile | null>(null);

  const loadInfluencers = useCallback(async () => {
    setLoading(true);
    const status = filterStatus === "all" ? undefined : filterStatus;
    const response = await getInfluencers(status);

    if (response.status === "success") {
      setInfluencers(response.data);
    } else {
      ToastService.showErrorToast(response.error || "Error al cargar influencers");
    }
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadInfluencers();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [loadInfluencers]);

  async function handleApprove(influencerId: string) {
    setActionLoading(influencerId);
    const response = await approveInfluencer(influencerId);

    if (response.status === "success") {
      ToastService.showSuccessToast("Influencer aprobado exitosamente");
      loadInfluencers();
    } else {
      ToastService.showErrorToast(response.error || "Error al aprobar influencer");
    }
    setActionLoading(null);
  }

  async function handleReject(influencerId: string) {
    if (!confirm("¿Estás seguro de rechazar este influencer?")) return;

    setActionLoading(influencerId);
    const response = await rejectInfluencer(influencerId);

    if (response.status === "success") {
      ToastService.showSuccessToast("Influencer rechazado");
      loadInfluencers();
    } else {
      ToastService.showErrorToast(response.error || "Error al rechazar influencer");
    }
    setActionLoading(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.text.primary }}>
          Gestión de Influencers
        </h1>
        <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
          Aprobar o rechazar solicitudes de influencers
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
        {(["all", "pending", "approved", "rejected", "blocked"] as const).map((status) => (
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
      <div className="grid gap-4 sm:grid-cols-4">
        {(["pending", "approved", "rejected", "blocked"] as InfluencerStatus[]).map((status) => {
          const config = STATUS_CONFIG[status];
          const Icon = config.icon;
          const count = influencers.filter((inf) => inf.state === status).length;

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
                    {filterStatus === "all" ? count : influencers.length}
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
        ) : influencers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="size-12 mx-auto mb-3" style={{ color: COLORS.text.tertiary }} />
            <p className="text-sm" style={{ color: COLORS.text.secondary }}>
              No hay influencers {filterStatus !== "all" && `en estado "${STATUS_CONFIG[filterStatus].label}"`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: COLORS.background.secondary }}>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {influencers.map((influencer) => {
                  const config = STATUS_CONFIG[influencer.state] ?? {
                    label: influencer.state ?? "Sin estado",
                    icon: Clock,
                    color: COLORS.text.tertiary,
                    bg: COLORS.neutral[200],
                  };
                  const Icon = config.icon;
                  const isActionLoading = actionLoading === influencer.id;

                  return (
                    <tr
                      key={influencer.id}
                      className="border-t transition-colors hover:bg-gray-50"
                      style={{ borderColor: COLORS.border.light }}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm" style={{ color: COLORS.text.primary }}>
                          {influencer.first_name || influencer.last_name
                            ? `${influencer.first_name || ""} ${influencer.last_name || ""}`.trim()
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm" style={{ color: COLORS.text.secondary }}>
                          {influencer.email}
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
                          {new Date(influencer.created_at).toLocaleDateString("es-VE")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {influencer.state === "pending" && (
                            <>
                              <Button
                                onClick={() => handleApprove(influencer.id)}
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
                                    <CheckCircle className="size-4 mr-1" />
                                    Aprobar
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() => handleReject(influencer.id)}
                                disabled={isActionLoading}
                                size="sm"
                                variant="outline"
                                className="transition-all duration-200 hover:scale-105"
                                style={{
                                  color: COLORS.error.main,
                                  borderColor: COLORS.error.main,
                                }}
                              >
                                <XCircle className="size-4 mr-1" />
                                Rechazar
                              </Button>
                            </>
                          )}
                          <Button
                            onClick={() => {
                              setEditingInfluencer(influencer);
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
      {editingInfluencer && (
        <InfluencerEditModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingInfluencer(null);
          }}
          influencerId={editingInfluencer.id}
          influencerName={
            editingInfluencer.first_name || editingInfluencer.last_name
              ? `${editingInfluencer.first_name || ""} ${editingInfluencer.last_name || ""}`.trim()
              : editingInfluencer.email
          }
          onSaved={loadInfluencers}
        />
      )}
    </div>
  );
}
