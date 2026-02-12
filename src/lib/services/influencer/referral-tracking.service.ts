// ═══════════════════════════════════════════════════════════════
// REFERRAL TRACKING SERVICE
// ═══════════════════════════════════════════════════════════════
// Maneja el tracking de visitas y conversiones desde links de influencers

import { supabase } from "@/lib/supabase/supabase.client";
import { getAssignmentByReferralCode } from "./influencer-assignments.service";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const REFERRAL_CODE_KEY = "promii_ref_code";
const REFERRAL_TIMESTAMP_KEY = "promii_ref_timestamp";
const ATTRIBUTION_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type ReferralVisit = {
  id: string;
  assignment_id: string;
  promii_id: string;
  influencer_id: string;
  visited_at: string;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  converted: boolean;
  purchase_id: string | null;
  converted_at: string | null;
};

// ─────────────────────────────────────────────────────────────
// UTILS: LocalStorage management
// ─────────────────────────────────────────────────────────────
export function saveReferralCode(code: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(REFERRAL_CODE_KEY, code);
    localStorage.setItem(REFERRAL_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error("[saveReferralCode] Error:", error);
  }
}

export function getReferralCode(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const code = localStorage.getItem(REFERRAL_CODE_KEY);
    const timestamp = localStorage.getItem(REFERRAL_TIMESTAMP_KEY);

    if (!code || !timestamp) return null;

    // Verificar que no haya expirado
    const age = Date.now() - parseInt(timestamp);
    if (age > ATTRIBUTION_WINDOW_MS) {
      clearReferralCode();
      return null;
    }

    return code;
  } catch (error) {
    console.error("[getReferralCode] Error:", error);
    return null;
  }
}

export function clearReferralCode(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(REFERRAL_CODE_KEY);
    localStorage.removeItem(REFERRAL_TIMESTAMP_KEY);
  } catch (error) {
    console.error("[clearReferralCode] Error:", error);
  }
}

// ─────────────────────────────────────────────────────────────
// TRACK: Registrar visita desde link de influencer
// ─────────────────────────────────────────────────────────────
export async function trackReferralVisit(
  referralCode: string,
  promiiId: string
): Promise<boolean> {
  try {
    // 1. Buscar asignación activa
    const assignment = await getAssignmentByReferralCode(referralCode);

    if (!assignment) {
      console.warn("[trackReferralVisit] Invalid or inactive referral code:", referralCode);
      return false;
    }

    // Verificar que el promii coincida
    if (assignment.promii_id !== promiiId) {
      console.warn("[trackReferralVisit] Promii mismatch");
      return false;
    }

    // 2. Obtener datos del visitante
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : null;
    const referrer = typeof document !== "undefined" ? document.referrer : null;

    // 3. Registrar visita
    const { error } = await supabase
      .from("influencer_referral_visits")
      .insert({
        assignment_id: assignment.id,
        promii_id: promiiId,
        influencer_id: assignment.influencer_id,
        visited_at: new Date().toISOString(),
        ip_address: null, // Se puede agregar con edge function
        user_agent: userAgent,
        referrer: referrer,
        converted: false,
      });

    if (error) {
      console.error("[trackReferralVisit] Error inserting visit:", error);
      return false;
    }

    // 4. Guardar código en localStorage para conversión futura
    saveReferralCode(referralCode);

    return true;
  } catch (error) {
    console.error("[trackReferralVisit] Unexpected error:", error);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// TRACK: Registrar conversión (compra completada)
// ─────────────────────────────────────────────────────────────
export async function trackReferralConversion(
  purchaseId: string,
  promiiId: string
): Promise<boolean> {
  try {
    // 1. Obtener código de referido guardado
    const referralCode = getReferralCode();

    if (!referralCode) {
      console.log("[trackReferralConversion] No referral code found");
      return false;
    }

    // 2. Buscar asignación
    const assignment = await getAssignmentByReferralCode(referralCode);

    if (!assignment) {
      console.warn("[trackReferralConversion] Invalid referral code");
      clearReferralCode();
      return false;
    }

    // 3. Actualizar la compra con datos del referido
    const { error: purchaseError } = await supabase
      .from("promii_purchases")
      .update({
        referral_code: referralCode,
        influencer_id: assignment.influencer_id,
      })
      .eq("id", purchaseId);

    if (purchaseError) {
      console.error("[trackReferralConversion] Error updating purchase:", purchaseError);
    }

    // 4. Marcar la visita más reciente como convertida
    const { error: visitError } = await supabase
      .from("influencer_referral_visits")
      .update({
        converted: true,
        purchase_id: purchaseId,
        converted_at: new Date().toISOString(),
      })
      .eq("assignment_id", assignment.id)
      .eq("promii_id", promiiId)
      .eq("converted", false)
      .order("visited_at", { ascending: false })
      .limit(1);

    if (visitError) {
      console.error("[trackReferralConversion] Error updating visit:", visitError);
    }

    // 5. Limpiar localStorage
    clearReferralCode();

    return true;
  } catch (error) {
    console.error("[trackReferralConversion] Unexpected error:", error);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// FETCH: Obtener visitas de una asignación
// ─────────────────────────────────────────────────────────────
export async function getAssignmentVisits(
  assignmentId: string
): Promise<ReferralVisit[]> {
  try {
    const { data, error } = await supabase
      .from("influencer_referral_visits")
      .select("*")
      .eq("assignment_id", assignmentId)
      .order("visited_at", { ascending: false });

    if (error) {
      console.error("[getAssignmentVisits] Error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[getAssignmentVisits] Unexpected error:", error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// STATS: Obtener estadísticas de una asignación
// ─────────────────────────────────────────────────────────────
export async function getAssignmentStats(assignmentId: string): Promise<{
  total_visits: number;
  total_conversions: number;
  conversion_rate: number;
}> {
  try {
    // Total de visitas
    const { count: totalVisits } = await supabase
      .from("influencer_referral_visits")
      .select("*", { count: "exact", head: true })
      .eq("assignment_id", assignmentId);

    // Total de conversiones
    const { count: totalConversions } = await supabase
      .from("influencer_referral_visits")
      .select("*", { count: "exact", head: true })
      .eq("assignment_id", assignmentId)
      .eq("converted", true);

    const visits = totalVisits || 0;
    const conversions = totalConversions || 0;
    const conversionRate = visits > 0 ? (conversions / visits) * 100 : 0;

    return {
      total_visits: visits,
      total_conversions: conversions,
      conversion_rate: conversionRate,
    };
  } catch (error) {
    console.error("[getAssignmentStats] Error:", error);
    return {
      total_visits: 0,
      total_conversions: 0,
      conversion_rate: 0,
    };
  }
}
