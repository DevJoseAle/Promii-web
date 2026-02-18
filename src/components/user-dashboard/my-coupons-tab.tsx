"use client";

import { useCallback, useEffect, useState } from "react";
import { Ticket, AlertCircle } from "lucide-react";
import { getUserCoupons } from "@/lib/services/user-purchases.service";
import { CouponCard } from "./coupon-card";
import { COLORS } from "@/config/colors";
import type { CouponCard as CouponCardType } from "@/config/types/user-dashboard";
import Link from "next/link";

interface MyCouponsTabProps {
  userId: string;
}

export function MyCouponsTab({ userId }: MyCouponsTabProps) {
  const [coupons, setCoupons] = useState<CouponCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // Fetch cupones al montar
  // ─────────────────────────────────────────────────────────────
  const loadCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await getUserCoupons(userId);

    if (response.status === "success") {
      setCoupons(response.data || []);
    } else {
      setError(response.error || "Error cargando cupones");
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadCoupons();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [loadCoupons]);

  // ─────────────────────────────────────────────────────────────
  // Loading state
  // ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border p-6 animate-pulse"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <div className="space-y-3">
              <div
                className="h-6 w-3/4 rounded"
                style={{ backgroundColor: COLORS.neutral[200] }}
              />
              <div
                className="h-24 rounded"
                style={{ backgroundColor: COLORS.neutral[200] }}
              />
              <div
                className="h-10 rounded"
                style={{ backgroundColor: COLORS.neutral[200] }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Error state
  // ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        className="rounded-xl border p-8 text-center"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.error.light,
        }}
      >
        <AlertCircle
          className="size-12 mx-auto mb-4"
          style={{ color: COLORS.error.main }}
        />
        <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
          Error cargando cupones
        </h3>
        <p className="text-sm mb-4" style={{ color: COLORS.text.secondary }}>
          {error}
        </p>
        <button
          onClick={loadCoupons}
          className="px-4 py-2 rounded-lg font-semibold transition-colors"
          style={{
            backgroundColor: COLORS.primary.main,
            color: COLORS.text.inverse,
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Empty state
  // ─────────────────────────────────────────────────────────────
  if (coupons.length === 0) {
    return (
      <div
        className="rounded-xl border p-12 text-center"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        <div
          className="mx-auto flex size-16 items-center justify-center rounded-full mb-4"
          style={{
            backgroundColor: COLORS.neutral[100],
            color: COLORS.text.tertiary,
          }}
        >
          <Ticket className="size-8" />
        </div>
        <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
          No tienes cupones aún
        </h3>
        <p className="text-sm mb-6" style={{ color: COLORS.text.secondary }}>
          Cuando compres un promii y sea aprobado, tu cupón aparecerá aquí.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
            color: COLORS.text.inverse,
          }}
        >
          Explorar Promiis
        </Link>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Separar cupones por estado
  // ─────────────────────────────────────────────────────────────
  const activeCoupons = coupons.filter((c) => c.couponStatus === "active");
  const redeemedCoupons = coupons.filter((c) => c.couponStatus === "redeemed");
  const expiredCoupons = coupons.filter((c) => c.couponStatus === "expired");

  return (
    <div className="space-y-8">
      {/* Stats rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="rounded-lg p-4 text-center"
          style={{
            backgroundColor: COLORS.success.lighter,
            borderLeft: `4px solid ${COLORS.success.main}`,
          }}
        >
          <div className="text-2xl font-bold" style={{ color: COLORS.success.dark }}>
            {activeCoupons.length}
          </div>
          <div className="text-sm" style={{ color: COLORS.success.dark }}>
            Activos
          </div>
        </div>

        <div
          className="rounded-lg p-4 text-center"
          style={{
            backgroundColor: COLORS.neutral[100],
            borderLeft: `4px solid ${COLORS.neutral[400]}`,
          }}
        >
          <div className="text-2xl font-bold" style={{ color: COLORS.neutral[600] }}>
            {redeemedCoupons.length}
          </div>
          <div className="text-sm" style={{ color: COLORS.neutral[600] }}>
            Canjeados
          </div>
        </div>

        <div
          className="rounded-lg p-4 text-center"
          style={{
            backgroundColor: COLORS.error.lighter,
            borderLeft: `4px solid ${COLORS.error.main}`,
          }}
        >
          <div className="text-2xl font-bold" style={{ color: COLORS.error.dark }}>
            {expiredCoupons.length}
          </div>
          <div className="text-sm" style={{ color: COLORS.error.dark }}>
            Expirados
          </div>
        </div>
      </div>

      {/* Cupones activos primero */}
      {activeCoupons.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4" style={{ color: COLORS.text.primary }}>
            💚 Cupones Activos
          </h2>
          <div className="grid gap-6">
            {activeCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        </div>
      )}

      {/* Cupones canjeados */}
      {redeemedCoupons.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4" style={{ color: COLORS.text.primary }}>
            ✅ Cupones Canjeados
          </h2>
          <div className="grid gap-6">
            {redeemedCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        </div>
      )}

      {/* Cupones expirados */}
      {expiredCoupons.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4" style={{ color: COLORS.text.primary }}>
            ⏰ Cupones Expirados
          </h2>
          <div className="grid gap-6">
            {expiredCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
