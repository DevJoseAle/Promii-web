"use client";

import { useState, useEffect } from "react";
import { Users, Phone, Instagram, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/config/colors";
import { getMerchantPartnerships, type PartnershipWithDetails } from "@/lib/services/influencer";
import { ToastService } from "@/lib/toast/toast.service";
import Image from "next/image";

interface MyInfluencersTabProps {
  merchantId: string;
}

export function MyInfluencersTab({ merchantId }: MyInfluencersTabProps) {
  const [partnerships, setPartnerships] = useState<PartnershipWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  useEffect(() => {
    loadPartnerships();
  }, [merchantId]);

  async function loadPartnerships() {
    setLoading(true);
    const response = await getMerchantPartnerships(merchantId, "approved");
    
    if (response.status === "success") {
      setPartnerships(response.data || []);
    }
    
    setLoading(false);
  }

  async function handleCopyPhone(phone: string) {
    await navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    ToastService.showSuccessToast("Teléfono copiado");
    setTimeout(() => setCopiedPhone(null), 2000);
  }

  if (loading) {
    return <div className="text-center py-8" style={{ color: COLORS.text.secondary }}>Cargando...</div>;
  }

  if (partnerships.length === 0) {
    return (
      <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}>
        <Users className="size-16 mx-auto mb-4" style={{ color: COLORS.text.tertiary }} />
        <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
          No tienes influencers aún
        </h3>
        <p className="text-sm" style={{ color: COLORS.text.secondary }}>
          Ve al tab "Buscar Influencers" para solicitar partnerships
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold" style={{ color: COLORS.text.secondary }}>
        {partnerships.length} influencer{partnerships.length !== 1 ? "s" : ""} aprobado{partnerships.length !== 1 ? "s" : ""}
      </p>

      <div className="space-y-3">
        {partnerships.map((partnership) => {
          const influencer = partnership.influencer;
          if (!influencer) return null;

          const whatsappUrl = `https://wa.me/${influencer.instagram_handle}`;

          return (
            <div
              key={partnership.id}
              className="rounded-lg border p-4"
              style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
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
                    📍 {influencer.city}, {influencer.state} • {influencer.niche_primary}
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
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCopyPhone(influencer.instagram_handle)}
                    variant="outline"
                    size="sm"
                    className="h-9"
                  >
                    {copiedPhone === influencer.instagram_handle ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="h-9"
                    style={{ backgroundColor: COLORS.success.main, color: "white" }}
                  >
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <Phone className="size-4 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
