export type PromiiStatus = "draft" | "active" | "paused" | "expired";

export type PromiiRow = {
  id: string;
  merchant_id: string;
  status: PromiiStatus;
  title: string;
  price_amount: number;
  price_currency: string;
  discount_label: string | null;
  start_at: string;
  end_at: string;
  state: string;
  city: string;
  created_at: string;
};

export type PromiiCreatePayload = {
  merchant_id: string;
  status: PromiiStatus;

  title: string;
  description: string;
  terms: string;

  category_primary: string; // enum promii_category
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
};
