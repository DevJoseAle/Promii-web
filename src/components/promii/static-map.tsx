"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { COLORS } from "@/config/colors";

type StaticMapProps = {
  lat?: number | null;
  lng?: number | null;
  addressLine?: string | null;
  zone?: string | null;
  city: string;
  state: string;
};

export function StaticMap({ lat, lng, addressLine, zone, city, state }: StaticMapProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat, lng } : null
  );
  const [loading, setLoading] = useState(!lat || !lng);
  const [error, setError] = useState(false);

  // Build display address
  const parts = [addressLine, zone, city, state].filter(Boolean);
  const displayAddress = parts.join(", ");

  // Geocode if no coords
  useEffect(() => {
    if (lat && lng) return;

    async function geocode() {
      try {
        const query = [addressLine, zone, city, state].filter(Boolean).join(", ");
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

        const res = await fetch(url, {
          headers: { "Accept-Language": "es" },
        });

        if (!res.ok) throw new Error("Geocode failed");

        const data = await res.json();
        if (data.length > 0) {
          setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        } else {
          // Fallback: try with just city + state
          const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${city}, ${state}`)}&limit=1`;
          const fallbackRes = await fetch(fallbackUrl, {
            headers: { "Accept-Language": "es" },
          });
          const fallbackData = await fallbackRes.json();
          if (fallbackData.length > 0) {
            setCoords({ lat: parseFloat(fallbackData[0].lat), lng: parseFloat(fallbackData[0].lon) });
          } else {
            setError(true);
          }
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    geocode();
  }, [lat, lng, addressLine, zone, city, state]);

  if (error || (!coords && !loading)) {
    return null;
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        backgroundColor: COLORS.background.primary,
        borderColor: COLORS.border.light,
      }}
    >
      <div className="p-5 pb-3">
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: COLORS.text.primary }}>
          <MapPin className="size-5" style={{ color: COLORS.primary.main }} />
          Ubicación
        </h2>
        <p className="mt-1.5 text-sm" style={{ color: COLORS.text.secondary }}>
          {displayAddress}
        </p>
      </div>

      {/* Map container */}
      <div className="relative w-full h-[240px] bg-gray-100">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div
              className="size-8 border-3 rounded-full animate-spin"
              style={{
                borderColor: COLORS.border.light,
                borderTopColor: COLORS.primary.main,
              }}
            />
          </div>
        ) : coords ? (
          <iframe
            title="Ubicación del comercio"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.005},${coords.lat - 0.003},${coords.lng + 0.005},${coords.lat + 0.003}&layer=mapnik&marker=${coords.lat},${coords.lng}`}
            className="w-full h-full border-0"
            style={{ pointerEvents: "none" }}
            loading="lazy"
          />
        ) : null}
      </div>
    </div>
  );
}
