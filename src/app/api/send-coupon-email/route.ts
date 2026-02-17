import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userEmail,
      userName,
      couponCode,
      promiiTitle,
      promiiDiscount,
      promiiPrice,
      merchantName,
      promiiId,
    } = body;

    // Validar datos requeridos
    if (!userEmail || !couponCode || !promiiTitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Enviar email
    const { data, error } = await resend.emails.send({
      from: "Promii <noreply@promii.shop>",
      to: userEmail,
      subject: `🎉 ¡Tu Promii está listo! - ${promiiTitle}`,
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
                  Hola${userName ? ` ${userName}` : ""},
                </p>

                <p>
                  ¡Excelente noticia! <strong>${merchantName || "El merchant"}</strong> ha aprobado tu compra.
                  Tu cupón está listo para ser canjeado.
                </p>

                <!-- Coupon Box -->
                <div class="coupon-box">
                  <div class="coupon-label">Tu Código de Cupón</div>
                  <div class="coupon-code">${couponCode}</div>
                  <div style="color: rgba(255, 255, 255, 0.9); font-size: 14px; margin-top: 10px;">
                    Muestra este código al merchant para canjear
                  </div>
                </div>

                <!-- Promii Details -->
                <div class="promii-details">
                  <h3>${promiiTitle}</h3>
                  ${promiiDiscount ? `
                    <div class="detail-row">
                      <span class="detail-label">Descuento:</span>
                      <span class="detail-value">${promiiDiscount}</span>
                    </div>
                  ` : ""}
                  ${promiiPrice ? `
                    <div class="detail-row">
                      <span class="detail-label">Precio Final:</span>
                      <span class="detail-value">$${promiiPrice}</span>
                    </div>
                  ` : ""}
                  <div class="detail-row">
                    <span class="detail-label">Comercio:</span>
                    <span class="detail-value">${merchantName || "N/A"}</span>
                  </div>
                </div>

                <!-- Instructions -->
                <div class="instructions">
                  <h3>📋 Cómo Canjear tu Promii</h3>
                  <ol>
                    <li>Visita el comercio <strong>${merchantName || "indicado"}</strong></li>
                    <li>Muestra este código: <strong>${couponCode}</strong></li>
                    <li>El merchant validará tu cupón y aplicará el descuento</li>
                    <li>¡Disfruta de tu Promii!</li>
                  </ol>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center;">
                  <a href="https://promii.shop/profile?tab=coupons" class="cta-button">
                    Ver Mis Cupones
                  </a>
                </div>

                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                  💡 <strong>Tip:</strong> Guarda este email o toma una captura del código para tenerlo a mano cuando vayas a canjear.
                </p>
              </div>

              <!-- Footer -->
              <div class="footer">
                <p style="margin: 10px 0;">
                  <strong>Promii</strong> - Descuentos y promociones exclusivas
                </p>
                <p style="margin: 10px 0;">
                  <a href="https://promii.shop">promii.shop</a> |
                  <a href="https://promii.shop/terms">Términos</a> |
                  <a href="https://promii.shop/faq">FAQ</a>
                </p>
                <p style="margin: 10px 0; color: #9ca3af; font-size: 12px;">
                  Este es un email automático de confirmación de tu Promii.
                  Si tienes dudas, contacta al merchant directamente.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("[send-coupon-email] Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email", details: error },
        { status: 500 }
      );
    }

    console.log("[send-coupon-email] Email sent successfully:", data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[send-coupon-email] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
