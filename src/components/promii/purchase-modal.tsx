"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { COLORS } from "@/config/colors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ShoppingCart, User, Mail, Phone, MessageCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { supabase } from "@/lib/supabase/supabase.client";
import { createPurchase } from "@/lib/services/orders/orders.service";

type Props = {
  promiiId: string;
  promiiTitle: string;
  priceAmount: number;
  priceCurrency: string;
  merchantId: string;
  merchantName: string;
  isOpen: boolean;
  onClose: () => void;
  influencerCode?: string | null;
  phone: string
};

export function PurchaseModal({
  promiiId,
  promiiTitle,
  priceAmount,
  priceCurrency,
  merchantId,
  merchantName,
  isOpen,
  onClose,
  influencerCode,
  phone
}: Props) {
  const router = useRouter();
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Express signin state
  const [showExpressSignin, setShowExpressSignin] = useState(false);
  const [expressEmail, setExpressEmail] = useState("");
  const [expressPassword, setExpressPassword] = useState("");

  useEffect(() => {
    if (isOpen && !user) {
      setShowExpressSignin(true);
    } else {
      setShowExpressSignin(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleExpressSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: expressEmail,
        password: expressPassword,
      });

      if (error) {
        setError("Credenciales incorrectas. Intenta de nuevo.");
        return;
      }

      // Success - modal will detect user and show purchase flow
      setShowExpressSignin(false);
    } catch (err: any) {
      setError(err?.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user || !profile) {
      setError("Debes iniciar sesión para continuar");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("[PurchaseModal] Starting purchase flow");

      if (!phone) {
        setError("No hay número de WhatsApp del comercio configurado");
        return;
      }

      // 1. Create order in database
      console.log("[PurchaseModal] Creating order...");
      const orderResponse = await createPurchase({
        promii_id: promiiId,
        merchant_id: merchantId,
        user_id: user.id,
        influencer_id: influencerCode ? null : null, // TODO: Resolve influencer_id from code
        paid_amount: priceAmount,
        paid_currency: priceCurrency as any,
        payment_method: "transfer",
        promii_snapshot_title: promiiTitle,
        promii_snapshot_terms: null,
        promii_snapshot_price_amount: priceAmount,
        promii_snapshot_price_currency: priceCurrency as any,
      });

      if (orderResponse.status !== "success") {
        setError(orderResponse.error || "Error al crear la orden");
        return;
      }

      console.log("[PurchaseModal] Order created:", orderResponse.data?.id);

      // 2. Open WhatsApp
      const cleanPhone = phone.replace(/[\s\-()]/g, '');
      const orderRef = orderResponse.data?.id.slice(0, 8).toUpperCase();
      const message = `Hola! Quiero comprar:\n\n📦 ${promiiTitle}\n💰 ${priceCurrency} ${priceAmount.toFixed(2)}\n🏪 ${merchantName}\n📋 Orden: ${orderRef}\n\n¿Cómo procedo con el pago?`;
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

      console.log("[PurchaseModal] Opening WhatsApp...");
      window.open(whatsappUrl, "_blank");

      // 3. Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error("[PurchaseModal] Error:", err);
      setError(err?.message ?? "Error al procesar la compra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center size-8 rounded-full transition-colors duration-200"
          style={{
            backgroundColor: COLORS.background.tertiary,
            color: COLORS.text.secondary,
          }}
          aria-label="Cerrar"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: COLORS.border.light }}>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center size-12 rounded-xl"
              style={{ backgroundColor: COLORS.primary.lighter, color: COLORS.primary.main }}
            >
              <ShoppingCart className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: COLORS.text.primary }}>
                {showExpressSignin ? "Iniciar sesión" : "Finalizar compra"}
              </h3>
              <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                {showExpressSignin ? "Para continuar con tu compra" : promiiTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {showExpressSignin ? (
            <>
              <div
                className="rounded-lg border p-4"
                style={{
                  backgroundColor: COLORS.info.lighter,
                  borderColor: COLORS.info.light,
                }}
              >
                <p className="text-sm" style={{ color: COLORS.info.dark }}>
                  Inicia sesión para continuar con tu compra. Si no tienes cuenta, crea una rápidamente.
                </p>
              </div>

              <form onSubmit={handleExpressSignin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
                      style={{ color: COLORS.text.tertiary }}
                    />
                    <Input
                      type="email"
                      value={expressEmail}
                      onChange={(e) => setExpressEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="h-11 pl-11"
                      style={{
                        backgroundColor: COLORS.background.tertiary,
                        borderColor: COLORS.border.main,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                    Contraseña
                  </label>
                  <Input
                    type="password"
                    value={expressPassword}
                    onChange={(e) => setExpressPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-11"
                    style={{
                      backgroundColor: COLORS.background.tertiary,
                      borderColor: COLORS.border.main,
                    }}
                  />
                </div>

                {error && (
                  <div
                    className="flex items-start gap-2 rounded-lg border p-3"
                    style={{
                      backgroundColor: COLORS.error.lighter,
                      borderColor: COLORS.error.light,
                    }}
                  >
                    <AlertCircle className="size-5 shrink-0" style={{ color: COLORS.error.main }} />
                    <div className="text-sm" style={{ color: COLORS.error.dark }}>
                      {error}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 font-semibold"
                  style={{
                    background: loading
                      ? COLORS.text.tertiary
                      : `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
                    color: COLORS.text.inverse,
                  }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-5 animate-spin" />
                      Iniciando...
                    </span>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => router.push("/auth/sign-up")}
                    className="text-sm font-semibold transition-colors duration-200 hover:underline"
                    style={{ color: COLORS.primary.main }}
                  >
                    ¿No tienes cuenta? Regístrate aquí
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Price summary */}
              <div
                className="rounded-xl border p-4"
                style={{
                  backgroundColor: COLORS.background.secondary,
                  borderColor: COLORS.border.light,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: COLORS.text.secondary }}>
                    Precio
                  </span>
                  <span className="text-xl font-bold" style={{ color: COLORS.text.primary }}>
                    {priceCurrency} {priceAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: COLORS.text.secondary }}>
                    Comercio
                  </span>
                  <span className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                    {merchantName}
                  </span>
                </div>
                {influencerCode && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: COLORS.border.light }}>
                    <span className="text-sm" style={{ color: COLORS.text.secondary }}>
                      Código influencer
                    </span>
                    <span className="text-sm font-semibold" style={{ color: COLORS.primary.main }}>
                      {influencerCode}
                    </span>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div
                className="rounded-lg border p-4"
                style={{
                  backgroundColor: COLORS.warning.lighter,
                  borderColor: COLORS.warning.light,
                }}
              >
                <h4 className="text-sm font-bold mb-2" style={{ color: COLORS.warning.dark }}>
                  Proceso de compra
                </h4>
                <ol className="text-sm space-y-1" style={{ color: COLORS.warning.dark }}>
                  <li>1. Te redirigiremos a WhatsApp con los detalles</li>
                  <li>2. El comercio te dará los datos bancarios</li>
                  <li>3. Realizas la transferencia</li>
                  <li>4. Envías el comprobante por WhatsApp</li>
                  <li>5. El comercio valida y te da tu código único</li>
                </ol>
              </div>

              {error && (
                <div
                  className="flex items-start gap-2 rounded-lg border p-3"
                  style={{
                    backgroundColor: COLORS.error.lighter,
                    borderColor: COLORS.error.light,
                  }}
                >
                  <AlertCircle className="size-5 shrink-0" style={{ color: COLORS.error.main }} />
                  <div className="text-sm" style={{ color: COLORS.error.dark }}>
                    {error}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handlePurchase}
                  disabled={loading}
                  className="w-full h-12 font-semibold text-base"
                  style={{
                    background: loading
                      ? COLORS.text.tertiary
                      : "#25D366",
                    color: COLORS.text.inverse,
                  }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-5 animate-spin" />
                      Procesando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <MessageCircle className="size-5" />
                      Continuar por WhatsApp
                    </span>
                  )}
                </Button>

                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full h-11 font-semibold"
                  style={{
                    borderColor: COLORS.border.main,
                    color: COLORS.text.secondary,
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
