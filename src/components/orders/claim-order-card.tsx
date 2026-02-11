"use client";

import { useState } from "react";
import { COLORS } from "@/config/colors";
import { PurchaseWithDetails } from "@/config/types/orders";
import {
  User,
  Package,
  DollarSign,
  Ticket,
  CheckCircle,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { redeemCoupon } from "@/lib/services/orders/orders.service";
import { useAuth } from "@/lib/context/AuthContext";

type Props = {
  order: PurchaseWithDetails;
  onUpdate: () => void;
};

export function ClaimOrderCard({ order, onUpdate }: Props) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    if (!profile?.id) return;

    const confirmed = confirm(
      `¿Confirmar que el cliente presentó y canjeó el cupón ${order.coupon_code}?`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await redeemCoupon(order.id, profile.id);
      if (response.status === "success") {
        onUpdate();
      } else {
        alert(response.error || "Error al canjear el cupón");
      }
    } catch (error) {
      console.error("Error redeeming coupon:", error);
      alert("Error al canjear el cupón");
    } finally {
      setLoading(false);
    }
  };

  return (
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
          {/* Coupon badge - prominent */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2"
            style={{
              backgroundColor: COLORS.primary.lighter,
              borderColor: COLORS.primary.main,
            }}
          >
            <Ticket className="size-5" style={{ color: COLORS.primary.main }} />
            <div
              className="font-mono font-bold text-base"
              style={{ color: COLORS.primary.main }}
            >
              {order.coupon_code}
            </div>
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
          {new Date(order.validated_at || order.created_at).toLocaleDateString("es-VE", {
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
      </div>

      {/* Action */}
      <div className="flex gap-2 pt-3 border-t" style={{ borderColor: COLORS.border.light }}>
        <Button
          onClick={handleRedeem}
          disabled={loading}
          size="sm"
          className="flex-1 h-9 font-semibold transition-all duration-200 hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${COLORS.success.main} 0%, ${COLORS.success.light} 100%)`,
            color: COLORS.text.inverse,
          }}
        >
          <Gift className="size-4 mr-1.5" />
          Marcar como canjeado
        </Button>
      </div>
    </div>
  );
}
