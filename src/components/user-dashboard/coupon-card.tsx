"use client";

import { useState } from "react";
import { Copy, Check, MessageCircle, ExternalLink, ChevronDown, ChevronUp, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/config/colors";
import type { CouponCard as CouponCardType } from "@/config/types/user-dashboard";
import Link from "next/link";
import Image from "next/image";

interface CouponCardProps {
  coupon: CouponCardType;
}

export function CouponCard({ coupon }: CouponCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Status styling
  // ─────────────────────────────────────────────────────────────
  const statusConfig = {
    active: {
      label: "Activo",
      bgColor: COLORS.success.lighter,
      textColor: COLORS.success.dark,
      borderColor: COLORS.success.light,
    },
    redeemed: {
      label: "Canjeado",
      bgColor: COLORS.neutral[100],
      textColor: COLORS.neutral[600],
      borderColor: COLORS.neutral[300],
    },
    expired: {
      label: "Expirado",
      bgColor: COLORS.error.lighter,
      textColor: COLORS.error.dark,
      borderColor: COLORS.error.light,
    },
    pending: {
      label: "Pendiente",
      bgColor: COLORS.warning.lighter,
      textColor: COLORS.warning.dark,
      borderColor: COLORS.warning.light,
    },
  };

  const status = statusConfig[coupon.couponStatus];
  const isDisabled = coupon.couponStatus === "redeemed" || coupon.couponStatus === "expired";

  // ─────────────────────────────────────────────────────────────
  // Copy to clipboard
  // ─────────────────────────────────────────────────────────────
  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(coupon.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─────────────────────────────────────────────────────────────
  // WhatsApp message
  // ─────────────────────────────────────────────────────────────
  const whatsappMessage = encodeURIComponent(
    `Hola, tengo el cupón *${coupon.couponCode}* para canjear.`
  );
  const whatsappUrl = coupon.merchantWhatsapp
    ? `https://wa.me/${coupon.merchantWhatsapp.replace(/\D/g, "")}?text=${whatsappMessage}`
    : `https://wa.me/${coupon.merchantPhone.replace(/\D/g, "")}?text=${whatsappMessage}`;

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all hover:shadow-md"
      style={{
        backgroundColor: COLORS.background.primary,
        borderColor: COLORS.border.light,
      }}
    >
      {/* Collapsed view - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-4 text-left transition-colors hover:bg-gray-50/50"
      >
        {/* Thumbnail */}
        <div
          className="relative size-20 rounded-lg overflow-hidden shrink-0 border"
          style={{ borderColor: COLORS.border.light }}
        >
          {coupon.promiiPhotoUrl ? (
            <Image
              src={coupon.promiiPhotoUrl}
              alt={coupon.promiiTitle}
              fill
              className="object-cover"
            />
          ) : (
            <div
              className="size-full flex items-center justify-center"
              style={{ backgroundColor: COLORS.background.tertiary }}
            >
              <Ticket className="size-8" style={{ color: COLORS.text.tertiary }} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-bold mb-1 ${expanded ? "" : "line-clamp-2"}`}
            style={{ color: COLORS.text.primary }}
          >
            {coupon.promiiTitle}
          </h3>
          <p className="text-xs mb-2" style={{ color: COLORS.text.tertiary }}>
            📍 {coupon.merchantName}
          </p>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: status.bgColor,
                color: status.textColor,
                borderColor: status.borderColor,
              }}
            >
              {status.label}
            </span>
            {coupon.daysRemaining !== null && coupon.daysRemaining > 0 && (
              <span className="text-xs font-medium" style={{ color: COLORS.text.secondary }}>
                {coupon.daysRemaining} días restantes
              </span>
            )}
          </div>
        </div>

        {/* Expand icon */}
        <div className="shrink-0">
          {expanded ? (
            <ChevronUp className="size-5" style={{ color: COLORS.text.tertiary }} />
          ) : (
            <ChevronDown className="size-5" style={{ color: COLORS.text.tertiary }} />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div
          className="px-4 pb-4 pt-2 border-t"
          style={{ borderColor: COLORS.border.light }}
        >
          {/* Coupon code section */}
          <div
            className="rounded-lg border-2 border-dashed p-4 mb-4"
            style={{
              backgroundColor: COLORS.primary.lighter,
              borderColor: COLORS.primary.light,
            }}
          >
            <p className="text-xs font-semibold mb-2 text-center" style={{ color: COLORS.primary.dark }}>
              CÓDIGO DE CUPÓN
            </p>
            <p
              className="text-2xl font-bold text-center tracking-wider mb-3"
              style={{ color: COLORS.primary.main }}
            >
              {coupon.couponCode}
            </p>
            <Button
              onClick={handleCopyCode}
              disabled={isDisabled}
              className="w-full h-10 font-semibold transition-all hover:scale-105 disabled:hover:scale-100"
              style={{
                background: isDisabled
                  ? COLORS.neutral[200]
                  : `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
                color: isDisabled ? COLORS.neutral[500] : COLORS.text.inverse,
              }}
            >
              {copied ? (
                <>
                  <Check className="size-4 mr-2" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="size-4 mr-2" />
                  Copiar código
                </>
              )}
            </Button>
          </div>

          {/* Expiry info */}
          {coupon.expiresAt && (
            <div
              className="rounded-lg p-3 mb-4"
              style={{
                backgroundColor: COLORS.background.secondary,
                borderLeft: `3px solid ${
                  coupon.daysRemaining && coupon.daysRemaining <= 3
                    ? COLORS.warning.main
                    : COLORS.text.tertiary
                }`,
              }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: COLORS.text.secondary }}>
                ⏰ Válido por {coupon.daysRemaining !== null && coupon.daysRemaining > 0 ? `${coupon.daysRemaining} días más` : "Expirado"}
              </p>
              <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
                Vence: {new Date(coupon.expiresAt).toLocaleDateString("es-VE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          )}

          {/* Instructions */}
          {coupon.promiiTerms && (
            <div
              className="rounded-lg p-3 mb-4"
              style={{
                backgroundColor: COLORS.info.lighter,
                borderLeft: `3px solid ${COLORS.info.main}`,
              }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: COLORS.info.dark }}>
                📋 Instrucciones:
              </p>
              <p className="text-xs whitespace-pre-line" style={{ color: COLORS.info.dark }}>
                {coupon.promiiTerms}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:scale-105"
              }`}
              style={{
                backgroundColor: COLORS.success.main,
                color: COLORS.text.inverse,
              }}
            >
              <MessageCircle className="size-4 mr-2" />
              Contactar
            </a>
            <Link
              href={`/p/${coupon.promiiId}`}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold text-sm transition-all hover:scale-105 border"
              style={{
                backgroundColor: COLORS.background.primary,
                borderColor: COLORS.border.main,
                color: COLORS.text.secondary,
              }}
            >
              <ExternalLink className="size-4 mr-2" />
              Ver Promii
            </Link>
          </div>

          {/* Footer info */}
          <div className="text-xs pt-3 border-t" style={{ borderColor: COLORS.border.light }}>
            <p style={{ color: COLORS.text.tertiary }}>
              Pagaste: <span className="font-semibold" style={{ color: COLORS.text.secondary }}>
                {coupon.currency} {coupon.pricePaid.toFixed(2)}
              </span>
            </p>
            <p style={{ color: COLORS.text.tertiary }}>
              Comprado el: {new Date(coupon.purchasedAt).toLocaleDateString("es-VE")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
