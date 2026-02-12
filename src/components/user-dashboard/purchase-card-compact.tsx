"use client";

import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Ban,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/config/colors";
import type { PurchaseWithDetails } from "@/config/types/user-dashboard";

interface PurchaseCardCompactProps {
  purchase: PurchaseWithDetails;
}

export function PurchaseCardCompact({ purchase }: PurchaseCardCompactProps) {
  // ─────────────────────────────────────────────────────────────
  // Configuración de estados visuales
  // ─────────────────────────────────────────────────────────────
  const statusConfig: Record<
    string,
    {
      label: string;
      icon: React.ElementType;
      bgColor: string;
      textColor: string;
      borderColor: string;
    }
  > = {
    pending_payment: {
      label: "Pendiente de pago",
      icon: Clock,
      bgColor: COLORS.warning.lighter,
      textColor: COLORS.warning.dark,
      borderColor: COLORS.warning.light,
    },
    pending_validation: {
      label: "Pendiente de validación",
      icon: AlertCircle,
      bgColor: COLORS.info.lighter,
      textColor: COLORS.info.dark,
      borderColor: COLORS.info.light,
    },
    approved: {
      label: "Aprobado",
      icon: CheckCircle2,
      bgColor: COLORS.success.lighter,
      textColor: COLORS.success.dark,
      borderColor: COLORS.success.light,
    },
    redeemed: {
      label: "Canjeado",
      icon: CheckCircle2,
      bgColor: COLORS.neutral[100],
      textColor: COLORS.neutral[600],
      borderColor: COLORS.neutral[300],
    },
    rejected: {
      label: "Rechazado",
      icon: XCircle,
      bgColor: COLORS.error.lighter,
      textColor: COLORS.error.dark,
      borderColor: COLORS.error.light,
    },
    cancelled: {
      label: "Cancelado",
      icon: Ban,
      bgColor: COLORS.neutral[100],
      textColor: COLORS.neutral[500],
      borderColor: COLORS.neutral[300],
    },
  };

  const status = statusConfig[purchase.status] || statusConfig.pending_payment;
  const StatusIcon = status.icon;

  // ─────────────────────────────────────────────────────────────
  // Formatear fecha
  // ─────────────────────────────────────────────────────────────
  const purchaseDate = new Date(purchase.created_at).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // ─────────────────────────────────────────────────────────────
  // Determinar si puede ver cupón (solo si está approved o redeemed)
  // ─────────────────────────────────────────────────────────────
  const canViewCoupon =
    purchase.status === "approved" || purchase.status === "redeemed";

  return (
    <div
      className="rounded-lg border p-4 transition-all hover:shadow-md"
      style={{
        backgroundColor: COLORS.background.primary,
        borderColor: COLORS.border.light,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          {/* Título */}
          <h3
            className="font-semibold truncate mb-1"
            style={{ color: COLORS.text.primary }}
          >
            {purchase.promii_snapshot_title}
          </h3>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mb-3">
            <span style={{ color: COLORS.text.secondary }}>
              {purchaseDate}
            </span>
            <span style={{ color: COLORS.text.secondary }}>•</span>
            <span className="font-semibold" style={{ color: COLORS.text.primary }}>
              {purchase.paid_currency} {Number(purchase.paid_amount).toFixed(2)}
            </span>
          </div>

          {/* Badge de estado */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold"
            style={{
              backgroundColor: status.bgColor,
              color: status.textColor,
              borderColor: status.borderColor,
            }}
          >
            <StatusIcon className="size-3.5" />
            <span>{status.label}</span>
          </div>

          {/* Info adicional según estado */}
          {purchase.status === "approved" && purchase.coupon_code && (
            <div className="mt-2 text-xs" style={{ color: COLORS.text.secondary }}>
              Código: <span className="font-mono font-semibold">{purchase.coupon_code}</span>
            </div>
          )}

          {purchase.status === "rejected" && purchase.rejection_reason && (
            <div
              className="mt-2 text-xs"
              style={{ color: COLORS.error.dark }}
            >
              Motivo: {purchase.rejection_reason}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-2 shrink-0">
          {/* Botón ver cupón (solo si está aprobado/canjeado) */}
          {canViewCoupon && (
            <Button
              asChild
              size="sm"
              className="font-semibold transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
                color: COLORS.text.inverse,
              }}
            >
              <Link href="/profile?tab=coupons">
                Ver Cupón
              </Link>
            </Button>
          )}

          {/* Botón ver promii */}
          <Button
            asChild
            size="sm"
            variant="outline"
            className="font-semibold transition-all hover:scale-105"
            style={{
              borderColor: COLORS.border.main,
              color: COLORS.text.primary,
            }}
          >
            <Link href={`/p/${purchase.promii_id}`}>
              <ExternalLink className="size-3.5 mr-1" />
              Ver Promii
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
