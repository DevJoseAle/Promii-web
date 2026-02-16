"use client";

import { useState, useEffect } from "react";
import { COLORS } from "@/config/colors";
import {
  getMerchants,
  approveMerchant,
  rejectMerchant,
  type MerchantWithApplication,
  type MerchantStatus,
} from "@/lib/services/admin/merchants.admin.service";
import { Button } from "@/components/ui/button";
import {
  Store,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Loader2,
  Filter,
  FileText,
} from "lucide-react";
import { ToastService } from "@/lib/toast/toast.service";
import { DocumentsModal } from "./documents-modal";

const STATUS_CONFIG = {
  pending: { label: "Pendiente", icon: Clock, color: COLORS.warning.main, bg: COLORS.warning.lighter },
  approved: { label: "Aprobado", icon: CheckCircle, color: COLORS.success.main, bg: COLORS.success.lighter },
  rejected: { label: "Rechazado", icon: XCircle, color: COLORS.error.main, bg: COLORS.error.lighter },
  blocked: { label: "Bloqueado", icon: Ban, color: COLORS.text.tertiary, bg: COLORS.neutral[200] },
};

export default function MerchantsAdminPage() {
  const [merchants, setMerchants] = useState<MerchantWithApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<MerchantStatus | "all">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Documents modal
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantWithApplication | null>(null);

  useEffect(() => {
    loadMerchants();
  }, [filterStatus]);

  async function loadMerchants() {
    setLoading(true);
    const status = filterStatus === "all" ? undefined : filterStatus;
    const response = await getMerchants(status);

    if (response.status === "success") {
      setMerchants(response.data);
    } else {
      ToastService.showErrorToast(response.error || "Error al cargar merchants");
    }
    setLoading(false);
  }

  async function handleApprove(merchantId: string) {
    setActionLoading(merchantId);
    const response = await approveMerchant(merchantId);

    if (response.status === "success") {
      ToastService.showSuccessToast("Merchant aprobado exitosamente");
      loadMerchants();
    } else {
      ToastService.showErrorToast(response.error || "Error al aprobar merchant");
    }
    setActionLoading(null);
  }

  async function handleReject(merchantId: string) {
    if (!confirm("¿Estás seguro de rechazar este merchant?")) return;

    setActionLoading(merchantId);
    const response = await rejectMerchant(merchantId);

    if (response.status === "success") {
      ToastService.showSuccessToast("Merchant rechazado");
      loadMerchants();
    } else {
      ToastService.showErrorToast(response.error || "Error al rechazar merchant");
    }
    setActionLoading(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.text.primary }}>
          Gestión de Merchants
        </h1>
        <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
          Aprobar o rechazar solicitudes de comercios
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
        {(["pending", "approved", "rejected", "blocked"] as MerchantStatus[]).map((status) => {
          const config = STATUS_CONFIG[status];
          const Icon = config.icon;
          const count = merchants.filter((m) => m.verification_status === status).length;

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
                    {filterStatus === "all" ? count : merchants.length}
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
        ) : merchants.length === 0 ? (
          <div className="text-center py-12">
            <Store className="size-12 mx-auto mb-3" style={{ color: COLORS.text.tertiary }} />
            <p className="text-sm" style={{ color: COLORS.text.secondary }}>
              No hay merchants {filterStatus !== "all" && `en estado "${STATUS_CONFIG[filterStatus].label}"`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: COLORS.background.secondary }}>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Negocio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Ubicación
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
                {merchants.map((merchant) => {
                  const config = STATUS_CONFIG[merchant.verification_status];
                  const Icon = config.icon;
                  const isActionLoading = actionLoading === merchant.id;

                  return (
                    <tr
                      key={merchant.id}
                      className="border-t transition-colors hover:bg-gray-50"
                      style={{ borderColor: COLORS.border.light }}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm" style={{ color: COLORS.text.primary }}>
                          {merchant.business_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm" style={{ color: COLORS.text.secondary }}>
                          {merchant.contact_name || "-"}
                        </div>
                        <div className="text-xs" style={{ color: COLORS.text.tertiary }}>
                          {merchant.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm" style={{ color: COLORS.text.secondary }}>
                          {merchant.city}, {merchant.state}
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
                          {new Date(merchant.created_at).toLocaleDateString("es-VE")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {merchant.verification_status === "pending" && (
                            <>
                              <Button
                                onClick={() => handleApprove(merchant.id)}
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
                                onClick={() => handleReject(merchant.id)}
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
                              setSelectedMerchant(merchant);
                              setDocumentsModalOpen(true);
                            }}
                            size="sm"
                            variant="outline"
                            className="transition-all duration-200"
                            style={{
                              color: COLORS.primary.main,
                              borderColor: COLORS.border.main,
                            }}
                          >
                            <FileText className="size-4 mr-1" />
                            Documentos
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

      {/* Documents Modal */}
      {selectedMerchant && (
        <DocumentsModal
          isOpen={documentsModalOpen}
          onClose={() => {
            setDocumentsModalOpen(false);
            setSelectedMerchant(null);
          }}
          merchantId={selectedMerchant.id}
          merchantName={selectedMerchant.business_name}
        />
      )}
    </div>
  );
}
