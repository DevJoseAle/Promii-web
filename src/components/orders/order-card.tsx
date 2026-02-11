"use client";

import { useState } from "react";
import { COLORS } from "@/config/colors";
import { PurchaseWithDetails } from "@/config/types/orders";
import {
  User,
  Package,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Ticket,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { approvePurchase, rejectPurchase, markPaymentReceived } from "@/lib/services/orders/orders.service";
import { useAuth } from "@/lib/context/AuthContext";

type Props = {
  order: PurchaseWithDetails;
  onUpdate: () => void;
};

const STATUS_CONFIG = {
  pending_payment: {
    label: "Pago pendiente",
    color: COLORS.warning.main,
    bg: COLORS.warning.lighter,
    icon: Clock,
  },
  pending_validation: {
    label: "Por validar",
    color: COLORS.info.main,
    bg: COLORS.info.lighter,
    icon: AlertCircle,
  },
  approved: {
    label: "Aprobada",
    color: COLORS.success.main,
    bg: COLORS.success.lighter,
    icon: CheckCircle,
  },
  rejected: {
    label: "Rechazada",
    color: COLORS.error.main,
    bg: COLORS.error.lighter,
    icon: XCircle,
  },
  cancelled: {
    label: "Cancelada",
    color: COLORS.text.tertiary,
    bg: COLORS.background.tertiary,
    icon: XCircle,
  },
  redeemed: {
    label: "Canjeada",
    color: COLORS.primary.main,
    bg: COLORS.primary.lighter,
    icon: Ticket,
  },
};

export function OrderCard({ order, onUpdate }: Props) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig.icon;

  const handleMarkPaymentReceived = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const response = await markPaymentReceived(order.id, profile.id);
      if (response.status === "success") {
        onUpdate();
      } else {
        alert(response.error || "Error al marcar comprobante como recibido");
      }
    } catch (error) {
      console.error("Error marking payment as received:", error);
      alert("Error al marcar comprobante como recibido");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const response = await approvePurchase(order.id, profile.id);
      if (response.status === "success") {
        onUpdate();
      } else {
        alert(response.error || "Error al aprobar la orden");
      }
    } catch (error) {
      console.error("Error approving order:", error);
      alert("Error al aprobar la orden");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!profile?.id || !rejectReason.trim()) {
      alert("Debes proporcionar una razón para rechazar");
      return;
    }

    setLoading(true);
    try {
      const response = await rejectPurchase(order.id, profile.id, rejectReason);
      if (response.status === "success") {
        setShowRejectModal(false);
        setRejectReason("");
        onUpdate();
      } else {
        alert(response.error || "Error al rechazar la orden");
      }
    } catch (error) {
      console.error("Error rejecting order:", error);
      alert("Error al rechazar la orden");
    } finally {
      setLoading(false);
    }
  };

  const canModify = order.status === "pending_validation" || order.status === "pending_payment";

  return (
    <>
      <div
        className="rounded-lg border p-4"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status badge */}
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: statusConfig.bg,
                color: statusConfig.color,
              }}
            >
              <StatusIcon className="size-3.5" />
              {statusConfig.label}
            </div>

            {/* User name */}
            <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: COLORS.text.primary }}>
              <User className="size-3.5" />
              {order.user_name || order.user_email}
            </div>

            {/* Order reference */}
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold" style={{ color: COLORS.text.tertiary }}>
              #<span>{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>

          {/* Order date */}
          <div className="text-xs shrink-0" style={{ color: COLORS.text.tertiary }}>
            {new Date(order.created_at).toLocaleDateString("es-VE", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {/* Content row - horizontal layout */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-3">
          {/* Promii */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Package className="size-4 shrink-0" style={{ color: COLORS.primary.main }} />
            <div className="font-semibold text-sm truncate" style={{ color: COLORS.text.primary }}>
              {order.promii_snapshot_title}
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-center gap-2">
            <DollarSign className="size-4 shrink-0" style={{ color: COLORS.success.main }} />
            <div className="font-bold text-sm" style={{ color: COLORS.text.primary }}>
              {order.paid_currency} {order.paid_amount.toFixed(2)}
            </div>
          </div>

          {/* Payment method */}
          <div className="text-xs px-2 py-1 rounded" style={{
            backgroundColor: COLORS.background.tertiary,
            color: COLORS.text.secondary
          }}>
            {order.payment_method === "transfer" ? "Transferencia" : order.payment_method}
          </div>

          {/* Coupon (if approved) */}
          {order.coupon_code && (
            <div className="flex items-center gap-2">
              <Ticket className="size-4 shrink-0" style={{ color: COLORS.warning.main }} />
              <div
                className="font-mono font-bold text-sm"
                style={{ color: COLORS.primary.main }}
              >
                {order.coupon_code}
              </div>
            </div>
          )}
        </div>

        {/* Rejection reason (if rejected) */}
        {order.rejection_reason && (
          <div
            className="mb-3 px-3 py-2 rounded-lg border text-xs"
            style={{
              backgroundColor: COLORS.error.lighter,
              borderColor: COLORS.error.light,
              color: COLORS.error.dark,
            }}
          >
            <span className="font-semibold">Rechazado:</span> {order.rejection_reason}
          </div>
        )}

        {/* Actions */}
        {canModify && (
          <div className="flex gap-2 pt-3 border-t" style={{ borderColor: COLORS.border.light }}>
            {order.status === "pending_payment" ? (
              <Button
                onClick={handleMarkPaymentReceived}
                disabled={loading}
                size="sm"
                className="flex-1 h-9 font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.info.main} 0%, ${COLORS.info.light} 100%)`,
                  color: COLORS.text.inverse,
                }}
              >
                <CheckCircle className="size-4 mr-1.5" />
                Comprobante recibido
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={loading}
                  size="sm"
                  className="flex-1 h-9 font-semibold transition-all duration-200 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.success.main} 0%, ${COLORS.success.light} 100%)`,
                    color: COLORS.text.inverse,
                  }}
                >
                  <CheckCircle className="size-4 mr-1.5" />
                  Aprobar
                </Button>

                <Button
                  onClick={() => setShowRejectModal(true)}
                  disabled={loading}
                  size="sm"
                  variant="outline"
                  className="flex-1 h-9 font-semibold transition-all duration-200 hover:scale-105"
                  style={{
                    borderColor: COLORS.error.main,
                    color: COLORS.error.main,
                  }}
                >
                  <XCircle className="size-4 mr-1.5" />
                  Rechazar
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border shadow-2xl p-6"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.text.primary }}>
              Rechazar orden
            </h3>

            <div className="mb-4">
              <label className="text-sm font-semibold mb-2 block" style={{ color: COLORS.text.primary }}>
                Razón del rechazo
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explica por qué rechazas esta orden..."
                className="w-full min-h-[100px] rounded-lg border p-3 text-sm"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: COLORS.border.main,
                  color: COLORS.text.primary,
                }}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowRejectModal(false)}
                variant="outline"
                className="flex-1"
                style={{
                  borderColor: COLORS.border.main,
                  color: COLORS.text.secondary,
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleReject}
                disabled={loading || !rejectReason.trim()}
                className="flex-1"
                style={{
                  backgroundColor: COLORS.error.main,
                  color: COLORS.text.inverse,
                }}
              >
                Rechazar orden
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
