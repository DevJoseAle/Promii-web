import { supabaseAdmin } from "@/lib/supabase/supabase.admin.client";
import { SupabaseResponse, success, failure } from "@/config/types/supabase-response.type";

export type PromiiStatus = "active" | "paused" | "expired";

export type PromiiAdmin = {
  id: string;
  title: string;
  description: string | null;
  price_amount: number;
  original_price_amount: number | null;
  discount_label: string | null;
  status: PromiiStatus;
  created_at: string;
  end_at: string | null;
  merchant_id: string;
  merchant_name: string | null;
};

/**
 * Obtiene lista de promiis (usa RPC para evitar problemas de RLS)
 */
export async function getPromiis(
  status?: PromiiStatus
): Promise<SupabaseResponse<PromiiAdmin[]>> {
  try {
    const { data, error } = await supabaseAdmin.rpc("admin_get_promiis", {
      p_status: status || null,
    });

    if (error) {
      console.error("[getPromiis] RPC error:", error);
      return failure(error.message, "Error al obtener promiis", "RPC_ERROR");
    }

    return success(data as PromiiAdmin[]);
  } catch (err) {
    console.error("[getPromiis] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

/**
 * Pausar un promii (usa RPC para evitar problemas de RLS)
 */
export async function pausePromii(promiiId: string): Promise<SupabaseResponse<void>> {
  try {
    const { data, error } = await supabaseAdmin.rpc("admin_pause_promii", {
      p_promii_id: promiiId,
    });

    if (error) {
      console.error("[pausePromii] RPC error:", error);
      return failure(error.message, "Error al pausar promii", "RPC_ERROR");
    }

    if (!data || !data.success) {
      return failure(data?.error || "Error desconocido", "No se pudo pausar", "PAUSE_ERROR");
    }

    return success(undefined);
  } catch (err) {
    console.error("[pausePromii] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

/**
 * Activar un promii (usa RPC para evitar problemas de RLS)
 */
export async function activatePromii(promiiId: string): Promise<SupabaseResponse<void>> {
  try {
    const { data, error } = await supabaseAdmin.rpc("admin_activate_promii", {
      p_promii_id: promiiId,
    });

    if (error) {
      console.error("[activatePromii] RPC error:", error);
      return failure(error.message, "Error al activar promii", "RPC_ERROR");
    }

    if (!data || !data.success) {
      return failure(data?.error || "Error desconocido", "No se pudo activar", "ACTIVATION_ERROR");
    }

    return success(undefined);
  } catch (err) {
    console.error("[activatePromii] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}
