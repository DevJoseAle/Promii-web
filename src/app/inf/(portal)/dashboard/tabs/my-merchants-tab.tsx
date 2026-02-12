"use client";

import { useState, useEffect } from "react";
import { Users, MapPin, ExternalLink, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/config/colors";
import { getInfluencerPartnerships, type PartnershipWithDetails } from "@/lib/services/influencer";
import Image from "next/image";
import { ToastService } from "@/lib/toast/toast.service";

interface MyMerchantsTabProps {
  influencerId: string;
}

export function MyMerchantsTab({ influencerId }: MyMerchantsTabProps) {
  const [partnerships, setPartnerships] = useState<PartnershipWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartnerships();
  }, [influencerId]);

  async function loadPartnerships() {
    setLoading(true);
    const response = await getInfluencerPartnerships(influencerId, "approved");

    if (response.status === "success") {
      setPartnerships(response.data || []);
    }

    setLoading(false);
  }

  function handleCopyPhone(phone: string) {
    navigator.clipboard.writeText(phone);
    ToastService.showSuccessToast("Teléfono copiado");
  }

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
            Mis Marcas
          </h1>
          <p className="text-base" style={{ color: COLORS.text.secondary }}>
            Marcas con las que colaboras actualmente
          </p>
        </div>
        <div className="text-center py-8" style={{ color: COLORS.text.secondary }}>Cargando...</div>
      </div>
    );
  }

  if (partnerships.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
            Mis Marcas
          </h1>
          <p className="text-base" style={{ color: COLORS.text.secondary }}>
            Marcas con las que colaboras actualmente
          </p>
        </div>
        <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}>
          <Users className="size-16 mx-auto mb-4" style={{ color: COLORS.text.tertiary }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
            Aún no tienes marcas colaborando
          </h3>
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            Cuando apruebes solicitudes de marcas, aparecerán aquí
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
          Mis Marcas
        </h1>
        <p className="text-base" style={{ color: COLORS.text.secondary }}>
          Marcas con las que colaboras actualmente
        </p>
      </div>

      <div className="space-y-4">
      <p className="text-sm font-semibold" style={{ color: COLORS.text.secondary }}>
        {partnerships.length} marca{partnerships.length !== 1 ? "s" : ""} colaborando
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {partnerships.map((partnership) => {
          const merchant = partnership.merchant;
          if (!merchant) return null;

          return (
            <div
              key={partnership.id}
              className="rounded-lg border p-5"
              style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
            >
              <div className="flex items-start gap-4 mb-4">
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
                  <h3 className="font-bold text-base mb-1 truncate" style={{ color: COLORS.text.primary }}>
                    {merchant.business_name}
                  </h3>

                  <div className="flex items-center gap-1 text-xs mb-2" style={{ color: COLORS.text.tertiary }}>
                    <MapPin className="size-3" />
                    {merchant.city}, {merchant.state}
                  </div>

                  {merchant.category && (
                    <span
                      className="inline-block px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: COLORS.primary.lighter,
                        color: COLORS.primary.main,
                      }}
                    >
                      {merchant.category}
                    </span>
                  )}
                </div>
              </div>

              {merchant.description && (
                <p className="text-sm mb-4 line-clamp-2" style={{ color: COLORS.text.secondary }}>
                  {merchant.description}
                </p>
              )}

              {/* Contact Actions */}
              <div className="flex gap-2 flex-wrap">
                {merchant.whatsapp_phone && (
                  <Button
                    onClick={() => window.open(`https://wa.me/${merchant.whatsapp_phone!.replace(/\D/g, "")}`, "_blank")}
                    size="sm"
                    className="h-8"
                    style={{
                      backgroundColor: "#25D366",
                      color: "#fff",
                    }}
                  >
                    <MessageCircle className="size-3 mr-1.5" />
                    WhatsApp
                  </Button>
                )}

                {merchant.phone && (
                  <Button
                    onClick={() => handleCopyPhone(merchant.phone!)}
                    variant="outline"
                    size="sm"
                    className="h-8"
                    style={{
                      borderColor: COLORS.border.main,
                      color: COLORS.text.primary,
                    }}
                  >
                    <Phone className="size-3 mr-1.5" />
                    {merchant.phone}
                  </Button>
                )}

                {merchant.website_url && (
                  <Button
                    onClick={() => window.open(merchant.website_url!, "_blank")}
                    variant="outline"
                    size="sm"
                    className="h-8"
                    style={{
                      borderColor: COLORS.border.main,
                      color: COLORS.primary.main,
                    }}
                  >
                    <ExternalLink className="size-3 mr-1.5" />
                    Sitio web
                  </Button>
                )}
              </div>

              {/* Partnership date */}
              <p className="text-xs mt-3 pt-3 border-t" style={{ color: COLORS.text.tertiary, borderColor: COLORS.border.light }}>
                Colaborando desde {new Date(partnership.responded_at!).toLocaleDateString('es-VE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
