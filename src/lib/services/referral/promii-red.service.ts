import { supabase } from "@/lib/supabase/supabase.client";
import type { SupabaseResponse } from "@/config/types/supabase-response.type";
import { success, failure } from "@/config/types/supabase-response.type";

// ============================================================================
// TYPES
// ============================================================================

export type ReferralStatus =
  | "registered"      // merchant se registró con código
  | "approved"        // merchant fue aprobado
  | "activated"       // merchant lleva 30 días activo (elegible para $5 base)
  | "bonus_eligible"  // merchant lleva 90 días activo (elegible para $5 bonus)
  | "paid";           // ambos pagos completados

export type MerchantReferral = {
  id: string;
  referrer_id: string;
  referred_merchant_id: string;
  referral_code: string;
  status: ReferralStatus;
  base_reward: number;
  bonus_reward: number;
  base_paid_at: string | null;
  bonus_paid_at: string | null;
  payment_notes: string | null;
  registered_at: string;
  approved_at: string | null;
  activated_at: string | null;
  bonus_eligible_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReferralStats = {
  total_referrals: number;
  registered: number;
  approved: number;
  activated: number;
  bonus_eligible: number;
  paid: number;
  total_base_earned: number;
  total_bonus_earned: number;
  total_earned: number;
};

export type ReferralWithMerchant = MerchantReferral & {
  merchant?: {
    business_name: string;
    logo_url: string | null;
    plan_id: string;
    plan_status: string;
    plan_start_at: string | null;
  };
};

// ============================================================================
// REFERRAL CODE MANAGEMENT
// ============================================================================

/**
 * Obtiene o genera el código de referido de un usuario
 */
export async function getOrCreateReferralCode(
  userId: string
): Promise<SupabaseResponse<string>> {
  try {
    // Primero intentar obtener código existente
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error("[getOrCreateReferralCode] Error fetching profile:", fetchError);
      return failure(fetchError.message, "Error al obtener perfil", "FETCH_ERROR");
    }

    // Si ya tiene código, retornarlo
    if (profile.referral_code) {
      return success(profile.referral_code);
    }

    // Si no tiene código, generarlo
    const { data: generatedCode, error: generateError } = await supabase.rpc(
      "generate_user_referral_code",
      { user_id: userId }
    );

    if (generateError) {
      console.error("[getOrCreateReferralCode] Error generating code:", generateError);
      return failure(generateError.message, "Error al generar código", "GENERATE_ERROR");
    }

    // Guardar código en el perfil
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ referral_code: generatedCode })
      .eq("id", userId);

    if (updateError) {
      console.error("[getOrCreateReferralCode] Error updating profile:", updateError);
      return failure(updateError.message, "Error al guardar código", "UPDATE_ERROR");
    }

    return success(generatedCode as string);
  } catch (err) {
    console.error("[getOrCreateReferralCode] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

/**
 * Valida que un código de referido existe y retorna el referrer_id
 * Usa RPC para evitar problemas con RLS
 */
export async function validateReferralCode(
  code: string
): Promise<SupabaseResponse<{ referrer_id: string; referrer_name: string }>> {
  try {
    const cleanCode = code.trim().toUpperCase();

    // Usar RPC para evitar restricciones de RLS
    const { data, error } = await supabase.rpc("validate_referral_code", {
      code: cleanCode,
    });

    if (error) {
      console.error("[validateReferralCode] RPC error:", error);
      return failure(
        "Código de referido no encontrado",
        "El código ingresado no es válido",
        "INVALID_CODE"
      );
    }

    if (!data || !data.referrer_id) {
      return failure(
        "Código de referido no encontrado",
        "El código ingresado no es válido",
        "INVALID_CODE"
      );
    }

    return success({
      referrer_id: data.referrer_id,
      referrer_name: data.referrer_name || "Usuario",
    });
  } catch (err) {
    console.error("[validateReferralCode] Error:", err);
    return failure(String(err), "Error al validar código", "UNEXPECTED_ERROR");
  }
}

// ============================================================================
// REFERRAL TRACKING
// ============================================================================

/**
 * Crea un registro de referral cuando un merchant se registra con un código
 */
export async function trackMerchantReferral(
  referralCode: string,
  merchantId: string
): Promise<SupabaseResponse<MerchantReferral>> {
  try {
    // Usar RPC para evitar problemas de RLS
    const { data, error } = await supabase.rpc("create_merchant_referral", {
      p_referral_code: referralCode.trim().toUpperCase(),
      p_merchant_id: merchantId,
    });

    if (error) {
      console.error("[trackMerchantReferral] RPC error:", error);
      return failure(error.message, "Error al registrar referido", "RPC_ERROR");
    }

    // La función RPC retorna un JSON con { success, data?, error? }
    if (!data || !data.success) {
      return failure(
        data?.error || "Error desconocido",
        "No se pudo registrar el referido",
        "REFERRAL_ERROR"
      );
    }

    return success(data.data as MerchantReferral);
  } catch (err) {
    console.error("[trackMerchantReferral] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

// ============================================================================
// USER STATS & HISTORY
// ============================================================================

/**
 * Obtiene las estadísticas de referidos de un usuario
 */
export async function getUserReferralStats(
  userId: string
): Promise<SupabaseResponse<ReferralStats>> {
  try {
    const { data, error } = await supabase
      .from("user_referral_stats")
      .select("*")
      .eq("referrer_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[getUserReferralStats] Error:", error);
      return failure(error.message, "Error al obtener estadísticas", "FETCH_ERROR");
    }

    // Si no tiene referrals (data es null), retornar stats en 0
    if (!data) {
      return success({
        total_referrals: 0,
        registered: 0,
        approved: 0,
        activated: 0,
        bonus_eligible: 0,
        paid: 0,
        total_base_earned: 0,
        total_bonus_earned: 0,
        total_earned: 0,
      });
    }

    return success(data as ReferralStats);
  } catch (err) {
    console.error("[getUserReferralStats] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

/**
 * Obtiene la lista de merchants referidos por un usuario
 */
export async function getMyReferrals(
  userId: string
): Promise<SupabaseResponse<ReferralWithMerchant[]>> {
  try {
    const { data, error } = await supabase
      .from("merchant_referrals")
      .select(
        `
        *,
        merchant:merchants!merchant_referrals_referred_merchant_id_fkey(
          business_name,
          logo_url,
          plan_id,
          plan_status,
          plan_start_at
        )
      `
      )
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getMyReferrals] Error:", error);
      return failure(error.message, "Error al obtener referidos", "FETCH_ERROR");
    }

    return success((data || []) as ReferralWithMerchant[]);
  } catch (err) {
    console.error("[getMyReferrals] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

// ============================================================================
// ADMIN / CRON FUNCTIONS
// ============================================================================

/**
 * Actualiza el status de un referral (para admin o cron jobs)
 */
export async function updateReferralStatus(
  referralId: string,
  newStatus: ReferralStatus,
  notes?: string
): Promise<SupabaseResponse<MerchantReferral>> {
  try {
    const updates: Partial<MerchantReferral> = {
      status: newStatus,
    };

    // Actualizar timestamps según el nuevo status
    const now = new Date().toISOString();

    if (newStatus === "approved" && !updates.approved_at) {
      updates.approved_at = now;
    }

    if (newStatus === "activated" && !updates.activated_at) {
      updates.activated_at = now;
    }

    if (newStatus === "bonus_eligible" && !updates.bonus_eligible_at) {
      updates.bonus_eligible_at = now;
    }

    if (notes) {
      updates.payment_notes = notes;
    }

    const { data, error } = await supabase
      .from("merchant_referrals")
      .update(updates)
      .eq("id", referralId)
      .select()
      .single();

    if (error) {
      console.error("[updateReferralStatus] Error:", error);
      return failure(error.message, "Error al actualizar status", "UPDATE_ERROR");
    }

    return success(data as MerchantReferral);
  } catch (err) {
    console.error("[updateReferralStatus] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

/**
 * Marca el pago base como completado
 */
export async function markBaseRewardPaid(
  referralId: string,
  notes?: string
): Promise<SupabaseResponse<MerchantReferral>> {
  try {
    const { data, error } = await supabase
      .from("merchant_referrals")
      .update({
        base_paid_at: new Date().toISOString(),
        payment_notes: notes || null,
      })
      .eq("id", referralId)
      .select()
      .single();

    if (error) {
      console.error("[markBaseRewardPaid] Error:", error);
      return failure(error.message, "Error al marcar pago base", "UPDATE_ERROR");
    }

    return success(data as MerchantReferral);
  } catch (err) {
    console.error("[markBaseRewardPaid] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

/**
 * Marca el pago bonus como completado
 */
export async function markBonusRewardPaid(
  referralId: string,
  notes?: string
): Promise<SupabaseResponse<MerchantReferral>> {
  try {
    const { data, error } = await supabase
      .from("merchant_referrals")
      .update({
        bonus_paid_at: new Date().toISOString(),
        payment_notes: notes || null,
        status: "paid", // Marcar como completamente pagado
      })
      .eq("id", referralId)
      .select()
      .single();

    if (error) {
      console.error("[markBonusRewardPaid] Error:", error);
      return failure(error.message, "Error al marcar pago bonus", "UPDATE_ERROR");
    }

    return success(data as MerchantReferral);
  } catch (err) {
    console.error("[markBonusRewardPaid] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

/**
 * Obtiene referrals pendientes de activación (merchants con 30+ días activos)
 * Para uso en cron jobs
 */
export async function getPendingActivations(): Promise<
  SupabaseResponse<ReferralWithMerchant[]>
> {
  try {
    // Obtener referrals en status "approved" donde el merchant:
    // - plan_status = 'active'
    // - plan_start_at >= 30 días atrás
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from("merchant_referrals")
      .select(
        `
        *,
        merchant:merchants!merchant_referrals_referred_merchant_id_fkey(
          business_name,
          logo_url,
          plan_id,
          plan_status,
          plan_start_at
        )
      `
      )
      .eq("status", "approved")
      .not("merchant.plan_start_at", "is", null)
      .lte("merchant.plan_start_at", thirtyDaysAgo.toISOString());

    if (error) {
      console.error("[getPendingActivations] Error:", error);
      return failure(error.message, "Error al obtener activaciones pendientes", "FETCH_ERROR");
    }

    // Filtrar solo los que tienen plan activo
    const filtered = (data || []).filter(
      (ref: any) => ref.merchant?.plan_status === "active"
    );

    return success(filtered as ReferralWithMerchant[]);
  } catch (err) {
    console.error("[getPendingActivations] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

/**
 * Obtiene referrals elegibles para bonus (merchants con 90+ días activos)
 * Para uso en cron jobs
 */
export async function getPendingBonuses(): Promise<
  SupabaseResponse<ReferralWithMerchant[]>
> {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data, error } = await supabase
      .from("merchant_referrals")
      .select(
        `
        *,
        merchant:merchants!merchant_referrals_referred_merchant_id_fkey(
          business_name,
          logo_url,
          plan_id,
          plan_status,
          plan_start_at
        )
      `
      )
      .eq("status", "activated")
      .not("merchant.plan_start_at", "is", null)
      .lte("merchant.plan_start_at", ninetyDaysAgo.toISOString());

    if (error) {
      console.error("[getPendingBonuses] Error:", error);
      return failure(error.message, "Error al obtener bonos pendientes", "FETCH_ERROR");
    }

    // Filtrar solo los que tienen plan activo
    const filtered = (data || []).filter(
      (ref: any) => ref.merchant?.plan_status === "active"
    );

    return success(filtered as ReferralWithMerchant[]);
  } catch (err) {
    console.error("[getPendingBonuses] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}
