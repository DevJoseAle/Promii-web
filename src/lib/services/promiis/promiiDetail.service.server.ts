import { createSupabaseServerClient } from "@/lib/supabase/supabase.server";
import { SupabaseResponse, success, failure } from "@/config/types/supabase-response.type";
import { PromiiStatus } from "@/config/types/promiis";
import { PostgrestError } from "@supabase/supabase-js";

export type PromiiPhoto = {
  id: string;
  storage_path: string;
  public_url: string;
  sort_order: number;
};

export type MerchantInfo = {
  id: string;
  business_name: string;
  logo_url: string | null;
  phone: string;
};

export type PromiiDetail = {
  id: string;
  merchant_id: string;
  status: PromiiStatus;

  title: string;
  description: string;
  terms: string;

  category_primary: string;
  category_secondary: string | null;

  price_amount: number;
  price_currency: string;
  original_price_amount: number | null;
  discount_label: string | null;

  start_at: string;
  end_at: string;

  max_redemptions: number | null;
  allow_multiple_per_user: boolean;
  max_units_per_user: number | null;

  state: string;
  city: string;
  zone: string | null;
  address_line: string | null;

  geo_lat: number | null;
  geo_lng: number | null;

  allow_influencers: boolean;
  default_influencer_id: string | null;

  created_at: string;
  updated_at: string;

  // Related data
  photos: PromiiPhoto[];
  merchant: MerchantInfo | null;
};

function normalizeSupabaseError(err: any) {
  const e = err as PostgrestError & { code?: string; details?: string; hint?: string };
  return {
    error: e?.message ?? "Error desconocido",
    message: e?.details ?? e?.hint ?? undefined,
    code: (e as any)?.code ?? undefined,
  };
}

export async function fetchPromiiDetail(
  promiiId: string
): Promise<SupabaseResponse<PromiiDetail | null>> {
  try {
    console.log("[fetchPromiiDetail] Fetching promii:", promiiId);
    const supabase = await createSupabaseServerClient();

    // Fetch promii
    const { data: promii, error: promiiError } = await supabase
      .from("promiis")
      .select("*")
      .eq("id", promiiId)
      .single();

    console.log("[fetchPromiiDetail] Query result:", {
      hasData: !!promii,
      error: promiiError?.message,
    });

    if (promiiError) {
      console.error("[fetchPromiiDetail] Error:", promiiError);
      const n = normalizeSupabaseError(promiiError);
      return failure(n.error, n.message, n.code);
    }

    if (!promii) {
      console.log("[fetchPromiiDetail] Promii not found");
      return success(null);
    }

    console.log("[fetchPromiiDetail] Found promii:", promii.title);

    // Fetch photos
    const { data: photos } = await supabase
      .from("promii_photos")
      .select("id, storage_path, public_url, sort_order")
      .eq("promii_id", promiiId)
      .order("sort_order", { ascending: true });

    // Fetch merchant info
    console.log("[fetchPromiiDetail] Fetching merchant for ID:", promii.merchant_id);

    const { data: merchant, error: merchantError } = await supabase
      .from("merchants")
      .select("id, business_name, logo_url, phone")
      .eq("id", promii.merchant_id)
      .single();

    console.log("[fetchPromiiDetail] Merchant query result:", {
      hasMerchant: !!merchant,
      merchantName: merchant?.business_name,
      phone: merchant?.phone,
      error: merchantError?.message,
    });

    if (merchantError) {
      console.error("[fetchPromiiDetail] Merchant fetch error:", merchantError);
    }

    return success({
      ...promii,
      photos: photos ?? [],
      merchant: merchant ?? null,
    });
  } catch (err: any) {
    const n = normalizeSupabaseError(err);
    return failure(n.error, n.message, n.code);
  }
}

export async function fetchRelatedPromiis(params: {
  categoryPrimary: string;
  excludeId: string;
  limit?: number;
}): Promise<SupabaseResponse<any[]>> {
  try {
    const { categoryPrimary, excludeId, limit = 4 } = params;
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("promiis")
      .select(`
        id,
        title,
        price_amount,
        price_currency,
        original_price_amount,
        discount_label,
        city,
        state
      `)
      .eq("status", "active")
      .eq("category_primary", categoryPrimary)
      .neq("id", excludeId)
      .lte("start_at", new Date().toISOString())
      .gte("end_at", new Date().toISOString())
      .limit(limit);

    if (error) {
      const n = normalizeSupabaseError(error);
      return failure(n.error, n.message, n.code);
    }

    // Fetch first photo for each promii
    const promiisWithPhotos = await Promise.all(
      (data ?? []).map(async (promii) => {
        const { data: photo } = await supabase
          .from("promii_photos")
          .select("public_url")
          .eq("promii_id", promii.id)
          .order("sort_order", { ascending: true })
          .limit(1)
          .single();

        return {
          ...promii,
          photo_url: photo?.public_url ?? null,
        };
      })
    );

    return success(promiisWithPhotos);
  } catch (err: any) {
    const n = normalizeSupabaseError(err);
    return failure(n.error, n.message, n.code);
  }
}
