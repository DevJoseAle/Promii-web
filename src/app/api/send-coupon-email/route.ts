import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServerClient } from "@/lib/supabase/supabase.server";
import { createServiceRoleClient } from "@/lib/supabase/supabase.service-role";

const resend = new Resend(process.env.RESEND_API_KEY);

type OrderRow = {
  id: string;
  user_id: string;
  merchant_id: string;
  coupon_code: string | null;
  promii_snapshot_title: string | null;
  promii_snapshot_discount_label: string | null;
  final_price: number | null;
  paid_currency: string | null;
  user: {
    email: string | null;
    first_name: string | null;
  }[] | null;
  merchant: {
    business_name: string | null;
  }[] | null;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: NextRequest) {
  try {
    // 1) Auth required (session cookie)
    const supabaseAuth = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabaseAuth.auth.getUser();
    const caller = authData?.user;

    if (authError || !caller) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 2) Input contract: only orderId or purchaseId
    const body = await request.json();
    const orderId = (body?.orderId || body?.purchaseId) as string | undefined;
    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // 3) Fetch order with service role
    const supabase = createServiceRoleClient();
    const { data: order, error: orderError } = await supabase
      .from("promii_purchases")
      .select(
        `
        id,
        user_id,
        merchant_id,
        coupon_code,
        promii_snapshot_title,
        promii_snapshot_discount_label,
        final_price,
        paid_currency,
        user:profiles!promii_purchases_user_id_fkey(email, first_name),
        merchant:merchants!promii_purchases_merchant_id_fkey(business_name)
      `
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.warn("[send-coupon-email] Order not found");
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 4) Authorization: purchaser OR merchant OR admin
    if (caller.id !== order.user_id && caller.id !== order.merchant_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", caller.id)
        .single();

      if (!profile || profile.role !== "admin") {
        console.warn("[send-coupon-email] Forbidden");
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const orderRow = order as OrderRow;
    const user = orderRow.user?.[0] ?? null;
    const merchant = orderRow.merchant?.[0] ?? null;
    const userEmail = user?.email || "";
    const userName = user?.first_name || "";
    const couponCode = orderRow.coupon_code || "";
    const promiiTitle = orderRow.promii_snapshot_title || "";
    const promiiDiscount = orderRow.promii_snapshot_discount_label || "";
    const promiiPrice = orderRow.final_price ?? null;
    const currency = orderRow.paid_currency || "USD";
    const merchantName = merchant?.business_name || "";

    if (!userEmail || !couponCode || !promiiTitle) {
      console.warn("[send-coupon-email] Missing required order fields");
      return NextResponse.json(
        { error: "Missing required order fields" },
        { status: 400 }
      );
    }

    const safeUserName = escapeHtml(userName);
    const safeCouponCode = escapeHtml(couponCode);
    const safePromiiTitle = escapeHtml(promiiTitle);
    const safeMerchantName = escapeHtml(merchantName || "El merchant");
    const safeDiscount = escapeHtml(promiiDiscount || "");
    const safePrice =
      promiiPrice !== null && Number.isFinite(promiiPrice)
        ? `${currency} ${Number(promiiPrice).toFixed(2)}`
        : "";

    // Enviar email
    const { data, error } = await resend.emails.send({
      from: "Promii <noreply@promii.shop>",
      to: userEmail,
      subject: `🎉 ¡Tu Promii está listo! - ${safePromiiTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f5f5f5;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
              }
              .header {
                background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
                padding: 40px 20px;
                text-align: center;
              }
              .header h1 {
                color: #ffffff;
                margin: 0;
                font-size: 28px;
              }
              .content {
                padding: 40px 30px;
              }
              .greeting {
                font-size: 18px;
                color: #333;
                margin-bottom: 20px;
              }
              .coupon-box {
                background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
                box-shadow: 0 4px 6px rgba(139, 92, 246, 0.1);
              }
              .coupon-label {
                color: rgba(255, 255, 255, 0.9);
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 10px;
              }
              .coupon-code {
                background-color: #ffffff;
                color: #8B5CF6;
                font-size: 32px;
                font-weight: bold;
                padding: 15px 30px;
                border-radius: 8px;
                letter-spacing: 3px;
                margin: 15px 0;
                font-family: 'Courier New', monospace;
              }
              .promii-details {
                background-color: #f9fafb;
                border-left: 4px solid #8B5CF6;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .promii-details h3 {
                margin-top: 0;
                color: #8B5CF6;
                font-size: 20px;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #e5e7eb;
              }
              .detail-row:last-child {
                border-bottom: none;
              }
              .detail-label {
                color: #6b7280;
                font-weight: 500;
              }
              .detail-value {
                color: #111827;
                font-weight: 600;
              }
              .instructions {
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .instructions h3 {
                margin-top: 0;
                color: #92400e;
                font-size: 18px;
              }
              .instructions ol {
                margin: 10px 0;
                padding-left: 20px;
                color: #78350f;
              }
              .instructions li {
                margin: 8px 0;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
                color: #ffffff;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
                transition: transform 0.2s;
              }
              .footer {
                background-color: #f9fafb;
                padding: 30px;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
              }
              .footer a {
                color: #8B5CF6;
                text-decoration: none;
              }
              @media only screen and (max-width: 600px) {
                .content {
                  padding: 30px 20px;
                }
                .coupon-code {
                  font-size: 24px;
                  padding: 12px 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <!-- Header -->
              <div class="header">
                <h1>🎉 ¡Tu Promii está Aprobado!</h1>
              </div>

              <!-- Content -->
              <div class="content">
                <p class="greeting">
                  Hola${safeUserName ? ` ${safeUserName}` : ""},
                </p>

                <p>
                  ¡Excelente noticia! <strong>${safeMerchantName}</strong> ha aprobado tu compra.
                  Tu cupón está listo para ser canjeado.
                </p>

                <!-- Coupon Box -->
                <div class="coupon-box">
                  <div class="coupon-label">Tu Código de Cupón</div>
                  <div class="coupon-code">${safeCouponCode}</div>
                </div>

                <!-- Promii Details -->
                <div class="promii-details">
                  <h3>${safePromiiTitle}</h3>
                  <div class="detail-row">
                    <span class="detail-label">Descuento</span>
                    <span class="detail-value">${safeDiscount || "Promoción especial"}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Precio Final</span>
                    <span class="detail-value">${safePrice || "Ver detalles"}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Comercio</span>
                    <span class="detail-value">${safeMerchantName || "Ver detalles"}</span>
                  </div>
                </div>

                <!-- Instructions -->
                <div class="instructions">
                  <h3>¿Cómo canjear tu Promii?</h3>
                  <ol>
                    <li>Presenta este correo o el código del cupón al comercio</li>
                    <li>El comercio verificará tu código</li>
                    <li>¡Disfruta tu promoción!</li>
                  </ol>
                </div>

                <p>
                  Si tienes alguna pregunta, no dudes en contactarnos.
                </p>
              </div>

              <!-- Footer -->
              <div class="footer">
                <p>Gracias por usar Promii</p>
                <p>© 2026 Promii. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.warn("[send-coupon-email] Resend error");
      return NextResponse.json({ error: "Email send failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.warn("[send-coupon-email] Unexpected error");
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
