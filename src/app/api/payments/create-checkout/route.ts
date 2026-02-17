import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/supabase.server";
import { getPaymentProvider } from "@/lib/payments";
import type { PlanId, BillingType } from "@/lib/payments";

export async function POST(request: NextRequest) {
  try {
    // ── 1. Autenticar al merchant ──────────────────────────────────────────────
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // ── 2. Obtener datos del merchant desde la tabla merchants ─────────────────
    const { data: merchant, error: merchantError } = await supabase
      .from("merchants")
      .select("id, contact_email, verification_status")
      .eq("id", user.id)
      .single();

    if (merchantError || !merchant) {
      return NextResponse.json(
        { error: "Merchant no encontrado" },
        { status: 404 }
      );
    }

    if (merchant.verification_status !== "approved") {
      return NextResponse.json(
        { error: "Tu cuenta debe estar aprobada para suscribirte" },
        { status: 403 }
      );
    }

    // ── 3. Validar body ────────────────────────────────────────────────────────
    const body = await request.json();
    const { plan, billingType } = body as {
      plan: PlanId;
      billingType: BillingType;
    };

    const validPlans: PlanId[] = ["founder", "starter", "growth", "pro"];
    const validBillingTypes: BillingType[] = ["recurring", "one_time"];

    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
    }
    if (!validBillingTypes.includes(billingType)) {
      return NextResponse.json(
        { error: "Tipo de facturación inválido" },
        { status: 400 }
      );
    }

    // ── 4. Construir URLs de retorno ───────────────────────────────────────────
    const origin = request.headers.get("origin") ?? "https://promii.shop";
    const successUrl = `${origin}/business/dashboard?payment=success&plan=${plan}`;
    const cancelUrl = `${origin}/business/dashboard/plans?payment=cancelled`;

    // ── 5. Crear sesión de checkout ────────────────────────────────────────────
    const provider = getPaymentProvider("stripe");
    const { checkoutUrl } = await provider.createCheckout({
      plan,
      billingType,
      merchantId: merchant.id,
      merchantEmail: merchant.contact_email,
      successUrl,
      cancelUrl,
    });

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Error interno", details: message },
      { status: 500 }
    );
  }
}
