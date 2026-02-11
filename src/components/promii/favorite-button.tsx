"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { COLORS } from "@/config/colors";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";

type Props = {
  promiiId: string;
};

export function FavoriteButton({ promiiId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleFavorite = async () => {
    if (!user) {
      router.push("/auth/sign-in");
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement favorites API
      // For now just toggle state
      setIsFavorite(!isFavorite);

      // await supabase.from("user_favorites").insert/delete...
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggleFavorite}
      disabled={loading}
      variant="outline"
      className="h-12 font-semibold transition-all duration-200 hover:scale-105"
      style={{
        borderColor: isFavorite ? COLORS.error.main : COLORS.border.main,
        backgroundColor: isFavorite ? COLORS.error.lighter : COLORS.background.primary,
        color: isFavorite ? COLORS.error.main : COLORS.text.secondary,
      }}
    >
      <Heart
        className={`size-5 mr-2 transition-all duration-200 ${isFavorite ? "fill-current" : ""}`}
      />
      {isFavorite ? "Guardado" : "Guardar"}
    </Button>
  );
}
