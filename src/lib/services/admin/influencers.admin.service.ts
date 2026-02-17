import { supabaseAdmin } from "@/lib/supabase/supabase.admin.client";
import { SupabaseResponse, success, failure } from "@/config/types/supabase-response.type";

export type InfluencerStatus = "pending" | "approved" | "rejected" | "blocked";

export type InfluencerFull = {
  id: string;
  verification_status: InfluencerStatus;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  niche_primary: string;
  niche_secondary: string | null;
  state: string;
  city: string;
  zone: string | null;
  instagram_handle: string;
  tiktok_handle: string | null;
  youtube_handle: string | null;
  link_in_bio_url: string | null;
  collaboration_types: string[];
  accepts_barter: boolean;
  min_fee_usd: number | null;
  created_at: string;
  updated_at: string;
};

export type InfluencerUpdatePayload = Partial<Omit<InfluencerFull, "id" | "created_at" | "updated_at">>;

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
 * Obtiene todos los campos de un influencer por ID
 */
export async function getInfluencerById(influencerId: string): Promise<SupabaseResponse<InfluencerFull>> {
  try {
    const { data, error } = await supabaseAdmin
      .from("influencers")
      .select("*")
      .eq("id", influencerId)
      .single();

    if (error) {
      return failure(error.message, "Error al obtener influencer", "FETCH_ERROR");
    }

    return success(data as InfluencerFull);
  } catch (err) {
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

/**
 * Actualiza campos editables de un influencer
 */
export async function updateInfluencer(
  influencerId: string,
  payload: InfluencerUpdatePayload
): Promise<SupabaseResponse<InfluencerFull>> {
  try {
    const { data, error } = await supabaseAdmin
      .from("influencers")
      .update(payload)
      .eq("id", influencerId)
      .select()
      .single();

    if (error) {
      return failure(error.message, "Error al actualizar influencer", "UPDATE_ERROR");
    }

    return success(data as InfluencerFull);
  } catch (err) {
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
