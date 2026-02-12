"use client";

import { useState, useEffect } from "react";
import { Clock, X, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/config/colors";
import { getMerchantPartnerships, cancelPartnershipRequest, type PartnershipWithDetails } from "@/lib/services/influencer";
import { ToastService } from "@/lib/services/toast.service";
import Image from "next/image";

interface PendingRequestsTabProps {
  merchantId: string;
}

export function PendingRequestsTab({ merchantId }: PendingRequestsTabProps) {
  const [partnerships, setPartnerships] = useState<PartnershipWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    loadPartnerships();
  }, [merchantId]);

  async function loadPartnerships() {
    setLoading(true);
    const response = await getMerchantPartnerships(merchantId, "pending");
    
    if (response.status === "success") {
      setPartnerships(response.data || []);
    }
    
    setLoading(false);
  }

  async function handleCancel(partnershipId: string) {
    setCancelling(partnershipId);
    
    const response = await cancelPartnershipRequest(partnershipId, merchantId);
    
    if (response.status === "success") {
      ToastService.showSuccessToast("Solicitud cancelada");
      setPartnerships(prev => prev.filter(p => p.id !== partnershipId));
    } else {
      ToastService.showErrorToast("Error al cancelar");
    }
    
    setCancelling(null);
  }

  if (loading) {
    return <div className="text-center py-8" style={{ color: COLORS.text.secondary }}>Cargando...</div>;
  }

  if (partnerships.length === 0) {
    return (
      <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}>
        <Clock className="size-16 mx-auto mb-4" style={{ color: COLORS.text.tertiary }} />
        <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
          No tienes solicitudes pendientes
        </h3>
        <p className="text-sm" style={{ color: COLORS.text.secondary }}>
          Cuando solicites seguir a un influencer, aparecerá aquí hasta que responda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold" style={{ color: COLORS.text.secondary }}>
        {partnerships.length} solicitud{partnerships.length !== 1 ? "es" : ""} pendiente{partnerships.length !== 1 ? "s" : ""}
      </p>

      <div className="space-y-3">
        {partnerships.map((partnership) => {
          const influencer = partnership.influencer;
          if (!influencer) return null;

          const daysSince = Math.floor(
            (Date.now() - new Date(partnership.requested_at).getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={partnership.id}
              className="rounded-lg border p-4"
              style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.warning.light }}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative size-14 rounded-full overflow-hidden shrink-0 border" style={{ borderColor: COLORS.border.light }}>
                  {influencer.avatar_url ? (
                    <Image src={influencer.avatar_url} alt={influencer.display_name} fill className="object-cover" />
                  ) : (
                    <div className="size-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary.lighter }}>
                      <span className="text-xl font-bold" style={{ color: COLORS.primary.main }}>
                        {influencer.display_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate" style={{ color: COLORS.text.primary }}>{influencer.display_name}</h3>
                  <p className="text-sm" style={{ color: COLORS.text.tertiary }}>
                    📍 {influencer.city}, {influencer.state}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <a
                      href={`https://instagram.com/${influencer.instagram_handle.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold flex items-center gap-1"
                      style={{ color: "#E4405F" }}
                    >
                      <Instagram className="size-3" />
                      @{influencer.instagram_handle.replace("@", "")}
                    </a>
                  </div>
                  <p className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
                    Solicitado hace {daysSince} día{daysSince !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Cancel button */}
                <Button
                  onClick={() => handleCancel(partnership.id)}
                  disabled={cancelling === partnership.id}
                  variant="outline"
                  size="sm"
                  className="h-9"
                  style={{
                    borderColor: COLORS.error.light,
                    color: COLORS.error.main,
                  }}
                >
                  {cancelling === partnership.id ? (
                    <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <X className="size-4 mr-2" />
                      Cancelar
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
