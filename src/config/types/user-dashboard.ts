// ═══════════════════════════════════════════════════════════════
// TIPOS PARA USER DASHBOARD
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// Tipos base de las tablas
// ─────────────────────────────────────────────────────────────
export type Purchase = {
  id: string;
  user_id: string;
  promii_id: string;
  merchant_id: string;
  status: "pending_payment" | "pending_validation" | "approved" | "redeemed" | "rejected" | "cancelled";
  coupon_code: string;
  coupon_expires_at: string | null;
  redeemed_at: string | null;
  rejection_reason: string | null;
  promii_snapshot_title: string;
  promii_snapshot_terms: string | null;
  paid_amount: number;
  paid_currency: string;
  created_at: string;
  updated_at: string;
};

export type Promii = {
  id: string;
  merchant_id: string;
  title: string;
  price_amount: number;
  price_currency: string;
  discount_label: string | null;
  city: string;
  state: string;
  status: string;
  end_at: string;
};

export type Merchant = {
  id: string;
  business_name: string;
  phone: string;
  whatsapp: string | null;
  address: string;
};

// ─────────────────────────────────────────────────────────────
// Purchase con relaciones completas
// ─────────────────────────────────────────────────────────────
export type PurchaseWithDetails = Purchase & {
  promii: Promii | null;
  merchant: Merchant | null;
};

// ─────────────────────────────────────────────────────────────
// Estados de cupón (derivados de purchase.status y expiración)
// ─────────────────────────────────────────────────────────────
export type CouponStatus =
  | "active" // approved y no expirado
  | "redeemed" // ya fue canjeado
  | "expired" // approved pero coupon_expires_at pasó
  | "pending"; // pending_payment o pending_validation

// ─────────────────────────────────────────────────────────────
// Datos procesados para mostrar un cupón
// ─────────────────────────────────────────────────────────────
export type CouponCard = {
  // Identificadores
  id: string;
  promiiId: string;
  merchantId: string;

  // Info del cupón
  couponCode: string;
  couponStatus: CouponStatus;
  expiresAt: string | null;
  daysRemaining: number | null; // null si ya expiró o no tiene fecha
  redeemedAt: string | null;

  // Info del promii (snapshot)
  promiiTitle: string;
  promiiTerms: string | null;
  promiiPhotoUrl: string | null;
  pricePaid: number;
  currency: string;

  // Info del merchant
  merchantName: string;
  merchantPhone: string;
  merchantWhatsapp: string | null;
  merchantAddress: string;

  // Metadata
  purchasedAt: string;
};

// ─────────────────────────────────────────────────────────────
// Filtros para historial de compras
// ─────────────────────────────────────────────────────────────
export type PurchaseStatusFilter =
  | "all"
  | "pending_payment"
  | "pending_validation"
  | "approved"
  | "redeemed"
  | "rejected"
  | "cancelled";

export type PurchaseFilters = {
  status?: PurchaseStatusFilter;
  search?: string; // buscar por título del promii
};

// ─────────────────────────────────────────────────────────────
// Datos para editar perfil de usuario
// ─────────────────────────────────────────────────────────────
export type UserProfileUpdate = {
  first_name: string;
  last_name: string;
  phone: string | null;
};
