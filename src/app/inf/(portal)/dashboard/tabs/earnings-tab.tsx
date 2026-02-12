"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Clock, CheckCircle, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/config/colors";
import { supabase } from "@/lib/supabase/supabase.client";
import { ToastService } from "@/lib/toast/toast.service";

interface EarningsTabProps {
  influencerId: string;
}

type EarningRecord = {
  id: string;
  created_at: string;
  merchant_name: string;
  promii_title: string;
  sale_amount: number;
  commission_earned: number;
  commission_type: "percentage" | "fixed";
  status: "pending" | "paid";
};

type EarningsStats = {
  total_earned: number;
  pending: number;
  paid: number;
  this_month: number;
};

export function EarningsTab({ influencerId }: EarningsTabProps) {
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [stats, setStats] = useState<EarningsStats>({
    total_earned: 0,
    pending: 0,
    paid: 0,
    this_month: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "paid">("all");

  useEffect(() => {
    loadEarnings();
  }, [influencerId]);

  async function loadEarnings() {
    setLoading(true);

    try {
      // Obtener todas las compras del influencer con detalles
      const { data: purchases, error: purchasesError } = await supabase
        .from("promii_purchases")
        .select(
          `
          id,
          created_at,
          paid_amount,
          referral_code,
          status,
          promii:promii_id (
            title,
            merchant_id
          )
        `
        )
        .eq("influencer_id", influencerId)
        .in("status", ["approved", "redeemed"])
        .order("created_at", { ascending: false });

      if (purchasesError) {
        console.error("[loadEarnings] Error:", purchasesError);
        ToastService.showErrorToast("Error al cargar ganancias");
        setLoading(false);
        return;
      }

      if (!purchases || purchases.length === 0) {
        setLoading(false);
        return;
      }

      // Para cada compra, obtener el assignment y merchant info
      const earningsPromises = purchases.map(async (purchase: any) => {
        // Obtener assignment para saber la comisión
        const { data: assignment } = await supabase
          .from("promii_influencer_assignments")
          .select("commission_type, commission_value")
          .eq("referral_code", purchase.referral_code)
          .maybeSingle();

        // Obtener merchant name
        const { data: merchant } = await supabase
          .from("merchants")
          .select("business_name")
          .eq("id", purchase.promii?.merchant_id)
          .single();

        // Calcular comisión
        let commissionEarned = 0;
        if (assignment) {
          if (assignment.commission_type === "percentage") {
            commissionEarned = (Number(purchase.paid_amount) * Number(assignment.commission_value)) / 100;
          } else if (assignment.commission_type === "fixed") {
            commissionEarned = Number(assignment.commission_value);
          }
        }

        return {
          id: purchase.id,
          created_at: purchase.created_at,
          merchant_name: merchant?.business_name || "Desconocido",
          promii_title: purchase.promii?.title || "Sin título",
          sale_amount: Number(purchase.paid_amount),
          commission_earned: commissionEarned,
          commission_type: assignment?.commission_type || "percentage",
          status: "pending" as const, // Por ahora todas pending, luego se puede agregar sistema de payouts
        };
      });

      const earningsData = await Promise.all(earningsPromises);
      setEarnings(earningsData);

      // Calcular stats
      const totalEarned = earningsData.reduce((sum, e) => sum + e.commission_earned, 0);
      const pending = earningsData.filter((e) => e.status === "pending").reduce((sum, e) => sum + e.commission_earned, 0);
      const paid = earningsData.filter((e) => e.status === "paid").reduce((sum, e) => sum + e.commission_earned, 0);

      // Este mes
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const thisMonth = earningsData
        .filter((e) => new Date(e.created_at) >= startOfMonth)
        .reduce((sum, e) => sum + e.commission_earned, 0);

      setStats({
        total_earned: totalEarned,
        pending,
        paid,
        this_month: thisMonth,
      });
    } catch (error) {
      console.error("[loadEarnings] Error:", error);
      ToastService.showErrorToast("Error al cargar ganancias");
    }

    setLoading(false);
  }

  const filteredEarnings = filter === "all" ? earnings : earnings.filter((e) => e.status === filter);

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
            Mis Ganancias
          </h1>
          <p className="text-base" style={{ color: COLORS.text.secondary }}>
            Historial de comisiones ganadas
          </p>
        </div>
        <div className="text-center py-8" style={{ color: COLORS.text.secondary }}>
          Cargando...
        </div>
      </div>
    );
  }

  if (earnings.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
            Mis Ganancias
          </h1>
          <p className="text-base" style={{ color: COLORS.text.secondary }}>
            Historial de comisiones ganadas
          </p>
        </div>
        <div
          className="rounded-xl border p-12 text-center"
          style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
        >
          <DollarSign className="size-16 mx-auto mb-4" style={{ color: COLORS.text.tertiary }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
            Aún no tienes ganancias
          </h3>
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            Cuando generes ventas con tus códigos de referido, aparecerán aquí
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
          Mis Ganancias
        </h1>
        <p className="text-base" style={{ color: COLORS.text.secondary }}>
          Historial de comisiones ganadas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Earned */}
        <div
          className="rounded-xl border p-5"
          style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="size-5" style={{ color: COLORS.success.main }} />
            <span className="text-sm font-medium" style={{ color: COLORS.text.secondary }}>
              Total Ganado
            </span>
          </div>
          <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
            ${stats.total_earned.toFixed(2)}
          </div>
        </div>

        {/* Pending */}
        <div
          className="rounded-xl border p-5"
          style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="size-5" style={{ color: COLORS.warning.main }} />
            <span className="text-sm font-medium" style={{ color: COLORS.text.secondary }}>
              Pendiente
            </span>
          </div>
          <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
            ${stats.pending.toFixed(2)}
          </div>
        </div>

        {/* Paid */}
        <div
          className="rounded-xl border p-5"
          style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="size-5" style={{ color: COLORS.success.main }} />
            <span className="text-sm font-medium" style={{ color: COLORS.text.secondary }}>
              Pagado
            </span>
          </div>
          <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
            ${stats.paid.toFixed(2)}
          </div>
        </div>

        {/* This Month */}
        <div
          className="rounded-xl border p-5"
          style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="size-5" style={{ color: COLORS.primary.main }} />
            <span className="text-sm font-medium" style={{ color: COLORS.text.secondary }}>
              Este Mes
            </span>
          </div>
          <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
            ${stats.this_month.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Filter className="size-4" style={{ color: COLORS.text.tertiary }} />
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "all" ? "shadow-sm" : ""
            }`}
            style={{
              backgroundColor: filter === "all" ? COLORS.primary.main : COLORS.background.secondary,
              color: filter === "all" ? COLORS.text.inverse : COLORS.text.secondary,
            }}
          >
            Todas ({earnings.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "pending" ? "shadow-sm" : ""
            }`}
            style={{
              backgroundColor: filter === "pending" ? COLORS.warning.main : COLORS.background.secondary,
              color: filter === "pending" ? COLORS.text.inverse : COLORS.text.secondary,
            }}
          >
            Pendientes ({earnings.filter((e) => e.status === "pending").length})
          </button>
          <button
            onClick={() => setFilter("paid")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "paid" ? "shadow-sm" : ""
            }`}
            style={{
              backgroundColor: filter === "paid" ? COLORS.success.main : COLORS.background.secondary,
              color: filter === "paid" ? COLORS.text.inverse : COLORS.text.secondary,
            }}
          >
            Pagadas ({earnings.filter((e) => e.status === "paid").length})
          </button>
        </div>
      </div>

      {/* Earnings Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: COLORS.background.secondary }}>
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  Fecha
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  Merchant
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  Promii
                </th>
                <th className="text-right px-6 py-3 text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  Venta
                </th>
                <th className="text-right px-6 py-3 text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  Comisión
                </th>
                <th className="text-center px-6 py-3 text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEarnings.map((earning) => (
                <tr
                  key={earning.id}
                  className="border-t"
                  style={{ borderColor: COLORS.border.light }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4" style={{ color: COLORS.text.tertiary }} />
                      <span className="text-sm" style={{ color: COLORS.text.primary }}>
                        {new Date(earning.created_at).toLocaleDateString("es-VE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium" style={{ color: COLORS.text.primary }}>
                      {earning.merchant_name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: COLORS.text.secondary }}>
                      {earning.promii_title}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-medium" style={{ color: COLORS.text.primary }}>
                      ${earning.sale_amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex flex-col items-end">
                      <span className="text-sm font-bold" style={{ color: COLORS.success.main }}>
                        ${earning.commission_earned.toFixed(2)}
                      </span>
                      <span className="text-xs" style={{ color: COLORS.text.tertiary }}>
                        {earning.commission_type === "percentage" ? "%" : "Fijo"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor:
                          earning.status === "paid" ? COLORS.success.lighter : COLORS.warning.lighter,
                        color: earning.status === "paid" ? COLORS.success.dark : COLORS.warning.dark,
                      }}
                    >
                      {earning.status === "paid" ? (
                        <>
                          <CheckCircle className="size-3" />
                          Pagado
                        </>
                      ) : (
                        <>
                          <Clock className="size-3" />
                          Pendiente
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Note */}
      <div
        className="rounded-lg border p-4"
        style={{ backgroundColor: COLORS.info.lighter, borderColor: COLORS.info.light }}
      >
        <p className="text-sm" style={{ color: COLORS.info.dark }}>
          ℹ️ Las comisiones pendientes se procesan mensualmente. El próximo pago será el día 1 del mes siguiente.
        </p>
      </div>
    </div>
  );
}
