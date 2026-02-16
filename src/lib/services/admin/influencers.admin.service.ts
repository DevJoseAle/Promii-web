import { supabaseAdmin } from "@/lib/supabase/supabase.admin.client";
import { SupabaseResponse, success, failure } from "@/config/types/supabase-response.type";

export type InfluencerStatus = "pending" | "approved" | "rejected" | "blocked";

export type InfluencerProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  state: InfluencerStatus;
  created_at: string;
};

/**
 * Obtiene lista de influencers con filtros (usa RPC para evitar problemas de RLS)
 */
export async function getInfluencers(
  status?: InfluencerStatus
): Promise<SupabaseResponse<InfluencerProfile[]>> {
  try {
    const { data, error } = await supabaseAdmin.rpc("admin_get_influencers", {
      p_status: status || null,
    });

    console.log("[getInfluencers] Debug:", { data, error, count: data?.length });

    if (error) {
      console.error("[getInfluencers] RPC error:", error);
      return failure(error.message, "Error al obtener influencers", "RPC_ERROR");
    }

    return success(data as InfluencerProfile[]);
  } catch (err) {
    console.error("[getInfluencers] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

/**
 * Aprobar un influencer (usa RPC para evitar problemas de RLS)
 */
export async function approveInfluencer(influencerId: string): Promise<SupabaseResponse<void>> {
  try {
    const { data, error } = await supabaseAdmin.rpc("admin_approve_influencer", {
      p_influencer_id: influencerId,
    });

    if (error) {
      console.error("[approveInfluencer] RPC error:", error);
      return failure(error.message, "Error al aprobar influencer", "RPC_ERROR");
    }

    if (!data || !data.success) {
      return failure(data?.error || "Error desconocido", "No se pudo aprobar", "APPROVAL_ERROR");
    }

    return success(undefined);
  } catch (err) {
    console.error("[approveInfluencer] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

/**
 * Rechazar un influencer (usa RPC para evitar problemas de RLS)
 */
export async function rejectInfluencer(influencerId: string): Promise<SupabaseResponse<void>> {
  try {
    const { data, error } = await supabaseAdmin.rpc("admin_reject_influencer", {
      p_influencer_id: influencerId,
    });

    if (error) {
      console.error("[rejectInfluencer] RPC error:", error);
      return failure(error.message, "Error al rechazar influencer", "RPC_ERROR");
    }

    if (!data || !data.success) {
      return failure(data?.error || "Error desconocido", "No se pudo rechazar", "REJECTION_ERROR");
    }

    return success(undefined);
  } catch (err) {
    console.error("[rejectInfluencer] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}
