"use client";

import { useState, useEffect } from "react";
import { Users, MapPin, ExternalLink, Instagram, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/config/colors";
import { getMerchantPartnerships, type PartnershipWithDetails } from "@/lib/services/influencer";
import { useAuth } from "@/lib/context/AuthContext";
import Image from "next/image";

export default function InfluencersAffiliatedPage() {
  const { profile } = useAuth();
  const [partnerships, setPartnerships] = useState<PartnershipWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      loadPartnerships();
    }
  }, [profile?.id]);

  async function loadPartnerships() {
    if (!profile?.id) return;

    setLoading(true);
    const response = await getMerchantPartnerships(profile.id, "approved");

    if (response.status === "success") {
      setPartnerships(response.data || []);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
            Influencers Afiliados
          </h1>
          <p className="text-base" style={{ color: COLORS.text.secondary }}>
            Influencers que han aceptado colaborar contigo
          </p>
        </div>
        <div className="text-center py-8" style={{ color: COLORS.text.secondary }}>
          Cargando...
        </div>
      </div>
    );
  }

  if (partnerships.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
            Influencers Afiliados
          </h1>
          <p className="text-base" style={{ color: COLORS.text.secondary }}>
            Influencers que han aceptado colaborar contigo
          </p>
        </div>
        <div
          className="rounded-xl border p-12 text-center"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <Users className="size-16 mx-auto mb-4" style={{ color: COLORS.text.tertiary }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
            Aún no tienes influencers afiliados
          </h3>
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            Cuando los influencers acepten tus solicitudes, aparecerán aquí
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
          Influencers Afiliados
        </h1>
        <p className="text-base" style={{ color: COLORS.text.secondary }}>
          {partnerships.length} influencer{partnerships.length !== 1 ? "s" : ""} colaborando contigo
        </p>
      </div>

      {/* Grid de influencers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {partnerships.map((partnership) => {
          const influencer = partnership.influencer;
          if (!influencer) return null;

          const instagramUrl = `https://instagram.com/${influencer.instagram_handle.replace("@", "")}`;
          const tiktokUrl = influencer.tiktok_handle
            ? `https://tiktok.com/@${influencer.tiktok_handle.replace("@", "")}`
            : null;

          return (
            <div
              key={partnership.id}
              className="rounded-xl border overflow-hidden transition-all hover:shadow-lg"
              style={{
                backgroundColor: COLORS.background.primary,
                borderColor: COLORS.border.light,
              }}
            >
              {/* Header con avatar */}
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  {/* Avatar */}
                  <div
                    className="relative size-14 rounded-full overflow-hidden shrink-0 border-2"
                    style={{ borderColor: COLORS.success.main }}
                  >
                    {influencer.avatar_url ? (
                      <Image
                        src={influencer.avatar_url}
                        alt={influencer.display_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className="size-full flex items-center justify-center"
                        style={{ backgroundColor: COLORS.primary.lighter }}
                      >
                        <span
                          className="text-xl font-bold"
                          style={{ color: COLORS.primary.main }}
                        >
                          {influencer.display_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {/* Badge de aprobado */}
                    <div
                      className="absolute -bottom-1 -right-1 size-5 rounded-full flex items-center justify-center border-2 border-white"
                      style={{ backgroundColor: COLORS.success.main }}
                    >
                      <CheckCircle className="size-3 text-white" />
                    </div>
                  </div>

                  {/* Nombre y ubicación */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold text-base mb-1 truncate"
                      style={{ color: COLORS.text.primary }}
                    >
                      {influencer.display_name}
                    </h3>
                    <div
                      className="flex items-center gap-1 text-xs mb-2"
                      style={{ color: COLORS.text.tertiary }}
                    >
                      <MapPin className="size-3" />
                      {influencer.city}
                    </div>
                    <div
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: COLORS.primary.lighter,
                        color: COLORS.primary.main,
                      }}
                    >
                      {influencer.niche_primary}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {influencer.bio && (
                  <p
                    className="text-sm line-clamp-2 mb-4"
                    style={{ color: COLORS.text.secondary }}
                  >
                    {influencer.bio}
                  </p>
                )}

                {/* Social links */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                    style={{
                      backgroundColor: "#E4405F",
                      color: "white",
                    }}
                  >
                    <Instagram className="size-3" />
                    @{influencer.instagram_handle.replace("@", "")}
                    <ExternalLink className="size-3" />
                  </a>

                  {tiktokUrl && (
                    <a
                      href={tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                      style={{
                        backgroundColor: "#000000",
                        color: "white",
                      }}
                    >
                      TikTok
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>

                {/* Ver perfil */}
                <Button
                  onClick={() =>
                    window.open(
                      `/influencers/${influencer.instagram_handle.replace("@", "")}`,
                      "_blank"
                    )
                  }
                  variant="outline"
                  size="sm"
                  className="w-full h-9"
                  style={{
                    borderColor: COLORS.border.main,
                    color: COLORS.text.primary,
                  }}
                >
                  Ver perfil en Promii
                  <ExternalLink className="size-3 ml-2" />
                </Button>

                {/* Partnership date */}
                <p
                  className="text-xs mt-3 pt-3 border-t text-center"
                  style={{ color: COLORS.text.tertiary, borderColor: COLORS.border.light }}
                >
                  Colaborando desde{" "}
                  {new Date(partnership.responded_at!).toLocaleDateString("es-VE", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
