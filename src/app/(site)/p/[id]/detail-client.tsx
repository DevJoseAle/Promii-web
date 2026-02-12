"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COLORS } from "@/config/colors";
import { ShoppingCart, Share2, CheckCircle, XCircle, Tag, Loader2 } from "lucide-react";
import { PurchaseModal } from "@/components/promii/purchase-modal";
import { FavoriteButton } from "@/components/promii/favorite-button";
import { ShareButtons } from "@/components/promii/share-buttons";
import { trackReferralVisit, getAssignmentByReferralCode, type Assignment } from "@/lib/services/influencer";

type Props = {
  promiiId: string;
  promiiTitle: string;
  priceAmount: number;
  priceCurrency: string;
  merchantId: string;
  merchantName: string;
  influencerCode: string | null;
  isExpired: boolean;
  notStarted: boolean;
  phone: string;
};

export function PromiiDetailClient({
  promiiId,
  promiiTitle,
  priceAmount,
  priceCurrency,
  merchantId,
  merchantName,
  influencerCode,
  isExpired,
  notStarted,
  phone,
}: Props) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showShareButtons, setShowShareButtons] = useState(false);

  // Referral code state
  const [manualCode, setManualCode] = useState("");
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeStatus, setCodeStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [validatedCode, setValidatedCode] = useState<string | null>(influencerCode);
  const [codeError, setCodeError] = useState<string>("");
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  console.log("[PromiiDetailClient] Phone received:", phone);

  // Calcular precio con descuento extra
  const finalPrice = assignment?.extra_discount_type && assignment?.extra_discount_value
    ? (() => {
        if (assignment.extra_discount_type === "percentage") {
          // Descuento porcentual adicional
          const discountAmount = (priceAmount * assignment.extra_discount_value) / 100;
          return Math.max(0, priceAmount - discountAmount);
        } else {
          // Descuento fijo adicional
          return Math.max(0, priceAmount - assignment.extra_discount_value);
        }
      })()
    : priceAmount;

  // Track referral visit when page loads with influencer code
  useEffect(() => {
    if (influencerCode) {
      console.log("[PromiiDetailClient] Tracking referral visit:", influencerCode);
      setValidatedCode(influencerCode);
      setCodeStatus("valid");

      // Load assignment data to get extra discount
      getAssignmentByReferralCode(influencerCode).then((assignmentData) => {
        if (assignmentData) {
          setAssignment(assignmentData);
        }
      });

      trackReferralVisit(influencerCode, promiiId).then((success) => {
        if (success) {
          console.log("[PromiiDetailClient] Referral visit tracked successfully");
        } else {
          console.warn("[PromiiDetailClient] Failed to track referral visit");
        }
      });
    }
  }, [influencerCode, promiiId]);

  // Validate manual code
  async function validateCode() {
    console.log("[validateCode] Starting validation...");
    const code = manualCode.trim().toUpperCase();
    console.log("[validateCode] Code to validate:", code);

    if (!code) {
      setCodeError("Ingresa un código");
      console.log("[validateCode] Empty code");
      return;
    }

    if (code.length < 8 || code.length > 17) {
      setCodeError("El código debe tener entre 8 y 17 caracteres");
      setCodeStatus("invalid");
      console.log("[validateCode] Invalid length:", code.length);
      return;
    }

    setValidatingCode(true);
    setCodeError("");
    setCodeStatus("idle");

    try {
      console.log("[validateCode] Calling getAssignmentByReferralCode...");
      const assignment = await getAssignmentByReferralCode(code);
      console.log("[validateCode] Assignment result:", assignment);

      if (!assignment) {
        setCodeStatus("invalid");
        setCodeError("Código no encontrado");
        console.log("[validateCode] Assignment not found");
        return;
      }

      // Verificar que el código es para este promii
      if (assignment.promii_id !== promiiId) {
        setCodeStatus("invalid");
        setCodeError("Este código no es válido para este Promii");
        console.log("[validateCode] Wrong promii. Expected:", promiiId, "Got:", assignment.promii_id);
        return;
      }

      // Verificar que está activo
      if (!assignment.is_active) {
        setCodeStatus("invalid");
        setCodeError("Este código ya no está activo");
        console.log("[validateCode] Assignment not active");
        return;
      }

      // Código válido
      console.log("[validateCode] Code is valid! Setting state...");
      setCodeStatus("valid");
      setValidatedCode(code);
      setAssignment(assignment);
      setCodeError("");
      setManualCode(""); // Limpiar input

      // Track visit
      console.log("[validateCode] Tracking visit...");
      trackReferralVisit(code, promiiId);
      console.log("[validateCode] Validation complete!");
    } catch (error) {
      console.error("[validateCode] Error:", error);
      setCodeStatus("invalid");
      setCodeError("Error al validar código");
    } finally {
      setValidatingCode(false);
    }
  }

  const canPurchase = !isExpired && !notStarted;

  return (
    <>
      {/* Action buttons */}
      <div className="space-y-3">
        <Button
          onClick={() => setShowPurchaseModal(true)}
          disabled={!canPurchase}
          className="w-full h-12 font-semibold text-base transition-all duration-200 hover:scale-105 disabled:scale-100"
          style={{
            background: canPurchase
              ? `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`
              : COLORS.text.tertiary,
            color: COLORS.text.inverse,
          }}
        >
          {isExpired ? (
            "Promii expirado"
          ) : notStarted ? (
            "Aún no disponible"
          ) : (
            <>
              <ShoppingCart className="size-5 mr-2" />
              Comprar ahora
            </>
          )}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <FavoriteButton promiiId={promiiId} />
          <Button
            onClick={() => setShowShareButtons(!showShareButtons)}
            variant="outline"
            className="h-12 font-semibold transition-all duration-200 hover:scale-105"
            style={{
              borderColor: COLORS.border.main,
              color: COLORS.text.secondary,
            }}
          >
            <Share2 className="size-5 mr-2" />
            Compartir
          </Button>
        </div>

        {showShareButtons && (
          <div
            className="rounded-lg border p-4"
            style={{
              backgroundColor: COLORS.background.secondary,
              borderColor: COLORS.border.light,
            }}
          >
            <ShareButtons promiiId={promiiId} promiiTitle={promiiTitle} />
          </div>
        )}
      </div>

      {/* Influencer code section */}
      <div className="mt-6 space-y-3">
        {validatedCode ? (
          // Código validado (desde URL o manual)
          <>
            <div
              className="rounded-lg border p-4"
              style={{
                backgroundColor: COLORS.success.lighter,
                borderColor: COLORS.success.light,
              }}
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="size-5 mt-0.5 shrink-0" style={{ color: COLORS.success.main }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold mb-1" style={{ color: COLORS.success.dark }}>
                    Código de influencer aplicado ✓
                  </div>
                  <div className="text-xs font-mono font-bold" style={{ color: COLORS.success.main }}>
                    {validatedCode}
                  </div>
                  {assignment?.extra_discount_type && assignment?.extra_discount_value ? (
                    <div className="mt-2 pt-2 border-t" style={{ borderColor: COLORS.success.main + "40" }}>
                      <div className="text-xs font-semibold" style={{ color: COLORS.success.dark }}>
                        Descuento extra aplicado:
                      </div>
                      <div className="text-sm font-bold mt-1" style={{ color: COLORS.success.main }}>
                        {assignment.extra_discount_type === "percentage"
                          ? `+${assignment.extra_discount_value}% OFF adicional`
                          : `${priceCurrency} ${assignment.extra_discount_value.toFixed(2)} de descuento extra`
                        }
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-xs line-through" style={{ color: COLORS.text.tertiary }}>
                          {priceCurrency} {priceAmount.toFixed(2)}
                        </span>
                        <span className="text-xl font-bold" style={{ color: COLORS.success.main }}>
                          {priceCurrency} {finalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs mt-1" style={{ color: COLORS.success.dark }}>
                      Código validado correctamente
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          // Input para código manual
          <div
            className="rounded-lg border p-4"
            style={{
              backgroundColor: COLORS.background.secondary,
              borderColor: COLORS.border.light,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Tag className="size-4" style={{ color: COLORS.primary.main }} />
              <span className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                ¿Tienes código de influencer?
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={manualCode}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "");
                    setManualCode(val);
                    if (codeStatus !== "idle") setCodeStatus("idle");
                    if (codeError) setCodeError("");
                  }}
                  placeholder="Ingresa el código"
                  className="flex-1 h-10 font-mono uppercase"
                  maxLength={17}
                  disabled={validatingCode}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      validateCode();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("[Button Click] Validating code...");
                    validateCode();
                  }}
                  disabled={validatingCode || !manualCode.trim()}
                  className="h-10 px-4"
                  style={{
                    backgroundColor: COLORS.primary.main,
                    color: "white",
                  }}
                >
                  {validatingCode ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Validando...
                    </>
                  ) : (
                    "Aplicar"
                  )}
                </Button>
              </div>

              {/* Validation feedback */}
              {codeStatus === "invalid" && codeError && (
                <div className="flex items-start gap-2 text-xs" style={{ color: COLORS.error.dark }}>
                  <XCircle className="size-4 mt-0.5 shrink-0" />
                  <span>{codeError}</span>
                </div>
              )}

              <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
                Los códigos de influencer te dan acceso a beneficios especiales
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Purchase modal */}
      <PurchaseModal
        promiiId={promiiId}
        promiiTitle={promiiTitle}
        priceAmount={priceAmount}
        priceCurrency={priceCurrency}
        merchantId={merchantId}
        merchantName={merchantName}
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        phone={phone}
        influencerCode={validatedCode}
      />
    </>
  );
}
