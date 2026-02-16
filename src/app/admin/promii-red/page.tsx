"use client";

import { useState, useEffect } from "react";
import { COLORS } from "@/config/colors";
import {
  getReferrals,
  markBasePaid,
  markBonusPaid,
  uploadPaymentReceipt,
  type ReferralAdmin,
  type ReferralStatus,
  type PaymentFilter,
} from "@/lib/services/admin/promii-red.admin.service";
import { Button } from "@/components/ui/button";
import {
  Gift,
  DollarSign,
  CheckCircle,
  Clock,
  Loader2,
  Filter,
  Users,
  TrendingUp,
  FileText,
  ExternalLink,
} from "lucide-react";
import { ToastService } from "@/lib/toast/toast.service";
import { PaymentModal } from "./payment-modal";

const STATUS_CONFIG = {
  registered: { label: "Registrado", icon: Users, color: COLORS.text.secondary, bg: COLORS.neutral[200] },
  approved: { label: "Aprobado", icon: CheckCircle, color: COLORS.primary.main, bg: COLORS.primary.lighter },
  activated: { label: "Activado (30d)", icon: TrendingUp, color: COLORS.success.main, bg: COLORS.success.lighter },
  bonus_eligible: { label: "Elegible Bonus (90d)", icon: Gift, color: COLORS.warning.main, bg: COLORS.warning.lighter },
  paid: { label: "Pagado", icon: DollarSign, color: COLORS.success.dark, bg: COLORS.success.lighter },
};

const PAYMENT_FILTERS = [
  { value: "all" as const, label: "Todos" },
  { value: "base_pending" as const, label: "Pago Base Pendiente" },
  { value: "base_paid" as const, label: "Pago Base Completado" },
  { value: "bonus_pending" as const, label: "Bonus Pendiente" },
  { value: "bonus_paid" as const, label: "Bonus Completado" },
  { value: "all_paid" as const, label: "Todos Pagados" },
];

export default function PromiiRedAdminPage() {
  const [referrals, setReferrals] = useState<ReferralAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPayment, setFilterPayment] = useState<PaymentFilter>("all");
  const [filterStatus, setFilterStatus] = useState<ReferralStatus | "all">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPaymentType, setModalPaymentType] = useState<"base" | "bonus">("base");
  const [modalReferral, setModalReferral] = useState<ReferralAdmin | null>(null);

  useEffect(() => {
    loadReferrals();
  }, [filterPayment, filterStatus]);

  async function loadReferrals() {
    setLoading(true);
    const paymentFilter = filterPayment === "all" ? undefined : filterPayment;
    const statusFilter = filterStatus === "all" ? undefined : filterStatus;
    const response = await getReferrals(paymentFilter, statusFilter);

    if (response.status === "success") {
      setReferrals(response.data);
    } else {
      ToastService.showErrorToast(response.error || "Error al cargar referrals");
    }
    setLoading(false);
  }

  function openPaymentModal(referral: ReferralAdmin, paymentType: "base" | "bonus") {
    setModalReferral(referral);
    setModalPaymentType(paymentType);
    setModalOpen(true);
  }

  async function handlePaymentConfirm(file: File | null, notes: string) {
    if (!modalReferral) return;

    setActionLoading(modalReferral.id);

    try {
      let receiptUrl: string | undefined;

      // Subir archivo si existe
      if (file) {
        const uploadResponse = await uploadPaymentReceipt(
          modalReferral.id,
          file,
          modalPaymentType
        );

        if (uploadResponse.status === "error") {
          ToastService.showErrorToast(uploadResponse.error || "Error al subir comprobante");
          return;
        }

        receiptUrl = uploadResponse.data;
      }

      // Marcar como pagado
      const response = modalPaymentType === "base"
        ? await markBasePaid(modalReferral.id, receiptUrl, notes)
        : await markBonusPaid(modalReferral.id, receiptUrl, notes);

      if (response.status === "success") {
        ToastService.showSuccessToast(
          `Pago ${modalPaymentType === "base" ? "base" : "bonus"} marcado como completado`
        );
        loadReferrals();
      } else {
        ToastService.showErrorToast(response.error || "Error al marcar pago");
      }
    } finally {
      setActionLoading(null);
    }
  }

  // Calcular estadísticas
  const stats = {
    total: referrals.length,
    base_pending: referrals.filter(r => !r.base_paid_at && ['activated', 'bonus_eligible'].includes(r.status)).length,
    bonus_pending: referrals.filter(r => !r.bonus_paid_at && r.status === 'bonus_eligible').length,
    paid: referrals.filter(r => r.status === 'paid').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.text.primary }}>
          Promii Red - Referidos
        </h1>
        <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
          Gestionar pagos de comisiones por referidos
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="size-4" style={{ color: COLORS.text.secondary }} />
            <span className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
              Estado de pago:
            </span>
          </div>
          {PAYMENT_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              onClick={() => setFilterPayment(filter.value)}
              variant={filterPayment === filter.value ? "default" : "outline"}
              size="sm"
              className="transition-all duration-200"
              style={
                filterPayment === filter.value
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
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="size-4" style={{ color: COLORS.text.secondary }} />
            <span className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
              Estado del referido:
            </span>
          </div>
          {(["all", "registered", "approved", "activated", "bonus_eligible", "paid"] as const).map((status) => (
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
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div
          className="rounded-xl border p-5"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: COLORS.primary.lighter }}>
              <Users className="size-5" style={{ color: COLORS.primary.main }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
                {stats.total}
              </div>
              <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                Total Referidos
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl border p-5"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: COLORS.warning.lighter }}>
              <Clock className="size-5" style={{ color: COLORS.warning.main }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
                {stats.base_pending}
              </div>
              <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                Pago Base Pendiente
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl border p-5"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: COLORS.warning.lighter }}>
              <Gift className="size-5" style={{ color: COLORS.warning.main }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
                {stats.bonus_pending}
              </div>
              <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                Bonus Pendiente
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl border p-5"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: COLORS.success.lighter }}>
              <DollarSign className="size-5" style={{ color: COLORS.success.main }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
                {stats.paid}
              </div>
              <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                Completamente Pagados
              </div>
            </div>
          </div>
        </div>
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
        ) : referrals.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="size-12 mx-auto mb-3" style={{ color: COLORS.text.tertiary }} />
            <p className="text-sm" style={{ color: COLORS.text.secondary }}>
              No hay referidos con los filtros seleccionados
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: COLORS.background.secondary }}>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Referidor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Merchant Referido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Pago Base
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: COLORS.text.secondary }}>
                    Pago Bonus
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
                {referrals.map((referral) => {
                  const config = STATUS_CONFIG[referral.status];
                  const Icon = config.icon;
                  const isActionLoading = actionLoading === referral.id;
                  const canPayBase = !referral.base_paid_at && ['activated', 'bonus_eligible'].includes(referral.status);
                  const canPayBonus = !referral.bonus_paid_at && referral.status === 'bonus_eligible';

                  return (
                    <tr
                      key={referral.id}
                      className="border-t transition-colors hover:bg-gray-50"
                      style={{ borderColor: COLORS.border.light }}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm" style={{ color: COLORS.text.primary }}>
                          {referral.referrer_name}
                        </div>
                        <div className="text-xs" style={{ color: COLORS.text.tertiary }}>
                          {referral.referrer_email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm" style={{ color: COLORS.text.secondary }}>
                          {referral.referred_merchant_name || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono" style={{ color: COLORS.text.secondary }}>
                          {referral.referral_code}
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
                        {referral.base_paid_at ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="size-4" style={{ color: COLORS.success.main }} />
                              <span style={{ color: COLORS.success.main }}>Pagado</span>
                              {referral.base_receipt_url && (
                                <a
                                  href={referral.base_receipt_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:opacity-70"
                                >
                                  <FileText className="size-4" style={{ color: COLORS.primary.main }} />
                                </a>
                              )}
                            </div>
                            <div className="text-xs" style={{ color: COLORS.text.tertiary }}>
                              {new Date(referral.base_paid_at).toLocaleDateString("es-VE")}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm" style={{ color: COLORS.text.tertiary }}>
                            ${referral.base_reward.toFixed(2)} pendiente
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {referral.bonus_paid_at ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="size-4" style={{ color: COLORS.success.main }} />
                              <span style={{ color: COLORS.success.main }}>Pagado</span>
                              {referral.bonus_receipt_url && (
                                <a
                                  href={referral.bonus_receipt_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:opacity-70"
                                >
                                  <FileText className="size-4" style={{ color: COLORS.primary.main }} />
                                </a>
                              )}
                            </div>
                            <div className="text-xs" style={{ color: COLORS.text.tertiary }}>
                              {new Date(referral.bonus_paid_at).toLocaleDateString("es-VE")}
                            </div>
                          </div>
                        ) : referral.status === 'bonus_eligible' ? (
                          <div className="text-sm" style={{ color: COLORS.text.tertiary }}>
                            ${referral.bonus_reward.toFixed(2)} pendiente
                          </div>
                        ) : (
                          <div className="text-sm" style={{ color: COLORS.text.tertiary }}>
                            -
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm" style={{ color: COLORS.text.secondary }}>
                          {new Date(referral.created_at).toLocaleDateString("es-VE")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {canPayBase && (
                            <Button
                              onClick={() => openPaymentModal(referral, "base")}
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
                                  <DollarSign className="size-4 mr-1" />
                                  Pagar Base
                                </>
                              )}
                            </Button>
                          )}
                          {canPayBonus && (
                            <Button
                              onClick={() => openPaymentModal(referral, "bonus")}
                              disabled={isActionLoading}
                              size="sm"
                              className="transition-all duration-200 hover:scale-105"
                              style={{
                                backgroundColor: COLORS.warning.main,
                                color: "white",
                              }}
                            >
                              {isActionLoading ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <>
                                  <Gift className="size-4 mr-1" />
                                  Pagar Bonus
                                </>
                              )}
                            </Button>
                          )}
                          {!canPayBase && !canPayBonus && (
                            <span className="text-xs" style={{ color: COLORS.text.tertiary }}>
                              -
                            </span>
                          )}
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

      {/* Payment Modal */}
      {modalReferral && (
        <PaymentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handlePaymentConfirm}
          paymentType={modalPaymentType}
          amount={modalPaymentType === "base" ? modalReferral.base_reward : modalReferral.bonus_reward}
          referrerName={modalReferral.referrer_name}
        />
      )}
    </div>
  );
}
