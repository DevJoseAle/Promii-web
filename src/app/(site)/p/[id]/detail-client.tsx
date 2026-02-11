"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/config/colors";
import { ShoppingCart, Share2 } from "lucide-react";
import { PurchaseModal } from "@/components/promii/purchase-modal";
import { FavoriteButton } from "@/components/promii/favorite-button";
import { ShareButtons } from "@/components/promii/share-buttons";

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

  console.log("[PromiiDetailClient] Phone received:", phone);

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

      {/* Influencer code indicator */}
      {influencerCode && (
        <div
          className="mt-4 rounded-lg border p-3"
          style={{
            backgroundColor: COLORS.primary.lighter,
            borderColor: COLORS.primary.light,
          }}
        >
          <div className="text-xs font-semibold mb-1" style={{ color: COLORS.primary.dark }}>
            Código de influencer aplicado
          </div>
          <div className="text-sm font-bold" style={{ color: COLORS.primary.main }}>
            {influencerCode}
          </div>
        </div>
      )}

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
        influencerCode={influencerCode}
      />
    </>
  );
}
