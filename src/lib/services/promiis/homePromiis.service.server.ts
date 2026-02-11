import { createSupabaseServerClient } from "@/lib/supabase/supabase.server";
import { SupabaseResponse, success, failure } from "@/config/types/supabase-response.type";
import { PostgrestError } from "@supabase/supabase-js";

export type HomePromii = {
  id: string;
  title: string;
  price_amount: number;
  price_currency: string;
  original_price_amount: number | null;
  discount_label: string | null;
  city: string;
  state: string;
  merchant_id: string;
  category_primary: string;
  created_at: string;
  merchant_name: string | null;
  photo_url: string | null;
};

function normalizeSupabaseError(err: any) {
  const e = err as PostgrestError & { code?: string; details?: string; hint?: string };
  return {
    error: e?.message ?? "Error desconocido",
    message: e?.details ?? e?.hint ?? undefined,
    code: (e as any)?.code ?? undefined,
  };
}

async function fetchPromiisWithPhotos(
  supabase: any,
  query: any
): Promise<HomePromii[]> {
  try {
    const { data, error } = await query;

    console.log("[fetchPromiisWithPhotos] Query result:", {
      hasData: !!data,
      count: data?.length,
      error: error?.message
    });

    if (error) {
      console.error("[fetchPromiisWithPhotos] Query error:", error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log("[fetchPromiisWithPhotos] No data returned");
      return [];
    }

    // Fetch photos and merchant info for each promii
    const promiisWithExtras = await Promise.all(
      data.map(async (promii: any) => {
        try {
          // Get first photo
          const { data: photos, error: photoError } = await supabase
            .from("promii_photos")
            .select("public_url")
            .eq("promii_id", promii.id)
            .order("sort_order", { ascending: true })
            .limit(1);

          console.log(`[fetchPromiisWithPhotos] Photo query for ${promii.id}:`, {
            hasPhotos: !!photos,
            photosLength: photos?.length,
            error: photoError?.message,
            firstPhoto: photos?.[0],
          });

          if (photoError) {
            console.error(`[fetchPromiisWithPhotos] Photo error for ${promii.id}:`, photoError);
          }

          const photo = photos && photos.length > 0 ? photos[0] : null;

          // Get merchant name
          const { data: merchants, error: merchantError } = await supabase
            .from("merchants")
            .select("business_name")
            .eq("id", promii.merchant_id)
            .limit(1);

          if (merchantError) {
            console.error(`[fetchPromiisWithPhotos] Merchant error for ${promii.merchant_id}:`, merchantError);
          }

          const merchant = merchants && merchants.length > 0 ? merchants[0] : null;

          const result = {
            ...promii,
            merchant_name: merchant?.business_name ?? null,
            photo_url: photo?.public_url ?? null,
          };

          if (photo?.public_url) {
            console.log(`[fetchPromiisWithPhotos] Photo URL for ${promii.id}:`, photo.public_url);
          } else {
            console.log(`[fetchPromiisWithPhotos] No photo for ${promii.id}`);
          }

          return result;
        } catch (err) {
          console.error("[fetchPromiisWithPhotos] Error fetching extras:", err);
          return {
            ...promii,
            merchant_name: null,
            photo_url: null,
          };
        }
      })
    );

    console.log("[fetchPromiisWithPhotos] Returning promiis:", promiisWithExtras.length);
    return promiisWithExtras;
  } catch (err) {
    console.error("[fetchPromiisWithPhotos] Unexpected error:", err);
    return [];
  }
}

/**
 * Fetch featured promiis (most recent active promiis)
 * During development, also includes paused promiis
 */
export async function fetchFeaturedPromiis(
  limit: number = 6
): Promise<SupabaseResponse<HomePromii[]>> {
  try {
    console.log("[fetchFeaturedPromiis] Starting...");
    console.log("[fetchFeaturedPromiis] Env check:", {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });

    const supabase = await createSupabaseServerClient();
    console.log("[fetchFeaturedPromiis] Supabase client created");

    const now = new Date().toISOString();
    console.log("[fetchFeaturedPromiis] Current time:", now);

    // First, try a simple count query to test connection
    const { count, error: countError } = await supabase
      .from("promiis")
      .select("*", { count: "exact", head: true });

    console.log("[fetchFeaturedPromiis] Total promiis in DB:", count, "Error:", countError?.message);

    const query = supabase
      .from("promiis")
      .select(`
        id,
        title,
        price_amount,
        price_currency,
        original_price_amount,
        discount_label,
        city,
        state,
        merchant_id,
        category_primary,
        created_at
      `)
      .in("status", ["active", "paused"]) // Include paused for development
      .lte("start_at", now)
      .gte("end_at", now)
      .order("created_at", { ascending: false })
      .limit(limit);

    const promiis = await fetchPromiisWithPhotos(supabase, query);
    console.log("[fetchFeaturedPromiis] Found promiis:", promiis.length);
    return success(promiis);
  } catch (err: any) {
    console.error("[fetchFeaturedPromiis] Error:", err);
    const n = normalizeSupabaseError(err);
    return failure(n.error, n.message, n.code);
  }
}

/**
 * Fetch trending promiis (could be based on view count, sales, etc.)
 * For now, we'll use most recent as a placeholder
 * During development, also includes paused promiis
 */
export async function fetchTrendingPromiis(
  limit: number = 8
): Promise<SupabaseResponse<HomePromii[]>> {
  try {
    const supabase = await createSupabaseServerClient();
    const now = new Date().toISOString();

    // Get promiis from the last 7 days, ordered by creation date
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const query = supabase
      .from("promiis")
      .select(`
        id,
        title,
        price_amount,
        price_currency,
        original_price_amount,
        discount_label,
        city,
        state,
        merchant_id,
        category_primary,
        created_at
      `)
      .in("status", ["active", "paused"]) // Include paused for development
      .lte("start_at", now)
      .gte("end_at", now)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(limit);

    const promiis = await fetchPromiisWithPhotos(supabase, query);
    console.log("[fetchTrendingPromiis] Found promiis:", promiis.length);
    return success(promiis);
  } catch (err: any) {
    console.error("[fetchTrendingPromiis] Error:", err);
    const n = normalizeSupabaseError(err);
    return failure(n.error, n.message, n.code);
  }
}

/**
 * Fetch popular promiis (all active promiis)
 * During development, also includes paused promiis
 */
export async function fetchPopularPromiis(
  limit: number = 8
): Promise<SupabaseResponse<HomePromii[]>> {
  try {
    const supabase = await createSupabaseServerClient();
    const now = new Date().toISOString();

    const query = supabase
      .from("promiis")
      .select(`
        id,
        title,
        price_amount,
        price_currency,
        original_price_amount,
        discount_label,
        city,
        state,
        merchant_id,
        category_primary,
        created_at
      `)
      .in("status", ["active", "paused"]) // Include paused for development
      .lte("start_at", now)
      .gte("end_at", now)
      .order("created_at", { ascending: false })
      .limit(limit);

    const promiis = await fetchPromiisWithPhotos(supabase, query);
    console.log("[fetchPopularPromiis] Found promiis:", promiis.length);
    return success(promiis);
  } catch (err: any) {
    console.error("[fetchPopularPromiis] Error:", err);
    const n = normalizeSupabaseError(err);
    return failure(n.error, n.message, n.code);
  }
}
