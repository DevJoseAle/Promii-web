import { supabaseAdmin } from "@/lib/supabase/supabase.admin.client";
import { SupabaseResponse, success, failure } from "@/config/types/supabase-response.type";

export type ReferralStatus = "registered" | "approved" | "activated" | "bonus_eligible" | "paid";
export type PaymentFilter = "all" | "base_pending" | "base_paid" | "bonus_pending" | "bonus_paid" | "all_paid";

export type ReferralAdmin = {
  id: string;
  referrer_id: string;
  referrer_name: string;
  referrer_email: string;
  referred_merchant_id: string;
  referred_merchant_name: string;
  referral_code: string;
  status: ReferralStatus;
  base_reward: number;
  bonus_reward: number;
  base_paid_at: string | null;
  bonus_paid_at: string | null;
  base_receipt_url: string | null;
  bonus_receipt_url: string | null;
  payment_notes: string | null;
  registered_at: string;
  approved_at: string | null;
  activated_at: string | null;
  bonus_eligible_at: string | null;
  created_at: string;
};

/**
 * Obtiene lista de referrals con filtros (usa RPC para evitar problemas de RLS)
 */
export async function getReferrals(
  paymentStatus?: PaymentFilter,
  referralStatus?: ReferralStatus
): Promise<SupabaseResponse<ReferralAdmin[]>> {
  try {
    const { data, error } = await supabaseAdmin.rpc("admin_get_referrals", {
      p_payment_status: paymentStatus && paymentStatus !== "all" ? paymentStatus : null,
      p_referral_status: referralStatus || null,
    });

    if (error) {
      console.error("[getReferrals] RPC error:", error);
      return failure(error.message, "Error al obtener referrals", "RPC_ERROR");
    }

    return success(data as ReferralAdmin[]);
  } catch (err) {
    console.error("[getReferrals] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

/**
 * Marcar pago base como completado (usa RPC para evitar problemas de RLS)
 */
export async function markBasePaid(
  referralId: string,
  receiptUrl?: string,
  notes?: string
): Promise<SupabaseResponse<void>> {
  try {
    const { data, error } = await supabaseAdmin.rpc("admin_mark_base_paid", {
      p_referral_id: referralId,
      p_receipt_url: receiptUrl || null,
      p_notes: notes || null,
    });

    if (error) {
      console.error("[markBasePaid] RPC error:", error);
      return failure(error.message, "Error al marcar pago base", "RPC_ERROR");
    }

    if (!data || !data.success) {
      return failure(data?.error || "Error desconocido", "No se pudo marcar el pago", "PAYMENT_ERROR");
    }

    return success(undefined);
  } catch (err) {
    console.error("[markBasePaid] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

/**
 * Marcar pago bonus como completado (usa RPC para evitar problemas de RLS)
 */
export async function markBonusPaid(
  referralId: string,
  receiptUrl?: string,
  notes?: string
): Promise<SupabaseResponse<void>> {
  try {
    const { data, error } = await supabaseAdmin.rpc("admin_mark_bonus_paid", {
      p_referral_id: referralId,
      p_receipt_url: receiptUrl || null,
      p_notes: notes || null,
    });

    if (error) {
      console.error("[markBonusPaid] RPC error:", error);
      return failure(error.message, "Error al marcar pago bonus", "RPC_ERROR");
    }

    if (!data || !data.success) {
      return failure(data?.error || "Error desconocido", "No se pudo marcar el pago", "PAYMENT_ERROR");
    }

    return success(undefined);
  } catch (err) {
    console.error("[markBonusPaid] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}

/**
 * Sube un comprobante de pago a Supabase Storage
 */
export async function uploadPaymentReceipt(
  referralId: string,
  file: File,
  paymentType: "base" | "bonus"
): Promise<SupabaseResponse<string>> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${referralId}_${paymentType}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from("promii-red-receipts")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("[uploadPaymentReceipt] Upload error:", error);
      return failure(error.message, "Error al subir comprobante", "UPLOAD_ERROR");
    }

    // Obtener URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from("promii-red-receipts")
      .getPublicUrl(filePath);

    return success(urlData.publicUrl);
  } catch (err) {
    console.error("[uploadPaymentReceipt] Unexpected error:", err);
    return failure(String(err), "Error inesperado", "UNEXPECTED_ERROR");
  }
}
