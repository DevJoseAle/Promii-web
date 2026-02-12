"use client";

import { useState, useEffect } from "react";
import { Instagram, Youtube, ExternalLink, Check, Clock, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/config/colors";
import { requestPartnership } from "@/lib/services/influencer";
import { supabase } from "@/lib/supabase/supabase.client";
import { ToastService } from "@/lib/services/toast.service";
import Image from "next/image";

interface InfluencerCardProps {
  influencer: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
    niche_primary: string;
    city: string;
    state: string;
    instagram_handle: string;
    tiktok_handle: string | null;
    youtube_handle: string | null;
  };
  merchantId: string;
}

type PartnershipStatus = "none" | "pending" | "approved" | "rejected";

export function InfluencerCard({ influencer, merchantId }: InfluencerCardProps) {
  const [partnershipStatus, setPartnershipStatus] = useState<PartnershipStatus>("none");
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPartnership();
  }, [influencer.id, merchantId]);

  async function checkPartnership() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("influencer_partnerships")
        .select("status")
        .eq("merchant_id", merchantId)
        .eq("influencer_id", influencer.id)
        .maybeSingle();

      if (data) {
        setPartnershipStatus(data.status as PartnershipStatus);
      } else {
        setPartnershipStatus("none");
      }
    } catch (error) {
      console.error("[checkPartnership] Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequest() {
    setRequesting(true);

    const response = await requestPartnership({
      merchant_id: merchantId,
      influencer_id: influencer.id,
    });

    if (response.status === "success") {
      ToastService.showSuccessToast("Solicitud enviada al influencer");
      setPartnershipStatus("pending");
    } else {
      ToastService.showErrorToast(response.error || "Error al enviar solicitud");
    }

    setRequesting(false);
  }

  const tiktokUrl = influencer.tiktok_handle
    ? `https://tiktok.com/@${influencer.tiktok_handle.replace("@", "")}`
    : null;

  const youtubeUrl = influencer.youtube_handle
    ? `https://youtube.com/${influencer.youtube_handle}`
    : null;

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all hover:shadow-lg"
      style={{
        backgroundColor: COLORS.background.primary,
        borderColor: COLORS.border.light,
      }}
    >
      {/* Header con avatar */}
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div
            className="relative size-16 rounded-full overflow-hidden shrink-0 border-2"
            style={{ borderColor: COLORS.border.light }}
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
                  className="text-2xl font-bold"
                  style={{ color: COLORS.primary.main }}
                >
                  {influencer.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Nombre y ubicación */}
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-lg mb-1 truncate"
              style={{ color: COLORS.text.primary }}
            >
              {influencer.display_name}
            </h3>
            <p className="text-sm mb-1" style={{ color: COLORS.text.tertiary }}>
              📍 {influencer.city}, {influencer.state}
            </p>
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
            href={`https://instagram.com/${influencer.instagram_handle.replace("@", "")}`}
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

          {youtubeUrl && (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
              style={{
                backgroundColor: "#FF0000",
                color: "white",
              }}
            >
              <Youtube className="size-3" />
              YouTube
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>

        {/* Action button */}
        {loading ? (
          <div className="h-10 rounded-lg animate-pulse" style={{ backgroundColor: COLORS.neutral[200] }} />
        ) : (
          <>
            {partnershipStatus === "none" && (
              <Button
                onClick={handleRequest}
                disabled={requesting}
                className="w-full h-10 font-semibold transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
                  color: COLORS.text.inverse,
                }}
              >
                {requesting ? (
                  <>
                    <div className="size-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4 mr-2" />
                    Solicitar seguir
                  </>
                )}
              </Button>
            )}

            {partnershipStatus === "pending" && (
              <div
                className="w-full h-10 rounded-lg flex items-center justify-center font-semibold"
                style={{
                  backgroundColor: COLORS.warning.lighter,
                  color: COLORS.warning.dark,
                }}
              >
                <Clock className="size-4 mr-2" />
                Solicitud pendiente
              </div>
            )}

            {partnershipStatus === "approved" && (
              <div
                className="w-full h-10 rounded-lg flex items-center justify-center font-semibold"
                style={{
                  backgroundColor: COLORS.success.lighter,
                  color: COLORS.success.dark,
                }}
              >
                <Check className="size-4 mr-2" />
                Partnership aprobada
              </div>
            )}

            {partnershipStatus === "rejected" && (
              <Button
                onClick={handleRequest}
                disabled={requesting}
                variant="outline"
                className="w-full h-10"
                style={{
                  borderColor: COLORS.border.main,
                  color: COLORS.text.secondary,
                }}
              >
                Solicitar nuevamente
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
