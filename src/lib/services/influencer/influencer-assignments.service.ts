// ═══════════════════════════════════════════════════════════════
// INFLUENCER ASSIGNMENTS SERVICE
// ═══════════════════════════════════════════════════════════════
// Maneja la asignación de influencers a promiis específicos

import { supabase } from "@/lib/supabase/supabase.client";
import type { SupabaseResponse } from "@/config/types/supabase-response.type";
import { hasApprovedPartnership } from "./influencer-partnerships.service";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type CommissionType = "percentage" | "fixed";

export type Assignment = {
  id: string;
  promii_id: string;
  influencer_id: string;
  merchant_id: string;
  referral_code: string;
  commission_type: CommissionType | null;
  commission_value: number | null;
  commission_notes: string | null;
  is_active: boolean;
  assigned_at: string;
  deactivated_at: string | null;
  created_at: string;
};

export type AssignmentWithDetails = Assignment & {
  promii?: {
    id: string;
    title: string;
    price_amount: number;
    price_currency: string;
    status: string;
    end_at: string;
  };
  influencer?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    instagram_handle: string;
  };
  stats?: {
    total_visits: number;
    total_conversions: number;
    total_revenue: number;
  };
};

export type CreateAssignmentRequest = {
  promii_id: string;
  influencer_id: string;
  merchant_id: string;
  commission?: {
    type: CommissionType;
    value: number;
    notes?: string;
  };
};

// ─────────────────────────────────────────────────────────────
// CREATE: Asignar influencer a promii
// ─────────────────────────────────────────────────────────────
export async function assignInfluencerToPromii(
  request: CreateAssignmentRequest
): Promise<SupabaseResponse<Assignment & { referral_code: string }>> {
  try {
    // 1. Verificar que existe partnership aprobada
    const hasPartnership = await hasApprovedPartnership(
      request.merchant_id,
      request.influencer_id
    );

    if (!hasPartnership) {
      return {
        status: "error",
        data: null,
        error: "No tienes una partnership aprobada con este influencer",
        code: "NO_PARTNERSHIP",
      };
    }

    // 2. Verificar si ya existe asignación activa
    const { data: existing } = await supabase
      .from("promii_influencer_assignments")
      .select("id, is_active")
      .eq("promii_id", request.promii_id)
      .eq("influencer_id", request.influencer_id)
      .maybeSingle();

    if (existing?.is_active) {
      return {
        status: "error",
        data: null,
        error: "Este influencer ya está asignado a este promii",
        code: "ALREADY_ASSIGNED",
      };
    }

    // 3. Generar código de referido único usando la función de Supabase
    const { data: codeData, error: codeError } = await supabase.rpc(
      "generate_referral_code",
      {
        p_influencer_id: request.influencer_id,
        p_promii_id: request.promii_id,
      }
    );

    if (codeError || !codeData) {
      console.error("[assignInfluencer] Error generating code:", codeError);
      return {
        status: "error",
        data: null,
        error: "Error generando código de referido",
        code: "CODE_GENERATION_ERROR",
      };
    }

    const referralCode = codeData as string;

    // 4. Crear asignación
    const { data, error } = await supabase
      .from("promii_influencer_assignments")
      .insert({
        promii_id: request.promii_id,
        influencer_id: request.influencer_id,
        merchant_id: request.merchant_id,
        referral_code: referralCode,
        commission_type: request.commission?.type || null,
        commission_value: request.commission?.value || null,
        commission_notes: request.commission?.notes || null,
        is_active: true,
        assigned_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[assignInfluencer] Error:", error);
      return {
        status: "error",
        data: null,
        error: error.message,
        code: error.code,
      };
    }

    // TODO: Crear notificación para el influencer

    return {
      status: "success",
      data: { ...data, referral_code: referralCode },
      error: null,
    };
  } catch (error) {
    console.error("[assignInfluencer] Unexpected error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// UPDATE: Desactivar asignación
// ─────────────────────────────────────────────────────────────
export async function deactivateAssignment(
  assignmentId: string,
  merchantId: string
): Promise<SupabaseResponse<void>> {
  try {
    const { error } = await supabase
      .from("promii_influencer_assignments")
      .update({
        is_active: false,
        deactivated_at: new Date().toISOString(),
      })
      .eq("id", assignmentId)
      .eq("merchant_id", merchantId); // Security check

    if (error) {
      console.error("[deactivateAssignment] Error:", error);
      return {
        status: "error",
        data: null,
        error: error.message,
        code: error.code,
      };
    }

    return {
      status: "success",
      data: undefined,
      error: null,
    };
  } catch (error) {
    console.error("[deactivateAssignment] Unexpected error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// UPDATE: Reactivar asignación
// ─────────────────────────────────────────────────────────────
export async function reactivateAssignment(
  assignmentId: string,
  merchantId: string
): Promise<SupabaseResponse<void>> {
  try {
    const { error } = await supabase
      .from("promii_influencer_assignments")
      .update({
        is_active: true,
        deactivated_at: null,
      })
      .eq("id", assignmentId)
      .eq("merchant_id", merchantId);

    if (error) {
      console.error("[reactivateAssignment] Error:", error);
      return {
        status: "error",
        data: null,
        error: error.message,
        code: error.code,
      };
    }

    return {
      status: "success",
      data: undefined,
      error: null,
    };
  } catch (error) {
    console.error("[reactivateAssignment] Unexpected error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE: Eliminar asignación permanentemente
// ─────────────────────────────────────────────────────────────
export async function deleteAssignment(
  assignmentId: string,
  merchantId: string
): Promise<SupabaseResponse<void>> {
  try {
    const { error } = await supabase
      .from("promii_influencer_assignments")
      .delete()
      .eq("id", assignmentId)
      .eq("merchant_id", merchantId);

    if (error) {
      console.error("[deleteAssignment] Error:", error);
      return {
        status: "error",
        data: null,
        error: error.message,
        code: error.code,
      };
    }

    return {
      status: "success",
      data: undefined,
      error: null,
    };
  } catch (error) {
    console.error("[deleteAssignment] Unexpected error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// FETCH: Asignaciones de un promii
// ─────────────────────────────────────────────────────────────
export async function getPromiiAssignments(
  promiiId: string,
  includeInactive = false
): Promise<SupabaseResponse<AssignmentWithDetails[]>> {
  try {
    let query = supabase
      .from("promii_influencer_assignments")
      .select(
        `
        *,
        influencer:influencer_id (
          id,
          display_name,
          avatar_url,
          instagram_handle
        )
      `
      )
      .eq("promii_id", promiiId)
      .order("assigned_at", { ascending: false });

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[getPromiiAssignments] Error:", error);
      return {
        status: "error",
        data: null,
        error: error.message,
        code: error.code,
      };
    }

    return {
      status: "success",
      data: (data as AssignmentWithDetails[]) || [],
      error: null,
    };
  } catch (error) {
    console.error("[getPromiiAssignments] Unexpected error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// FETCH: Asignaciones de un influencer
// ─────────────────────────────────────────────────────────────
export async function getInfluencerAssignments(
  influencerId: string,
  includeInactive = false
): Promise<SupabaseResponse<AssignmentWithDetails[]>> {
  try {
    let query = supabase
      .from("promii_influencer_assignments")
      .select(
        `
        *,
        promii:promii_id (
          id,
          title,
          price_amount,
          price_currency,
          status,
          end_at
        )
      `
      )
      .eq("influencer_id", influencerId)
      .order("assigned_at", { ascending: false });

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[getInfluencerAssignments] Error:", error);
      return {
        status: "error",
        data: null,
        error: error.message,
        code: error.code,
      };
    }

    return {
      status: "success",
      data: (data as AssignmentWithDetails[]) || [],
      error: null,
    };
  } catch (error) {
    console.error("[getInfluencerAssignments] Unexpected error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// FETCH: Asignaciones de un merchant
// ─────────────────────────────────────────────────────────────
export async function getMerchantAssignments(
  merchantId: string
): Promise<SupabaseResponse<AssignmentWithDetails[]>> {
  try {
    const { data, error } = await supabase
      .from("promii_influencer_assignments")
      .select(
        `
        *,
        promii:promii_id (
          id,
          title,
          price_amount,
          price_currency,
          status,
          end_at
        ),
        influencer:influencer_id (
          id,
          display_name,
          avatar_url,
          instagram_handle
        )
      `
      )
      .eq("merchant_id", merchantId)
      .eq("is_active", true)
      .order("assigned_at", { ascending: false });

    if (error) {
      console.error("[getMerchantAssignments] Error:", error);
      return {
        status: "error",
        data: null,
        error: error.message,
        code: error.code,
      };
    }

    return {
      status: "success",
      data: (data as AssignmentWithDetails[]) || [],
      error: null,
    };
  } catch (error) {
    console.error("[getMerchantAssignments] Unexpected error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// GET: Obtener assignment por código de referido
// ─────────────────────────────────────────────────────────────
export async function getAssignmentByReferralCode(
  referralCode: string
): Promise<Assignment | null> {
  try {
    const { data } = await supabase
      .from("promii_influencer_assignments")
      .select("*")
      .eq("referral_code", referralCode)
      .eq("is_active", true)
      .maybeSingle();

    return data || null;
  } catch (error) {
    console.error("[getAssignmentByReferralCode] Error:", error);
    return null;
  }
}
