"use client";

import { useState, useEffect } from "react";
import { Clock, Check, X, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/config/colors";
import { getInfluencerPartnerships, respondToPartnership, type PartnershipWithDetails } from "@/lib/services/influencer";
import { ToastService } from "@/lib/toast/toast.service";
import Image from "next/image";

interface RequestsTabProps {
  influencerId: string;
}

export function RequestsTab({ influencerId }: RequestsTabProps) {
  const [requests, setRequests] = useState<PartnershipWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, [influencerId]);

  async function loadRequests() {
    setLoading(true);
    const response = await getInfluencerPartnerships(influencerId, "pending");

    if (response.status === "success") {
      setRequests(response.data || []);
    }

    setLoading(false);
  }

  async function handleRespond(partnershipId: string, approved: boolean) {
    setResponding(partnershipId);

    const response = await respondToPartnership({
      partnership_id: partnershipId,
      influencer_id: influencerId,
      action: approved ? "approved" : "rejected",
    });

    if (response.status === "success") {
      ToastService.showSuccessToast(
        approved ? "Solicitud aprobada" : "Solicitud rechazada"
      );
      setRequests(prev => prev.filter(r => r.id !== partnershipId));
    } else {
      ToastService.showErrorToast("Error al procesar solicitud");
    }

    setResponding(null);
  }

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
            Solicitudes de Colaboración
          </h1>
          <p className="text-base" style={{ color: COLORS.text.secondary }}>
            Marcas que quieren colaborar contigo
          </p>
        </div>
        <div className="text-center py-8" style={{ color: COLORS.text.secondary }}>Cargando...</div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
            Solicitudes de Colaboración
          </h1>
          <p className="text-base" style={{ color: COLORS.text.secondary }}>
            Marcas que quieren colaborar contigo
          </p>
        </div>
        <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}>
          <Clock className="size-16 mx-auto mb-4" style={{ color: COLORS.text.tertiary }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
            No tienes solicitudes pendientes
          </h3>
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            Cuando una marca te solicite colaborar, aparecerá aquí
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
          Solicitudes de Colaboración
        </h1>
        <p className="text-base" style={{ color: COLORS.text.secondary }}>
          Marcas que quieren colaborar contigo
        </p>
      </div>

      <div className="space-y-4">
      <p className="text-sm font-semibold" style={{ color: COLORS.text.secondary }}>
        {requests.length} solicitud{requests.length !== 1 ? "es" : ""} pendiente{requests.length !== 1 ? "s" : ""}
      </p>

      <div className="space-y-3">
        {requests.map((request) => {
          const merchant = request.merchant;
          if (!merchant) return null;

          const daysSince = Math.floor(
            (Date.now() - new Date(request.requested_at).getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={request.id}
              className="rounded-lg border p-5"
              style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.warning.light }}
            >
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="relative size-16 rounded-lg overflow-hidden shrink-0 border" style={{ borderColor: COLORS.border.light }}>
                  {merchant.logo_url ? (
                    <Image src={merchant.logo_url} alt={merchant.business_name} fill className="object-cover" />
                  ) : (
                    <div className="size-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary.lighter }}>
                      <span className="text-xl font-bold" style={{ color: COLORS.primary.main }}>
                        {merchant.business_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-1" style={{ color: COLORS.text.primary }}>
                    {merchant.business_name}
                  </h3>

                  <div className="flex items-center gap-1 text-sm mb-2" style={{ color: COLORS.text.tertiary }}>
                    <MapPin className="size-4" />
                    {merchant.city}, {merchant.state}
                  </div>

                  {merchant.description && (
                    <p className="text-sm mb-3 line-clamp-2" style={{ color: COLORS.text.secondary }}>
                      {merchant.description}
                    </p>
                  )}

                  {merchant.website_url && (
                    <a
                      href={merchant.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold flex items-center gap-1 mb-2"
                      style={{ color: COLORS.primary.main }}
                    >
                      <ExternalLink className="size-3" />
                      Visitar sitio web
                    </a>
                  )}

                  <p className="text-xs mt-2" style={{ color: COLORS.text.tertiary }}>
                    Solicitado hace {daysSince} día{daysSince !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <Button
                    onClick={() => handleRespond(request.id, true)}
                    disabled={responding === request.id}
                    size="sm"
                    className="h-9"
                    style={{
                      backgroundColor: COLORS.success.main,
                      color: COLORS.text.inverse,
                    }}
                  >
                    {responding === request.id ? (
                      <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="size-4 mr-2" />
                        Aprobar
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => handleRespond(request.id, false)}
                    disabled={responding === request.id}
                    variant="outline"
                    size="sm"
                    className="h-9"
                    style={{
                      borderColor: COLORS.error.light,
                      color: COLORS.error.main,
                    }}
                  >
                    <X className="size-4 mr-2" />
                    Rechazar
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
