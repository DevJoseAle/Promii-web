// ═══════════════════════════════════════════════════════════════
// INFLUENCER STATS SERVICE
// ═══════════════════════════════════════════════════════════════
// Maneja las estadísticas para dashboards de influencers y merchants

import { supabase } from "@/lib/supabase/supabase.client";
import type { SupabaseResponse } from "@/config/types/supabase-response.type";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type InfluencerOverviewStats = {
  total_partnerships: number;
  active_assignments: number;
  total_visits: number;
  total_conversions: number;
  conversion_rate: number;
  monthly_conversions: number;
  total_revenue_generated: number; // Suma de todas las ventas que generó
};

export type MerchantInfluencerStats = {
  influencer_id: string;
  influencer_name: string;
  total_assignments: number;
  total_visits: number;
  total_conversions: number;
  total_revenue: number;
};

export type AssignmentPerformance = {
  assignment_id: string;
  promii_id: string;
  promii_title: string;
  referral_code: string;
  total_visits: number;
  total_conversions: number;
  conversion_rate: number;
  total_revenue: number;
};

// ─────────────────────────────────────────────────────────────
// FETCH: Estadísticas generales del influencer
// ─────────────────────────────────────────────────────────────
export async function getInfluencerOverviewStats(
  influencerId: string
): Promise<SupabaseResponse<InfluencerOverviewStats>> {
  try {
    // 1. Total de partnerships aprobadas
    const { count: totalPartnerships } = await supabase
      .from("influencer_partnerships")
      .select("*", { count: "exact", head: true })
      .eq("influencer_id", influencerId)
      .eq("status", "approved");

    // 2. Asignaciones activas
    const { count: activeAssignments } = await supabase
      .from("promii_influencer_assignments")
      .select("*", { count: "exact", head: true })
      .eq("influencer_id", influencerId)
      .eq("is_active", true);

    // 3. Total de visitas
    const { count: totalVisits } = await supabase
      .from("influencer_referral_visits")
      .select("*", { count: "exact", head: true })
      .eq("influencer_id", influencerId);

    // 4. Total de conversiones
    const { count: totalConversions } = await supabase
      .from("influencer_referral_visits")
      .select("*", { count: "exact", head: true })
      .eq("influencer_id", influencerId)
      .eq("converted", true);

    // 5. Conversiones este mes
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: monthlyConversions } = await supabase
      .from("promii_purchases")
      .select("*", { count: "exact", head: true })
      .eq("influencer_id", influencerId)
      .gte("created_at", startOfMonth.toISOString());

    // 6. Revenue total generado
    const { data: purchases } = await supabase
      .from("promii_purchases")
      .select("paid_amount")
      .eq("influencer_id", influencerId)
      .in("status", ["approved", "redeemed"]);

    const totalRevenue = purchases?.reduce(
      (sum, p) => sum + Number(p.paid_amount),
      0
    ) || 0;

    // 7. Calcular conversion rate
    const visits = totalVisits || 0;
    const conversions = totalConversions || 0;
    const conversionRate = visits > 0 ? (conversions / visits) * 100 : 0;

    const stats: InfluencerOverviewStats = {
      total_partnerships: totalPartnerships || 0,
      active_assignments: activeAssignments || 0,
      total_visits: visits,
      total_conversions: conversions,
      conversion_rate: Math.round(conversionRate * 100) / 100,
      monthly_conversions: monthlyConversions || 0,
      total_revenue_generated: totalRevenue,
    };

    return {
      status: "success",
      data: stats,
      error: null,
    };
  } catch (error) {
    console.error("[getInfluencerOverviewStats] Error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// FETCH: Performance de cada asignación del influencer
// ─────────────────────────────────────────────────────────────
export async function getInfluencerAssignmentPerformance(
  influencerId: string
): Promise<SupabaseResponse<AssignmentPerformance[]>> {
  try {
    // Obtener todas las asignaciones activas con sus promiis
    const { data: assignments, error: assignmentsError } = await supabase
      .from("promii_influencer_assignments")
      .select(
        `
        id,
        promii_id,
        referral_code,
        promii:promii_id (
          title
        )
      `
      )
      .eq("influencer_id", influencerId)
      .eq("is_active", true);

    if (assignmentsError || !assignments) {
      console.error("[getInfluencerAssignmentPerformance] Error:", assignmentsError);
      return {
        status: "error",
        data: null,
        error: assignmentsError?.message || "No assignments found",
      };
    }

    // Para cada asignación, obtener stats
    const performanceData = await Promise.all(
      assignments.map(async (assignment: any) => {
        // Visitas
        const { count: visits } = await supabase
          .from("influencer_referral_visits")
          .select("*", { count: "exact", head: true })
          .eq("assignment_id", assignment.id);

        // Conversiones
        const { count: conversions } = await supabase
          .from("influencer_referral_visits")
          .select("*", { count: "exact", head: true })
          .eq("assignment_id", assignment.id)
          .eq("converted", true);

        // Revenue de este assignment
        const { data: purchases } = await supabase
          .from("promii_purchases")
          .select("paid_amount")
          .eq("referral_code", assignment.referral_code)
          .in("status", ["approved", "redeemed"]);

        const revenue = purchases?.reduce(
          (sum, p) => sum + Number(p.paid_amount),
          0
        ) || 0;

        const v = visits || 0;
        const c = conversions || 0;
        const conversionRate = v > 0 ? (c / v) * 100 : 0;

        return {
          assignment_id: assignment.id,
          promii_id: assignment.promii_id,
          promii_title: assignment.promii?.title || "Sin título",
          referral_code: assignment.referral_code,
          total_visits: v,
          total_conversions: c,
          conversion_rate: Math.round(conversionRate * 100) / 100,
          total_revenue: revenue,
        };
      })
    );

    // Ordenar por conversiones (más exitosos primero)
    performanceData.sort((a, b) => b.total_conversions - a.total_conversions);

    return {
      status: "success",
      data: performanceData,
      error: null,
    };
  } catch (error) {
    console.error("[getInfluencerAssignmentPerformance] Error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// FETCH: Stats de influencers para un merchant
// ─────────────────────────────────────────────────────────────
export async function getMerchantInfluencersStats(
  merchantId: string
): Promise<SupabaseResponse<MerchantInfluencerStats[]>> {
  try {
    // Obtener todos los influencers con partnerships aprobadas
    const { data: partnerships, error: partnershipsError } = await supabase
      .from("influencer_partnerships")
      .select(
        `
        influencer_id,
        influencer:influencer_id (
          display_name
        )
      `
      )
      .eq("merchant_id", merchantId)
      .eq("status", "approved");

    if (partnershipsError || !partnerships) {
      return {
        status: "error",
        data: null,
        error: partnershipsError?.message || "No partnerships found",
      };
    }

    // Para cada influencer, calcular stats
    const statsData = await Promise.all(
      partnerships.map(async (partnership: any) => {
        const influencerId = partnership.influencer_id;

        // Asignaciones totales de este influencer para este merchant
        const { count: totalAssignments } = await supabase
          .from("promii_influencer_assignments")
          .select("*", { count: "exact", head: true })
          .eq("influencer_id", influencerId)
          .eq("merchant_id", merchantId)
          .eq("is_active", true);

        // Visitas totales
        const { data: assignmentIds } = await supabase
          .from("promii_influencer_assignments")
          .select("id")
          .eq("influencer_id", influencerId)
          .eq("merchant_id", merchantId);

        const ids = assignmentIds?.map((a: any) => a.id) || [];

        let totalVisits = 0;
        let totalConversions = 0;

        if (ids.length > 0) {
          const { count: visits } = await supabase
            .from("influencer_referral_visits")
            .select("*", { count: "exact", head: true })
            .in("assignment_id", ids);

          const { count: conversions } = await supabase
            .from("influencer_referral_visits")
            .select("*", { count: "exact", head: true })
            .in("assignment_id", ids)
            .eq("converted", true);

          totalVisits = visits || 0;
          totalConversions = conversions || 0;
        }

        // Revenue generado
        const { data: purchases } = await supabase
          .from("promii_purchases")
          .select("paid_amount")
          .eq("influencer_id", influencerId)
          .in("merchant_id", [merchantId])
          .in("status", ["approved", "redeemed"]);

        const totalRevenue = purchases?.reduce(
          (sum, p) => sum + Number(p.paid_amount),
          0
        ) || 0;

        return {
          influencer_id: influencerId,
          influencer_name: partnership.influencer?.display_name || "Sin nombre",
          total_assignments: totalAssignments || 0,
          total_visits: totalVisits,
          total_conversions: totalConversions,
          total_revenue: totalRevenue,
        };
      })
    );

    // Ordenar por revenue (más exitosos primero)
    statsData.sort((a, b) => b.total_revenue - a.total_revenue);

    return {
      status: "success",
      data: statsData,
      error: null,
    };
  } catch (error) {
    console.error("[getMerchantInfluencersStats] Error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// FETCH: Stats de un promii específico
// ─────────────────────────────────────────────────────────────
export async function getPromiiInfluencerStats(
  promiiId: string
): Promise<SupabaseResponse<AssignmentPerformance[]>> {
  try {
    const { data: assignments, error } = await supabase
      .from("promii_influencer_assignments")
      .select(
        `
        id,
        promii_id,
        referral_code,
        influencer:influencer_id (
          display_name
        )
      `
      )
      .eq("promii_id", promiiId)
      .eq("is_active", true);

    if (error || !assignments) {
      return {
        status: "error",
        data: null,
        error: error?.message || "No assignments found",
      };
    }

    const performanceData = await Promise.all(
      assignments.map(async (assignment: any) => {
        const { count: visits } = await supabase
          .from("influencer_referral_visits")
          .select("*", { count: "exact", head: true })
          .eq("assignment_id", assignment.id);

        const { count: conversions } = await supabase
          .from("influencer_referral_visits")
          .select("*", { count: "exact", head: true })
          .eq("assignment_id", assignment.id)
          .eq("converted", true);

        const { data: purchases } = await supabase
          .from("promii_purchases")
          .select("paid_amount")
          .eq("referral_code", assignment.referral_code)
          .in("status", ["approved", "redeemed"]);

        const revenue = purchases?.reduce(
          (sum, p) => sum + Number(p.paid_amount),
          0
        ) || 0;

        const v = visits || 0;
        const c = conversions || 0;
        const conversionRate = v > 0 ? (c / v) * 100 : 0;

        return {
          assignment_id: assignment.id,
          promii_id: assignment.promii_id,
          promii_title: assignment.influencer?.display_name || "Sin nombre",
          referral_code: assignment.referral_code,
          total_visits: v,
          total_conversions: c,
          conversion_rate: Math.round(conversionRate * 100) / 100,
          total_revenue: revenue,
        };
      })
    );

    performanceData.sort((a, b) => b.total_conversions - a.total_conversions);

    return {
      status: "success",
      data: performanceData,
      error: null,
    };
  } catch (error) {
    console.error("[getPromiiInfluencerStats] Error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}
