// ═══════════════════════════════════════════════════════════════
// INFLUENCER PARTNERSHIPS SERVICE
// ═══════════════════════════════════════════════════════════════
// Maneja las solicitudes y aprobaciones entre merchants e influencers

import { supabase } from "@/lib/supabase/supabase.client";
import type { SupabaseResponse } from "@/config/types/supabase-response.type";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type PartnershipStatus = "pending" | "approved" | "rejected";

export type Partnership = {
  id: string;
  merchant_id: string;
  influencer_id: string;
  status: PartnershipStatus;
  merchant_message: string | null;
  influencer_notes: string | null;
  requested_at: string;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PartnershipWithDetails = Partnership & {
  merchant?: {
    id: string;
    business_name: string;
    logo_url: string | null;
    phone: string;
    address_line: string | null;
    city: string;
    state: string;
    category: string | null;
    website_url: string | null;
    whatsapp_phone: string | null;
    description: string | null;
  };
  influencer?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
    instagram_handle: string;
    tiktok_handle: string | null;
    niche_primary: string;
    city: string;
    state: string;
  };
};

export type CreatePartnershipRequest = {
  merchant_id: string;
  influencer_id: string;
  merchant_message?: string;
};

export type RespondPartnershipRequest = {
  partnership_id: string;
  influencer_id: string;
  action: "approved" | "rejected";
  influencer_notes?: string;
};

// ─────────────────────────────────────────────────────────────
// CREATE: Merchant solicita seguir a influencer
// ─────────────────────────────────────────────────────────────
export async function requestPartnership(
  request: CreatePartnershipRequest
): Promise<SupabaseResponse<Partnership>> {
  try {
    // Verificar si ya existe una partnership
    const { data: existing } = await supabase
      .from("influencer_partnerships")
      .select("id, status")
      .eq("merchant_id", request.merchant_id)
      .eq("influencer_id", request.influencer_id)
      .maybeSingle();

    if (existing) {
      if (existing.status === "pending") {
        return {
          status: "error",
          data: null,
          error: "Ya tienes una solicitud pendiente con este influencer",
          code: "ALREADY_PENDING",
        };
      }
      if (existing.status === "approved") {
        return {
          status: "error",
          data: null,
          error: "Ya tienes una partnership aprobada con este influencer",
          code: "ALREADY_APPROVED",
        };
      }
      // Si fue rechazada, permitir nueva solicitud
    }

    // Crear nueva partnership
    const { data, error } = await supabase
      .from("influencer_partnerships")
      .insert({
        merchant_id: request.merchant_id,
        influencer_id: request.influencer_id,
        status: "pending",
        merchant_message: request.merchant_message || null,
        requested_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[requestPartnership] Error:", error);
      return {
        status: "error",
        data: null,
        error: error.message,
        code: error.code,
      };
    }

    // TODO: Enviar email/notificación al influencer

    return {
      status: "success",
      data,
      error: null,
    };
  } catch (error) {
    console.error("[requestPartnership] Unexpected error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// UPDATE: Influencer responde (aprueba o rechaza)
// ─────────────────────────────────────────────────────────────
export async function respondToPartnership(
  request: RespondPartnershipRequest
): Promise<SupabaseResponse<Partnership>> {
  try {
    const { data, error } = await supabase
      .from("influencer_partnerships")
      .update({
        status: request.action,
        responded_at: new Date().toISOString(),
        influencer_notes: request.influencer_notes || null,
      })
      .eq("id", request.partnership_id)
      .eq("influencer_id", request.influencer_id) // Security check
      .eq("status", "pending") // Solo puede responder si está pending
      .select()
      .single();

    if (error) {
      console.error("[respondToPartnership] Error:", error);
      return {
        status: "error",
        data: null,
        error: error.message,
        code: error.code,
      };
    }

    if (!data) {
      return {
        status: "error",
        data: null,
        error: "Partnership no encontrada o ya fue respondida",
        code: "NOT_FOUND",
      };
    }

    // TODO: Enviar email/notificación al merchant

    return {
      status: "success",
      data,
      error: null,
    };
  } catch (error) {
    console.error("[respondToPartnership] Unexpected error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// FETCH: Partnerships de un merchant
// ─────────────────────────────────────────────────────────────
export async function getMerchantPartnerships(
  merchantId: string,
  status?: PartnershipStatus
): Promise<SupabaseResponse<PartnershipWithDetails[]>> {
  try {
    let query = supabase
      .from("influencer_partnerships")
      .select(
        `
        *,
        influencer:influencer_id (
          id,
          display_name,
          avatar_url,
          bio,
          instagram_handle,
          tiktok_handle,
          niche_primary,
          city,
          state
        )
      `
      )
      .eq("merchant_id", merchantId)
      .order("requested_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[getMerchantPartnerships] Error:", error);
      return {
        status: "error",
        data: null,
        error: error.message,
        code: error.code,
      };
    }

    return {
      status: "success",
      data: (data as PartnershipWithDetails[]) || [],
      error: null,
    };
  } catch (error) {
    console.error("[getMerchantPartnerships] Unexpected error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// FETCH: Partnerships de un influencer
// ─────────────────────────────────────────────────────────────
export async function getInfluencerPartnerships(
  influencerId: string,
  status?: PartnershipStatus
): Promise<SupabaseResponse<PartnershipWithDetails[]>> {
  try {
    let query = supabase
      .from("influencer_partnerships")
      .select(
        `
        *,
        merchant:merchant_id (
          id,
          business_name,
          logo_url,
          phone,
          address_line,
          city,
          state,
          category,
          website_url,
          whatsapp_phone,
          description
        )
      `
      )
      .eq("influencer_id", influencerId)
      .order("requested_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[getInfluencerPartnerships] Error:", error);
      return {
        status: "error",
        data: null,
        error: error.message,
        code: error.code,
      };
    }

    return {
      status: "success",
      data: (data as PartnershipWithDetails[]) || [],
      error: null,
    };
  } catch (error) {
    console.error("[getInfluencerPartnerships] Unexpected error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE: Merchant cancela solicitud pendiente
// ─────────────────────────────────────────────────────────────
export async function cancelPartnershipRequest(
  partnershipId: string,
  merchantId: string
): Promise<SupabaseResponse<void>> {
  try {
    const { error } = await supabase
      .from("influencer_partnerships")
      .delete()
      .eq("id", partnershipId)
      .eq("merchant_id", merchantId)
      .eq("status", "pending");

    if (error) {
      console.error("[cancelPartnershipRequest] Error:", error);
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
    console.error("[cancelPartnershipRequest] Unexpected error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// CHECK: Verificar si existe partnership aprobada
// ─────────────────────────────────────────────────────────────
export async function hasApprovedPartnership(
  merchantId: string,
  influencerId: string
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("influencer_partnerships")
      .select("id")
      .eq("merchant_id", merchantId)
      .eq("influencer_id", influencerId)
      .eq("status", "approved")
      .maybeSingle();

    return !!data;
  } catch (error) {
    console.error("[hasApprovedPartnership] Error:", error);
    return false;
  }
}
