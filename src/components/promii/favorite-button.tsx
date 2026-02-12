"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import {
  isFavorite,
  toggleFavorite,
} from "@/lib/services/favorites.service";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { COLORS } from "@/config/colors";

interface FavoriteButtonProps {
  promiiId: string;
}

export function FavoriteButton({ promiiId }: FavoriteButtonProps) {
  const { profile, isUser } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [animating, setAnimating] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Verificar si está en favoritos al montar
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (profile?.id) {
      setIsFav(isFavorite(profile.id, promiiId));
    }
  }, [profile, promiiId]);

  // ─────────────────────────────────────────────────────────────
  // Handler: Toggle favorito
  // ─────────────────────────────────────────────────────────────
  const handleToggle = () => {
    if (!profile?.id) {
      // Redirigir a login
      window.location.href = "/auth/sign-in";
      return;
    }

    // Toggle
    const newState = toggleFavorite(profile.id, promiiId);
    setIsFav(!isFav);

    // Animación
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    // Disparar evento para que otros componentes se actualicen
    window.dispatchEvent(new Event("favorites-updated"));
  };

  // Si no es usuario, no mostrar botón
  // (merchants e influencers no tienen favoritos por ahora)
  if (!isUser) {
    return null;
  }

  return (
    <Button
      onClick={handleToggle}
      variant="outline"
      size="lg"
      className={cn(
        "font-semibold transition-all hover:scale-105 active:scale-95",
        animating && "animate-pulse"
      )}
      style={{
        backgroundColor: isFav ? COLORS.error.lighter : COLORS.background.primary,
        borderColor: isFav ? COLORS.error.main : COLORS.border.main,
        color: isFav ? COLORS.error.dark : COLORS.text.primary,
      }}
    >
      <Heart
        className={cn("size-5 mr-2 transition-all", isFav && "fill-current")}
        style={{ color: isFav ? COLORS.error.main : "currentColor" }}
      />
      {isFav ? "En favoritos" : "Agregar a favoritos"}
    </Button>
  );
}
