import { supabaseAdmin } from "@/lib/supabase/supabase.admin.client";
import { SupabaseResponse, success, failure } from "@/config/types/supabase-response.type";

export type MerchantStatus = "pending" | "approved" | "rejected" | "blocked";

export type MerchantWithApplication = {
  id: string;
  business_name: string;
  verification_status: MerchantStatus;
  created_at: string;
  phone: string;
  whatsapp: string | null;
  state: string;
  city: string;
  contact_name: string | null;
  contact_email: string;
  // Desde business_applications
  application?: {
    address: string;
    zone: string | null;
    referred_by_code: string | null;
  };
};

/**
 * Obtiene lista de merchants con filtros
 */
export async function getMerchants(
  status?: MerchantStatus
): Promise<SupabaseResponse<MerchantWithApplication[]>> {
  try {
    let query = supabaseAdmin
      .from("merchants")
      .select(`
        id,
        business_name,
        verification_status,
        created_at,
        phone,
        whatsapp,
        state,
        city,
        contact_name,
        contact_email
      `)
      .order("created_at", { ascending: false });

    // Filtrar por status si se especifica
    if (status) {
      query = query.eq("verification_status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[getMerchants] Error:", error);
      return failure(error.message, "Error al obtener merchants", "FETCH_ERROR");
    }

    return success(data as MerchantWithApplication[]);
  } catch (err) {
    console.error("[getMerchants] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

/**
 * Aprobar un merchant (usa RPC para evitar problemas de RLS)
 */
export async function approveMerchant(merchantId: string): Promise<SupabaseResponse<void>> {
  try {
    const { data, error } = await supabaseAdmin.rpc("admin_approve_merchant", {
      p_merchant_id: merchantId,
    });

    if (error) {
      console.error("[approveMerchant] RPC error:", error);
      return failure(error.message, "Error al aprobar merchant", "RPC_ERROR");
    }

    if (!data || !data.success) {
      return failure(data?.error || "Error desconocido", "No se pudo aprobar", "APPROVAL_ERROR");
    }

    return success(undefined);
  } catch (err) {
    console.error("[approveMerchant] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

/**
 * Rechazar un merchant (usa RPC para evitar problemas de RLS)
 */
export async function rejectMerchant(merchantId: string): Promise<SupabaseResponse<void>> {
  try {
    const { data, error } = await supabaseAdmin.rpc("admin_reject_merchant", {
      p_merchant_id: merchantId,
    });

    if (error) {
      console.error("[rejectMerchant] RPC error:", error);
      return failure(error.message, "Error al rechazar merchant", "RPC_ERROR");
    }

    if (!data || !data.success) {
      return failure(data?.error || "Error desconocido", "No se pudo rechazar", "REJECTION_ERROR");
    }

    return success(undefined);
  } catch (err) {
    console.error("[rejectMerchant] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}
