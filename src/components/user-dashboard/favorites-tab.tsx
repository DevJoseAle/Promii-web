"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart, AlertCircle } from "lucide-react";
import { getFavorites } from "@/lib/services/favorites.service";
import { supabase } from "@/lib/supabase/supabase.client";
import { COLORS } from "@/config/colors";
import Link from "next/link";
import Image from "next/image";

interface FavoritesTabProps {
  userId: string;
}

type PromiiCard = {
  id: string;
  title: string;
  price_amount: number;
  price_currency: string;
  discount_label: string | null;
  city: string;
  state: string;
  merchant_id: string;
};

export function FavoritesTab({ userId }: FavoritesTabProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [promiis, setPromiis] = useState<PromiiCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // Cargar favoritos al montar
  // ─────────────────────────────────────────────────────────────
  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Obtener IDs de localStorage
    const ids = getFavorites(userId);
    setFavoriteIds(ids);

    if (ids.length === 0) {
      setPromiis([]);
      setLoading(false);
      return;
    }

    // Fetch promiis desde Supabase
    try {
      const { data, error: fetchError } = await supabase
        .from("promiis")
        .select("id, title, price_amount, price_currency, discount_label, city, state, merchant_id")
        .in("id", ids)
        .eq("status", "active"); // Solo activos

      if (fetchError) {
        console.error("[FavoritesTab] Error fetching promiis:", fetchError);
        setError("Error cargando favoritos");
        setPromiis([]);
      } else {
        // Ordenar según el orden en favoriteIds (más reciente primero)
        const ordered = ids
          .map((id) => data?.find((p) => p.id === id))
          .filter((p): p is PromiiCard => p !== undefined);

        setPromiis(ordered);
      }
    } catch (err) {
      console.error("[FavoritesTab] Unexpected error:", err);
      setError("Error inesperado");
      setPromiis([]);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadFavorites();
    }, 0);

    // Escuchar cambios en localStorage (cuando se agrega/quita desde otra parte)
    const handleStorageChange = () => {
      loadFavorites();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("favorites-updated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("favorites-updated", handleStorageChange);
      clearTimeout(timeoutId);
    };
  }, [loadFavorites]);

  // ─────────────────────────────────────────────────────────────
  // Loading state
  // ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border overflow-hidden animate-pulse"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <div
              className="h-48"
              style={{ backgroundColor: COLORS.neutral[200] }}
            />
            <div className="p-4 space-y-2">
              <div
                className="h-5 w-3/4 rounded"
                style={{ backgroundColor: COLORS.neutral[200] }}
              />
              <div
                className="h-4 w-1/2 rounded"
                style={{ backgroundColor: COLORS.neutral[200] }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Error state
  // ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        className="rounded-xl border p-8 text-center"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.error.light,
        }}
      >
        <AlertCircle
          className="size-12 mx-auto mb-4"
          style={{ color: COLORS.error.main }}
        />
        <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
          Error cargando favoritos
        </h3>
        <p className="text-sm mb-4" style={{ color: COLORS.text.secondary }}>
          {error}
        </p>
        <button
          onClick={loadFavorites}
          className="px-4 py-2 rounded-lg font-semibold transition-colors"
          style={{
            backgroundColor: COLORS.primary.main,
            color: COLORS.text.inverse,
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Empty state
  // ─────────────────────────────────────────────────────────────
  if (promiis.length === 0) {
    return (
      <div
        className="rounded-xl border p-12 text-center"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        <div
          className="mx-auto flex size-16 items-center justify-center rounded-full mb-4"
          style={{
            backgroundColor: COLORS.error.lighter,
            color: COLORS.error.main,
          }}
        >
          <Heart className="size-8" />
        </div>
        <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
          No tienes favoritos aún
        </h3>
        <p className="text-sm mb-6" style={{ color: COLORS.text.secondary }}>
          Guarda tus promiis favoritos para acceder rápido a ellos.<br />
          Haz click en el ❤️ de cualquier promii para agregarlo.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
            color: COLORS.text.inverse,
          }}
        >
          Explorar Promiis
        </Link>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Grid de favoritos
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header con contador */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: COLORS.text.secondary }}>
          {promiis.length} {promiis.length === 1 ? "favorito" : "favoritos"}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {promiis.map((promii) => (
          <Link
            key={promii.id}
            href={`/p/${promii.id}`}
            className="group rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            {/* Placeholder de imagen */}
            <div
              className="relative h-48"
              style={{ backgroundColor: COLORS.neutral[200] }}
            >
              {promii.discount_label && (
                <div
                  className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.error.main} 0%, ${COLORS.error.light} 100%)`,
                    color: COLORS.text.inverse,
                  }}
                >
                  {promii.discount_label}
                </div>
              )}

              {/* Badge favorito */}
              <div
                className="absolute top-3 right-3 p-2 rounded-full shadow-md"
                style={{
                  backgroundColor: COLORS.error.main,
                }}
              >
                <Heart className="size-4 fill-current" style={{ color: COLORS.text.inverse }} />
              </div>

              {/* Placeholder text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold" style={{ color: COLORS.text.tertiary }}>
                  Sin imagen
                </span>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-4">
              <h3
                className="font-bold mb-2 line-clamp-2 group-hover:underline"
                style={{ color: COLORS.text.primary }}
              >
                {promii.title}
              </h3>

              <div className="flex items-baseline gap-2 mb-2">
                <span
                  className="text-2xl font-bold"
                  style={{ color: COLORS.primary.main }}
                >
                  {promii.price_currency} {Number(promii.price_amount).toFixed(2)}
                </span>
              </div>

              <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
                📍 {promii.city}, {promii.state}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
