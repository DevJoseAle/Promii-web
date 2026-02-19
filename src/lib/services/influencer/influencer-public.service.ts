// ═══════════════════════════════════════════════════════════════
// INFLUENCER PUBLIC SERVICE
// ═══════════════════════════════════════════════════════════════
// Servicio para obtener influencers públicos (para la página de directorio)

import { supabase } from "@/lib/supabase/supabase.client";
import type { SupabaseResponse } from "@/config/types/supabase-response.type";

export type PublicInfluencer = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  niche_primary: string;
  niche_secondary: string | null;
  city: string;
  state: string;
  instagram_handle: string;
  tiktok_handle: string | null;
  youtube_handle: string | null;
  verification_status: string;
};

export type InfluencerFilters = {
  city?: string;
  state?: string;
  niche?: string;
};

export type PublicInfluencerOffer = {
  id: string;
  influencer_id: string;
  type: "fixed" | "barter" | "mixed";
  title: string;
  description: string;
  price_usd: number | null;
  barter_description: string | null;
  is_active: boolean;
  created_at: string;
};

export type PublicInfluencerBrand = {
  id: string;
  business_name: string;
  logo_url: string | null;
  city: string | null;
  state: string | null;
  description: string | null;
  instagram_handle: string | null;
  website_url: string | null;
};

// ─────────────────────────────────────────────────────────────
// FETCH: Todos los influencers aprobados (para directorio público)
// ─────────────────────────────────────────────────────────────
export async function getPublicInfluencers(
  filters: InfluencerFilters = {}
): Promise<SupabaseResponse<PublicInfluencer[]>> {
  try {
    let query = supabase
      .from("influencers")
      .select("*");
      // Temporarily removed verification_status filter to show all influencers
      // .eq("verification_status", "approved");

    // Filtros
    if (filters.city) {
      query = query.eq("city", filters.city);
    }
    if (filters.state) {
      query = query.eq("state", filters.state);
    }
    if (filters.niche) {
      query = query.or(
        `niche_primary.eq.${filters.niche},niche_secondary.eq.${filters.niche}`
      );
    }

    // Ordenar por nombre
    query = query.order("display_name", { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error("[getPublicInfluencers] Error:", error);
      return {
        status: "error",
        data: null,
        error: error.message,
      };
    }

    return {
      status: "success",
      data: data || [],
      error: null,
    };
  } catch (error) {
    console.error("[getPublicInfluencers] Unexpected error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// FETCH: Influencer individual por instagram handle (slug)
// ─────────────────────────────────────────────────────────────
export async function getInfluencerByHandle(
  instagramHandle: string
): Promise<SupabaseResponse<PublicInfluencer>> {
  try {
    // Normalizar handle (quitar @ si existe)
    const handle = instagramHandle.replace("@", "");

    const { data, error } = await supabase
      .from("influencers")
      .select("*")
      .eq("verification_status", "approved")
      .ilike("instagram_handle", `%${handle}%`)
      .maybeSingle();

    if (error) {
      console.error("[getInfluencerByHandle] Error:", error);
      return {
        status: "error",
        data: null,
        error: error.message,
      };
    }

    if (!data) {
      return {
        status: "error",
        data: null,
        error: "Influencer no encontrado",
        code: "NOT_FOUND",
      };
    }

    return {
      status: "success",
      data: data,
      error: null,
    };
  } catch (error) {
    console.error("[getInfluencerByHandle] Unexpected error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// FETCH: Estadísticas públicas del influencer
// ─────────────────────────────────────────────────────────────
export async function getInfluencerPublicStats(influencerId: string): Promise<{
  totalPromiis: number;
  totalBrands: number;
}> {
  try {
    // Contar promiis activos promocionados
    const { count: promiisCount } = await supabase
      .from("influencer_promii_assignments")
      .select("*", { count: "exact", head: true })
      .eq("influencer_id", influencerId)
      .eq("status", "active");

    // Contar brands (partnerships aprobados)
    const { data: partnerships } = await supabase
      .from("influencer_partnerships")
      .select("merchant_id")
      .eq("influencer_id", influencerId)
      .eq("status", "approved");

    const uniqueBrands = new Set(
      partnerships?.map((p) => p.merchant_id) || []
    );

    return {
      totalPromiis: promiisCount || 0,
      totalBrands: uniqueBrands.size,
    };
  } catch (error) {
    console.error("[getInfluencerPublicStats] Error:", error);
    return {
      totalPromiis: 0,
      totalBrands: 0,
    };
  }
}

// ─────────────────────────────────────────────────────────────
// FETCH: Ofertas públicas activas del influencer
// ─────────────────────────────────────────────────────────────
export async function getPublicInfluencerOffers(
  influencerId: string
): Promise<SupabaseResponse<PublicInfluencerOffer[]>> {
  try {
    const { data, error } = await supabase
      .from("influencer_offers")
      .select(
        "id,influencer_id,type,title,description,price_usd,barter_description,is_active,created_at"
      )
      .eq("influencer_id", influencerId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getPublicInfluencerOffers] Error:", error);
      return {
        status: "error",
        data: null,
        error: error.message,
      };
    }

    return {
      status: "success",
      data: data || [],
      error: null,
    };
  } catch (error) {
    console.error("[getPublicInfluencerOffers] Unexpected error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// FETCH: Marcas colaboradoras (partnerships aprobados)
// ─────────────────────────────────────────────────────────────
export async function getPublicInfluencerBrands(
  influencerId: string,
  limit = 10
): Promise<SupabaseResponse<PublicInfluencerBrand[]>> {
  try {
    const { data, error } = await supabase
      .from("influencer_partnerships")
      .select(
        `
        merchant:merchants!influencer_partnerships_merchant_id_fkey(
          id,
          business_name,
          logo_url,
          city,
          state,
          description,
          instagram_handle,
          website_url
        )
      `
      )
      .eq("influencer_id", influencerId)
      .eq("status", "approved")
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("[getPublicInfluencerBrands] Error:", error);
      return {
        status: "error",
        data: null,
        error: error.message,
      };
    }

    const brands = (data ?? [])
      .map((row: { merchant?: PublicInfluencerBrand | null }) => row.merchant)
      .filter((m): m is PublicInfluencerBrand => !!m);

    return {
      status: "success",
      data: brands,
      error: null,
    };
  } catch (error) {
    console.error("[getPublicInfluencerBrands] Unexpected error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}
