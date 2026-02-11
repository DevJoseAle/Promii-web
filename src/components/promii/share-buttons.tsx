"use client";

import { useState } from "react";
import { Share2, Link as LinkIcon, Check } from "lucide-react";
import { COLORS } from "@/config/colors";
import { Button } from "@/components/ui/button";

type Props = {
  promiiId: string;
  promiiTitle: string;
};

export function ShareButtons({ promiiId, promiiTitle }: Props) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copying to clipboard:", err);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `¡Mira esta oferta! ${promiiTitle}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`;
    window.open(url, "_blank");
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
  };

  const handleShareTwitter = () => {
    const text = `¡Mira esta oferta! ${promiiTitle}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={handleCopyLink}
        variant="outline"
        size="sm"
        className="h-9 font-semibold transition-all duration-200 hover:scale-105"
        style={{
          borderColor: copied ? COLORS.success.main : COLORS.border.main,
          backgroundColor: copied ? COLORS.success.lighter : COLORS.background.primary,
          color: copied ? COLORS.success.main : COLORS.text.secondary,
        }}
      >
        {copied ? (
          <>
            <Check className="size-4 mr-1.5" />
            Copiado
          </>
        ) : (
          <>
            <LinkIcon className="size-4 mr-1.5" />
            Copiar link
          </>
        )}
      </Button>

      <Button
        onClick={handleShareWhatsApp}
        variant="outline"
        size="sm"
        className="h-9 font-semibold transition-all duration-200 hover:scale-105"
        style={{
          borderColor: COLORS.border.main,
          color: COLORS.text.secondary,
        }}
      >
        WhatsApp
      </Button>

      <Button
        onClick={handleShareFacebook}
        variant="outline"
        size="sm"
        className="h-9 font-semibold transition-all duration-200 hover:scale-105"
        style={{
          borderColor: COLORS.border.main,
          color: COLORS.text.secondary,
        }}
      >
        Facebook
      </Button>

      <Button
        onClick={handleShareTwitter}
        variant="outline"
        size="sm"
        className="h-9 font-semibold transition-all duration-200 hover:scale-105"
        style={{
          borderColor: COLORS.border.main,
          color: COLORS.text.secondary,
        }}
      >
        Twitter
      </Button>
    </div>
  );
}
