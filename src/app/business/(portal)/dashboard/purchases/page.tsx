"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { COLORS } from "@/config/colors";
import { MyCouponsTab } from "@/components/user-dashboard/my-coupons-tab";
import { PurchaseHistoryTab } from "@/components/user-dashboard/purchase-history-tab";

export default function MerchantPurchasesPage() {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p style={{ color: COLORS.text.secondary }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: COLORS.text.primary }}>
          Mis Compras
        </h1>
        <p className="text-sm mb-6" style={{ color: COLORS.text.secondary }}>
          Tus promiis comprados como consumidor
        </p>
        <MyCouponsTab userId={profile.id} />
      </div>
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ color: COLORS.text.primary }}>
          Historial de Compras
        </h2>
        <p className="text-sm mb-6" style={{ color: COLORS.text.secondary }}>
          Todas tus compras y su estado actual
        </p>
        <PurchaseHistoryTab userId={profile.id} />
      </div>
    </div>
  );
}
