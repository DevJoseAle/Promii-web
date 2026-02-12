// ═══════════════════════════════════════════════════════════════
// CATEGORY SERVICE
// ═══════════════════════════════════════════════════════════════
// Obtiene promiis filtrados por categoría, subcategoría y otros filtros

import { supabase } from "@/lib/supabase/supabase.client";
import type { SupabaseResponse } from "@/config/types/supabase-response.type";
import type { Promii as PromiiCardType } from "@/components/ui/promii-card";

export type PromiiFilters = {
  category?: string; // category key
  subcategory?: string; // subcategory key
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  minDiscount?: number;
  state?: string;
  city?: string;
  sortBy?: "newest" | "price_low" | "price_high" | "rating" | "popular";
  limit?: number;
  offset?: number;
};

export type PaginatedPromiis = {
  promiis: PromiiCardType[];
  total: number;
  hasMore: boolean;
};

// ─────────────────────────────────────────────────────────────
// FETCH: Promiis por categoría con filtros
// ─────────────────────────────────────────────────────────────
export async function getPromiisByCategory(
  filters: PromiiFilters = {}
): Promise<SupabaseResponse<PaginatedPromiis>> {
  try {
    const {
      category,
      subcategory,
      minPrice,
      maxPrice,
      minRating,
      minDiscount,
      state,
      city,
      sortBy = "popular",
      limit = 12,
      offset = 0,
    } = filters;

    // Build query
    let query = supabase
      .from("promiis")
      .select(
        `
        id,
        title,
        price_amount,
        price_currency,
        original_price,
        discount_percentage,
        end_at,
        status,
        created_at,
        merchant:merchant_id (
          business_name,
          city,
          state
        )
      `,
        { count: "exact" }
      )
      .eq("status", "active")
      .gte("end_at", new Date().toISOString());

    // Filter by category
    if (category) {
      query = query.eq("category", category);
    }

    // Filter by subcategory
    if (subcategory) {
      query = query.eq("subcategory", subcategory);
    }

    // Filter by price range
    if (minPrice !== undefined) {
      query = query.gte("price_amount", minPrice);
    }
    if (maxPrice !== undefined) {
      query = query.lte("price_amount", maxPrice);
    }

    // Filter by discount
    if (minDiscount !== undefined) {
      query = query.gte("discount_percentage", minDiscount);
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "price_low":
        query = query.order("price_amount", { ascending: true });
        break;
      case "price_high":
        query = query.order("price_amount", { ascending: false });
        break;
      case "rating":
        // TODO: Add rating sort when rating system is implemented
        query = query.order("created_at", { ascending: false });
        break;
      case "popular":
      default:
        // Order by created_at for now (later can use purchase count)
        query = query.order("created_at", { ascending: false });
        break;
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: promiis, error, count } = await query;

    if (error) {
      console.error("[getPromiisByCategory] Error:", error);
      return {
        status: "error",
        data: null,
        error: error.message,
      };
    }

    if (!promiis) {
      return {
        status: "success",
        data: {
          promiis: [],
          total: 0,
          hasMore: false,
        },
        error: null,
      };
    }

    // Transform to PromiiCard format
    const transformedPromiis: PromiiCardType[] = await Promise.all(
      promiis.map(async (promii: any) => {
        // Get purchase count for "sold" field
        const { count: purchaseCount } = await supabase
          .from("promii_purchases")
          .select("*", { count: "exact", head: true })
          .eq("promii_id", promii.id);

        // Calculate discount percentage
        const discount = promii.original_price && promii.price_amount
          ? Math.round(((promii.original_price - promii.price_amount) / promii.original_price) * 100)
          : promii.discount_percentage || 0;

        return {
          id: promii.id,
          title: promii.title,
          merchant: promii.merchant?.business_name || "Sin nombre",
          location: promii.merchant
            ? `${promii.merchant.city || "N/A"} · ${promii.merchant.state || "N/A"}`
            : "Ubicación no disponible",
          rating: 4.5, // TODO: Implement real rating system
          sold: purchaseCount || 0,
          oldPrice: promii.original_price || undefined,
          price: promii.price_amount,
          discountPct: discount,
          tag: undefined, // Can add logic for tags later
        };
      })
    );

    // Filter by location (state/city) - done in memory since merchant is joined
    let filteredPromiis = transformedPromiis;
    if (state) {
      filteredPromiis = filteredPromiis.filter((p) =>
        p.location.toLowerCase().includes(state.toLowerCase())
      );
    }
    if (city) {
      filteredPromiis = filteredPromiis.filter((p) =>
        p.location.toLowerCase().includes(city.toLowerCase())
      );
    }

    // Filter by rating (in memory since rating is mocked for now)
    if (minRating !== undefined) {
      filteredPromiis = filteredPromiis.filter((p) => p.rating >= minRating);
    }

    const total = count || 0;
    const hasMore = offset + limit < total;

    return {
      status: "success",
      data: {
        promiis: filteredPromiis,
        total,
        hasMore,
      },
      error: null,
    };
  } catch (error) {
    console.error("[getPromiisByCategory] Unexpected error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// UTILS: Get stats for a category
// ─────────────────────────────────────────────────────────────
export async function getCategoryStats(category: string): Promise<{
  total: number;
  avgDiscount: number;
}> {
  const { count } = await supabase
    .from("promiis")
    .select("*", { count: "exact", head: true })
    .eq("category", category)
    .eq("status", "active")
    .gte("end_at", new Date().toISOString());

  const { data: promiis } = await supabase
    .from("promiis")
    .select("discount_percentage")
    .eq("category", category)
    .eq("status", "active")
    .gte("end_at", new Date().toISOString());

  const avgDiscount = promiis && promiis.length > 0
    ? promiis.reduce((sum, p) => sum + (p.discount_percentage || 0), 0) / promiis.length
    : 0;

  return {
    total: count || 0,
    avgDiscount: Math.round(avgDiscount),
  };
}
