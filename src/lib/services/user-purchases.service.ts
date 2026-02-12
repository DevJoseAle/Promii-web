// ═══════════════════════════════════════════════════════════════
// USER PURCHASES SERVICE
// ═══════════════════════════════════════════════════════════════
// Servicio para gestionar compras de usuarios (cupones e historial)

import { supabase } from "../supabase/supabase.client";
import type { SupabaseResponse } from "@/config/types/supabase-response.type";
import type {
  PurchaseWithDetails,
  CouponCard,
  PurchaseFilters,
  CouponStatus,
} from "@/config/types/user-dashboard";

// ─────────────────────────────────────────────────────────────
// FETCH: Cupones activos del usuario (approved + redeemed)
// ─────────────────────────────────────────────────────────────
export async function getUserCoupons(
  userId: string
): Promise<SupabaseResponse<CouponCard[]>> {
  try {
    // Fetch purchases con status approved o redeemed
    const { data, error } = await supabase
      .from("promii_purchases")
      .select(
        `
        *,
        promii:promii_id (
          id,
          title,
          end_at
        ),
        merchant:merchant_id (
          id,
          business_name,
          phone,
          whatsapp,
          address_line,
          city,
          state
        )
      `
      )
      .eq("user_id", userId)
      .in("status", ["approved", "redeemed"])
      .order("created_at", { ascending: false });

    // Fetch first photo for each promii
    let photoUrls: Record<string, string> = {};
    if (data && data.length > 0) {
      const promiiIds = [...new Set(data.map((p: any) => p.promii_id))];
      const { data: photos } = await supabase
        .from("promii_photos")
        .select("promii_id, public_url, sort_order")
        .in("promii_id", promiiIds)
        .order("sort_order", { ascending: true });

      if (photos) {
        // Agrupar por promii_id y tomar solo la primera foto de cada uno
        const photosByPromii = photos.reduce((acc: any, photo: any) => {
          if (!acc[photo.promii_id]) {
            acc[photo.promii_id] = photo.public_url;
          }
          return acc;
        }, {});
        photoUrls = photosByPromii;
      }
    }

    if (error) {
      console.error("[getUserCoupons] Supabase error:", error);
      return {
        status: "error",
        data: null,
        error: error.message,
        code: error.code || "FETCH_ERROR",
      };
    }

    if (!data) {
      return {
        status: "success",
        data: [],
        error: null,
      };
    }

    // Transformar a CouponCard con lógica de estado
    const coupons: CouponCard[] = data.map((purchase: any) => {
      const now = new Date();
      const expiresAt = purchase.coupon_expires_at
        ? new Date(purchase.coupon_expires_at)
        : null;

      // Calcular días restantes
      let daysRemaining: number | null = null;
      if (expiresAt) {
        const diffTime = expiresAt.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      // Determinar estado del cupón
      let couponStatus: CouponStatus;
      if (purchase.status === "redeemed") {
        couponStatus = "redeemed";
      } else if (expiresAt && expiresAt < now) {
        couponStatus = "expired";
      } else {
        couponStatus = "active";
      }

      return {
        id: purchase.id,
        promiiId: purchase.promii_id,
        merchantId: purchase.merchant_id,
        couponCode: purchase.coupon_code || "",
        couponStatus,
        expiresAt: purchase.coupon_expires_at,
        daysRemaining: daysRemaining && daysRemaining > 0 ? daysRemaining : null,
        redeemedAt: purchase.redeemed_at,
        promiiTitle: purchase.promii_snapshot_title,
        promiiTerms: purchase.promii_snapshot_terms,
        promiiPhotoUrl: photoUrls[purchase.promii_id] || null,
        pricePaid: Number(purchase.paid_amount),
        currency: purchase.paid_currency,
        merchantName: purchase.merchant?.business_name || "Merchant",
        merchantPhone: purchase.merchant?.phone || "",
        merchantWhatsapp: purchase.merchant?.whatsapp || null,
        merchantAddress: `${purchase.merchant?.address_line || ""}, ${purchase.merchant?.city || ""}, ${purchase.merchant?.state || ""}`.trim(),
        purchasedAt: purchase.created_at,
      };
    });

    return {
      status: "success",
      data: coupons,
      error: null,
    };
  } catch (error) {
    console.error("[getUserCoupons] Unexpected error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// FETCH: Historial completo de compras con filtros
// ─────────────────────────────────────────────────────────────
export async function fetchUserPurchases(
  userId: string,
  filters?: PurchaseFilters
): Promise<SupabaseResponse<PurchaseWithDetails[]>> {
  try {
    let query = supabase
      .from("promii_purchases")
      .select(
        `
        *,
        promii:promii_id (
          id,
          title,
          end_at,
          category_primary,
          state,
          city
        ),
        merchant:merchant_id (
          id,
          business_name,
          phone,
          whatsapp,
          address_line,
          city,
          state
        )
      `
      )
      .eq("user_id", userId);

    // Aplicar filtro de estado
    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    // Ordenar por fecha más reciente
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("[fetchUserPurchases] Supabase error:", error);
      return {
        status: "error",
        data: null,
        error: error.message,
        code: error.code || "FETCH_ERROR",
      };
    }

    if (!data) {
      return {
        status: "success",
        data: [],
        error: null,
      };
    }

    // Filtrar por búsqueda de texto (cliente-side para simplificar)
    let purchases = data as PurchaseWithDetails[];

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      purchases = purchases.filter((p) =>
        p.promii_snapshot_title.toLowerCase().includes(searchLower)
      );
    }

    return {
      status: "success",
      data: purchases,
      error: null,
    };
  } catch (error) {
    console.error("[fetchUserPurchases] Unexpected error:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : String(error),
      code: "UNEXPECTED_ERROR",
    };
  }
}
