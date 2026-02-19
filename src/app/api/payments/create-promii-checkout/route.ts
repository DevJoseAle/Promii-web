import { NextRequest, NextResponse } from "next/server";
import { stripeClient } from "@/lib/payments/stripe/stripe.client";
import { createSupabaseServerClient } from "@/lib/supabase/supabase.server";
import { createServiceRoleClient } from "@/lib/supabase/supabase.service-role";

type PromiiRow = {
  id: string;
  title: string;
  price_amount: number;
  price_currency: string;
  merchant_id: string;
  merchant: { business_name: string | null }[] | null;
};

type AssignmentRow = {
  influencer_id: string;
  promii_id: string;
  is_active: boolean;
  extra_discount_type: "percentage" | "fixed" | null;
  extra_discount_value: number | null;
};

export async function POST(request: NextRequest) {
  try {
    const supabaseAuth = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabaseAuth.auth.getUser();
    const user = authData?.user;

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const promiiId = body?.promiiId as string | undefined;
    const referralCodeRaw = body?.referralCode as string | null | undefined;
    if (!promiiId || typeof promiiId !== "string") {
      return NextResponse.json({ error: "Missing promiiId" }, { status: 400 });
    }
    const referralCode = typeof referralCodeRaw === "string" && referralCodeRaw.trim()
      ? referralCodeRaw.trim().toUpperCase()
      : null;

    const supabase = createServiceRoleClient();
    const { data: promii, error: promiiError } = await supabase
      .from("promiis")
      .select(
        `
        id,
        title,
        price_amount,
        price_currency,
        merchant_id,
        merchant:merchants!promiis_merchant_id_fkey(business_name)
      `
      )
      .eq("id", promiiId)
      .single();

    if (promiiError || !promii) {
      return NextResponse.json({ error: "Promii no encontrado" }, { status: 404 });
    }

    const promiiRow = promii as PromiiRow;
    const merchant = promiiRow.merchant?.[0] ?? null;
    const currency = (promiiRow.price_currency || "USD").toUpperCase();
    const priceAmount = Number(promiiRow.price_amount);
    if (!Number.isFinite(priceAmount) || priceAmount <= 0) {
      return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
    }
    if (currency !== "USD") {
      return NextResponse.json({ error: "Moneda no soportada" }, { status: 400 });
    }

    let finalAmount = priceAmount;
    let influencerId: string | null = null;
    let validReferralCode: string | null = null;

    if (referralCode) {
      const { data: assignment } = await supabase
        .from("promii_influencer_assignments")
        .select("influencer_id,promii_id,is_active,extra_discount_type,extra_discount_value")
        .eq("referral_code", referralCode)
        .maybeSingle();

      const assignmentRow = assignment as AssignmentRow | null;
      if (assignmentRow?.is_active && assignmentRow.promii_id === promiiRow.id) {
        validReferralCode = referralCode;
        influencerId = assignmentRow.influencer_id;

        if (assignmentRow.extra_discount_type && assignmentRow.extra_discount_value) {
          if (assignmentRow.extra_discount_type === "percentage") {
            const discountAmount = (priceAmount * assignmentRow.extra_discount_value) / 100;
            finalAmount = Math.max(0, priceAmount - discountAmount);
          } else {
            finalAmount = Math.max(0, priceAmount - assignmentRow.extra_discount_value);
          }
        }
      }
    }

    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
    }

    // Create purchase record (pending payment)
    const { data: purchase, error: purchaseError } = await supabase
      .from("promii_purchases")
      .insert({
        promii_id: promiiRow.id,
        merchant_id: promiiRow.merchant_id,
        user_id: user.id,
        influencer_id: influencerId,
        referral_code: validReferralCode,
        paid_amount: finalAmount,
        paid_currency: currency,
        payment_method: "stripe",
        status: "pending_payment",
        promii_snapshot_title: promiiRow.title,
        promii_snapshot_terms: null,
        promii_snapshot_price_amount: priceAmount,
        promii_snapshot_price_currency: currency,
      })
      .select("id")
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json(
        { error: "No se pudo crear la compra", purchaseError },
        { status: 500 }
      );
    }

    const envBaseUrl =
      process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
    const baseUrl =
      envBaseUrl.trim() ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://promii.shop");

    const successUrl = `${baseUrl}/p/${promiiRow.id}?payment=success&purchase=${purchase.id}`;
    const cancelUrl = `${baseUrl}/p/${promiiRow.id}?payment=cancelled`;

    const session = await stripeClient.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(finalAmount * 100),
            product_data: {
              name: promiiRow.title,
              description: merchant?.business_name || undefined,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: user.email ?? undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        payment_kind: "promii_purchase",
        purchase_id: purchase.id,
        promii_id: promiiRow.id,
        merchant_id: promiiRow.merchant_id,
        user_id: user.id,
        referral_code: validReferralCode ?? "",
        influencer_id: influencerId ?? "",
      },
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Error interno", details: message },
      { status: 500 }
    );
  }
}
