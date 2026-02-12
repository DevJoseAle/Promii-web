"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Users, Code, Eye, ShoppingCart } from "lucide-react";
import { COLORS } from "@/config/colors";
import { getInfluencerOverviewStats, type InfluencerOverviewStats } from "@/lib/services/influencer";

interface OverviewTabProps {
  influencerId: string;
}

export function OverviewTab({ influencerId }: OverviewTabProps) {
  const [stats, setStats] = useState<InfluencerOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [influencerId]);

  async function loadStats() {
    setLoading(true);
    const response = await getInfluencerOverviewStats(influencerId);

    if (response.status === "success" && response.data) {
      setStats(response.data);
    }

    setLoading(false);
  }

  if (loading) {
    return <div className="text-center py-8" style={{ color: COLORS.text.secondary }}>Cargando estadísticas...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8" style={{ color: COLORS.error.main }}>Error al cargar estadísticas</div>;
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Partnerships */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS.primary.lighter, color: COLORS.primary.main }}
            >
              <Users className="size-5" />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
            {stats.total_partnerships}
          </div>
          <div className="text-sm" style={{ color: COLORS.text.secondary }}>
            Marcas colaborando
          </div>
        </div>

        {/* Active Assignments */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS.info.lighter, color: COLORS.info.main }}
            >
              <Code className="size-5" />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
            {stats.active_assignments}
          </div>
          <div className="text-sm" style={{ color: COLORS.text.secondary }}>
            Códigos activos
          </div>
        </div>

        {/* Total Visits */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS.warning.lighter, color: COLORS.warning.main }}
            >
              <Eye className="size-5" />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
            {stats.total_visits.toLocaleString()}
          </div>
          <div className="text-sm" style={{ color: COLORS.text.secondary }}>
            Visitas totales
          </div>
        </div>

        {/* Total Conversions */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS.success.lighter, color: COLORS.success.main }}
            >
              <ShoppingCart className="size-5" />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
            {stats.total_conversions}
          </div>
          <div className="text-sm" style={{ color: COLORS.text.secondary }}>
            Ventas generadas
          </div>
        </div>

        {/* Conversion Rate */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS.primary.lighter, color: COLORS.primary.main }}
            >
              <TrendingUp className="size-5" />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
            {stats.conversion_rate.toFixed(2)}%
          </div>
          <div className="text-sm" style={{ color: COLORS.text.secondary }}>
            Tasa de conversión
          </div>
        </div>

        {/* Total Revenue */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS.success.lighter, color: COLORS.success.main }}
            >
              <DollarSign className="size-5" />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
            ${stats.total_revenue_generated.toFixed(2)}
          </div>
          <div className="text-sm" style={{ color: COLORS.text.secondary }}>
            Revenue generado
          </div>
        </div>
      </div>

      {/* Monthly Performance */}
      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.text.primary }}>
          Rendimiento este mes
        </h3>
        <div className="flex items-center gap-3">
          <div
            className="flex size-12 items-center justify-center rounded-lg"
            style={{ backgroundColor: COLORS.success.lighter, color: COLORS.success.main }}
          >
            <ShoppingCart className="size-6" />
          </div>
          <div>
            <div className="text-3xl font-bold" style={{ color: COLORS.text.primary }}>
              {stats.monthly_conversions}
            </div>
            <div className="text-sm" style={{ color: COLORS.text.secondary }}>
              Conversiones en {new Date().toLocaleDateString('es-VE', { month: 'long' })}
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: COLORS.info.lighter,
          borderColor: COLORS.info.light,
        }}
      >
        <p className="text-sm font-medium" style={{ color: COLORS.info.dark }}>
          💡 <strong>Tip:</strong> Comparte tus códigos de referido en Instagram Stories y TikTok para aumentar tus conversiones.
          La tasa de conversión promedio de influencers activos es del 3-5%.
        </p>
      </div>
    </div>
  );
}
