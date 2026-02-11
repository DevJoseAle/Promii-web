export type PurchaseStatus =
  | "pending_payment"
  | "pending_validation"
  | "approved"
  | "rejected"
  | "cancelled"
  | "redeemed";

export type PaymentMethod = "pago_movil" | "transfer" | "crypto" | "cash" | "other";

export type CurrencyCode = "USD" | "VES" | "USDT";

export type PromiiPurchase = {
  id: string;
  promii_id: string;
  merchant_id: string;
  user_id: string;
  influencer_id: string | null;
  status: PurchaseStatus;
  paid_amount: number;
  paid_currency: CurrencyCode;
  payment_method: PaymentMethod;
  payment_reference: string | null;
  payment_proof_url: string | null;
  paid_at: string | null;
  validated_at: string | null;
  validated_by: string | null;
  rejection_reason: string | null;
  coupon_code: string | null;
  coupon_expires_at: string | null;
  redeemed_at: string | null;
  redeemed_by: string | null;
  redeem_notes: string | null;
  promii_snapshot_title: string;
  promii_snapshot_terms: string | null;
  promii_snapshot_price_amount: number;
  promii_snapshot_price_currency: CurrencyCode;
  created_at: string;
  updated_at: string;
};

export type CreatePurchasePayload = {
  promii_id: string;
  merchant_id: string;
  user_id: string;
  influencer_id?: string | null;
  paid_amount: number;
  paid_currency: CurrencyCode;
  payment_method: PaymentMethod;
  promii_snapshot_title: string;
  promii_snapshot_terms: string | null;
  promii_snapshot_price_amount: number;
  promii_snapshot_price_currency: CurrencyCode;
};

export type PurchaseWithDetails = PromiiPurchase & {
  user_email?: string;
  user_name?: string;
  promii_title?: string;
};
