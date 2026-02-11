import { supabase } from "@/lib/supabase/supabase.client";
import {
  PromiiPurchase,
  CreatePurchasePayload,
  PurchaseWithDetails,
  PurchaseStatus,
} from "@/config/types/orders";
import { SupabaseResponse, success, failure } from "@/config/types/supabase-response.type";
import { PostgrestError } from "@supabase/supabase-js";

function normalizeSupabaseError(err: any) {
  const e = err as PostgrestError & { code?: string; details?: string; hint?: string };
  return {
    error: e?.message ?? "Error desconocido",
    message: e?.details ?? e?.hint ?? undefined,
    code: (e as any)?.code ?? undefined,
  };
}

/**
 * Create a new purchase order
 */
export async function createPurchase(
  payload: CreatePurchasePayload
): Promise<SupabaseResponse<PromiiPurchase>> {
  try {
    console.log("[createPurchase] Creating order:", payload);

    const { data, error } = await supabase
      .from("promii_purchases")
      .insert({
        ...payload,
        status: "pending_payment",
        payment_method: payload.payment_method || "transfer",
      })
      .select()
      .single();

    if (error) {
      console.error("[createPurchase] Error:", error);
      const n = normalizeSupabaseError(error);
      return failure(n.error, n.message, n.code);
    }

    console.log("[createPurchase] Order created:", data.id);
    return success(data, "Orden creada exitosamente");
  } catch (err: any) {
    console.error("[createPurchase] Unexpected error:", err);
    const n = normalizeSupabaseError(err);
    return failure(n.error, n.message, n.code);
  }
}

/**
 * Fetch purchases for a merchant (for dashboard)
 */
export async function fetchMerchantPurchases(params: {
  merchantId: string;
  status?: PurchaseStatus | PurchaseStatus[];
  page?: number;
  pageSize?: number;
}): Promise<
  SupabaseResponse<{
    purchases: PurchaseWithDetails[];
    total: number;
    page: number;
    pageSize: number;
  }>
> {
  try {
    const { merchantId, status, page = 1, pageSize = 10 } = params;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // First, get purchases
    let query = supabase
      .from("promii_purchases")
      .select("*", { count: "exact" })
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (Array.isArray(status) && status.length) {
      query = query.in("status", status);
    } else if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) {
      const n = normalizeSupabaseError(error);
      return failure(n.error, n.message, n.code);
    }

    if (!data || data.length === 0) {
      return success({
        purchases: [],
        total: 0,
        page,
        pageSize,
      });
    }

    // Get unique user IDs
    const userIds = [...new Set(data.map((p: any) => p.user_id))];

    // Fetch user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    // Create a map of user profiles
    const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    // Map the data to include user info
    const purchasesWithDetails: PurchaseWithDetails[] = data.map((purchase: any) => {
      const userProfile = profilesMap.get(purchase.user_id);
      return {
        ...purchase,
        user_email: userProfile?.email,
        user_name: userProfile?.first_name
          ? `${userProfile.first_name} ${userProfile.last_name || ""}`.trim()
          : undefined,
        promii_title: purchase.promii_snapshot_title,
      };
    });

    return success({
      purchases: purchasesWithDetails,
      total: count ?? 0,
      page,
      pageSize,
    });
  } catch (err: any) {
    const n = normalizeSupabaseError(err);
    return failure(n.error, n.message, n.code);
  }
}

/**
 * Mark payment as received (merchant action)
 * Changes status from pending_payment to pending_validation
 */
export async function markPaymentReceived(
  purchaseId: string,
  merchantId: string
): Promise<SupabaseResponse<PromiiPurchase>> {
  try {
    console.log("[markPaymentReceived] Marking payment as received:", purchaseId);

    const { data, error } = await supabase
      .from("promii_purchases")
      .update({
        status: "pending_validation",
        paid_at: new Date().toISOString(),
      })
      .eq("id", purchaseId)
      .eq("merchant_id", merchantId)
      .eq("status", "pending_payment")
      .select()
      .single();

    if (error) {
      console.error("[markPaymentReceived] Error:", error);
      const n = normalizeSupabaseError(error);
      return failure(n.error, n.message, n.code);
    }

    console.log("[markPaymentReceived] Payment marked as received");
    return success(data, "Comprobante marcado como recibido");
  } catch (err: any) {
    console.error("[markPaymentReceived] Unexpected error:", err);
    const n = normalizeSupabaseError(err);
    return failure(n.error, n.message, n.code);
  }
}

/**
 * Approve a purchase (merchant action)
 * Only works for orders in 'pending_validation' status
 */
export async function approvePurchase(
  purchaseId: string,
  merchantId: string
): Promise<SupabaseResponse<PromiiPurchase>> {
  try {
    console.log("[approvePurchase] Approving purchase:", purchaseId);

    // First, get current purchase to check status
    const { data: currentPurchase, error: fetchError } = await supabase
      .from("promii_purchases")
      .select("status")
      .eq("id", purchaseId)
      .eq("merchant_id", merchantId)
      .single();

    if (fetchError) {
      console.error("[approvePurchase] Error fetching purchase:", fetchError);
      const n = normalizeSupabaseError(fetchError);
      return failure(n.error, n.message, n.code);
    }

    // Check if order can be approved
    if (currentPurchase.status === "pending_payment") {
      return failure(
        "La orden aún no ha sido validada",
        "El cliente debe enviar el comprobante de pago primero. Una vez lo envíe, podrás aprobar la orden.",
        "INVALID_STATUS"
      );
    }

    if (currentPurchase.status !== "pending_validation") {
      return failure(
        "No se puede aprobar esta orden",
        `La orden está en estado: ${currentPurchase.status}. Solo se pueden aprobar órdenes en estado 'pending_validation'.`,
        "INVALID_STATUS"
      );
    }

    // Update to approved
    const { data, error } = await supabase
      .from("promii_purchases")
      .update({
        status: "approved",
        validated_at: new Date().toISOString(),
        validated_by: merchantId,
      })
      .eq("id", purchaseId)
      .eq("merchant_id", merchantId)
      .select()
      .single();

    if (error) {
      console.error("[approvePurchase] Error:", error);
      const n = normalizeSupabaseError(error);
      return failure(n.error, n.message, n.code);
    }

    console.log("[approvePurchase] Purchase approved, coupon:", data.coupon_code);
    return success(data, "Compra aprobada exitosamente");
  } catch (err: any) {
    console.error("[approvePurchase] Unexpected error:", err);
    const n = normalizeSupabaseError(err);
    return failure(n.error, n.message, n.code);
  }
}

/**
 * Reject a purchase (merchant action)
 */
export async function rejectPurchase(
  purchaseId: string,
  merchantId: string,
  reason: string
): Promise<SupabaseResponse<PromiiPurchase>> {
  try {
    console.log("[rejectPurchase] Rejecting purchase:", purchaseId);

    const { data, error } = await supabase
      .from("promii_purchases")
      .update({
        status: "rejected",
        rejection_reason: reason,
        validated_at: new Date().toISOString(),
        validated_by: merchantId,
      })
      .eq("id", purchaseId)
      .eq("merchant_id", merchantId)
      .select()
      .single();

    if (error) {
      console.error("[rejectPurchase] Error:", error);
      const n = normalizeSupabaseError(error);
      return failure(n.error, n.message, n.code);
    }

    console.log("[rejectPurchase] Purchase rejected");
    return success(data, "Compra rechazada");
  } catch (err: any) {
    console.error("[rejectPurchase] Unexpected error:", err);
    const n = normalizeSupabaseError(err);
    return failure(n.error, n.message, n.code);
  }
}

/**
 * Redeem a coupon (merchant action)
 * Changes status from approved to redeemed
 */
export async function redeemCoupon(
  purchaseId: string,
  merchantId: string,
  notes?: string
): Promise<SupabaseResponse<PromiiPurchase>> {
  try {
    console.log("[redeemCoupon] Redeeming coupon:", purchaseId);

    const { data, error } = await supabase
      .from("promii_purchases")
      .update({
        status: "redeemed",
        redeemed_at: new Date().toISOString(),
        redeemed_by: merchantId,
        redeem_notes: notes || null,
      })
      .eq("id", purchaseId)
      .eq("merchant_id", merchantId)
      .eq("status", "approved")
      .select()
      .single();

    if (error) {
      console.error("[redeemCoupon] Error:", error);
      const n = normalizeSupabaseError(error);
      return failure(n.error, n.message, n.code);
    }

    console.log("[redeemCoupon] Coupon redeemed successfully");
    return success(data, "Cupón canjeado exitosamente");
  } catch (err: any) {
    console.error("[redeemCoupon] Unexpected error:", err);
    const n = normalizeSupabaseError(err);
    return failure(n.error, n.message, n.code);
  }
}

/**
 * Update purchase with payment proof
 */
export async function updatePurchaseProof(
  purchaseId: string,
  userId: string,
  proofUrl: string,
  paymentReference?: string
): Promise<SupabaseResponse<PromiiPurchase>> {
  try {
    const { data, error } = await supabase
      .from("promii_purchases")
      .update({
        payment_proof_url: proofUrl,
        payment_reference: paymentReference,
        status: "pending_validation",
        paid_at: new Date().toISOString(),
      })
      .eq("id", purchaseId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      const n = normalizeSupabaseError(error);
      return failure(n.error, n.message, n.code);
    }

    return success(data, "Comprobante subido exitosamente");
  } catch (err: any) {
    const n = normalizeSupabaseError(err);
    return failure(n.error, n.message, n.code);
  }
}
