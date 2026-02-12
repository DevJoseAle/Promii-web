"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MapPin, Tag, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/supabase.client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/config/colors";
import { VE_STATES } from "@/config/locations";
import { CATEGORIES } from "@/config/categories";
import { InfluencerCard } from "../components/influencer-card";

interface SearchInfluencersTabProps {
  merchantId: string;
}

type Influencer = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  niche_primary: string;
  niche_secondary: string | null;
  city: string;
  state: string;
  instagram_handle: string;
  tiktok_handle: string | null;
  youtube_handle: string | null;
  verification_status: string;
};

export function SearchInfluencersTab({ merchantId }: SearchInfluencersTabProps) {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [filteredInfluencers, setFilteredInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedNiche, setSelectedNiche] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Cargar influencers
  useEffect(() => {
    loadInfluencers();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    applyFilters();
  }, [influencers, searchQuery, selectedState, selectedNiche]);

  async function loadInfluencers() {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("influencers")
        .select("*")
        .eq("verification_status", "approved")
        .order("display_name", { ascending: true });

      if (fetchError) {
        console.error("[loadInfluencers] Error:", fetchError);
        setError("Error cargando influencers");
        return;
      }

      setInfluencers(data || []);
    } catch (err) {
      console.error("[loadInfluencers] Unexpected error:", err);
      setError("Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...influencers];

    // Filtro de búsqueda (nombre o handle)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (inf) =>
          inf.display_name.toLowerCase().includes(query) ||
          inf.instagram_handle.toLowerCase().includes(query)
      );
    }

    // Filtro por estado
    if (selectedState) {
      filtered = filtered.filter((inf) => inf.state === selectedState);
    }

    // Filtro por nicho
    if (selectedNiche) {
      filtered = filtered.filter(
        (inf) =>
          inf.niche_primary === selectedNiche ||
          inf.niche_secondary === selectedNiche
      );
    }

    setFilteredInfluencers(filtered);
  }

  function clearFilters() {
    setSearchQuery("");
    setSelectedState("");
    setSelectedNiche("");
  }

  const hasActiveFilters = selectedState || selectedNiche;

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl border p-6 animate-pulse"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className="size-16 rounded-full"
                style={{ backgroundColor: COLORS.neutral[200] }}
              />
              <div className="flex-1 space-y-2">
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
          </div>
        ))}
      </div>
    );
  }

  // Error state
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
          Error cargando influencers
        </h3>
        <p className="text-sm mb-4" style={{ color: COLORS.text.secondary }}>
          {error}
        </p>
        <Button
          onClick={loadInfluencers}
          style={{
            backgroundColor: COLORS.primary.main,
            color: COLORS.text.inverse,
          }}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  // Empty state
  if (influencers.length === 0) {
    return (
      <div
        className="rounded-xl border p-12 text-center"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        <Search className="size-16 mx-auto mb-4" style={{ color: COLORS.text.tertiary }} />
        <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
          No hay influencers disponibles
        </h3>
        <p className="text-sm" style={{ color: COLORS.text.secondary }}>
          Aún no hay influencers registrados en la plataforma
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search bar */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
              style={{ color: COLORS.text.tertiary }}
            />
            <Input
              type="text"
              placeholder="Buscar por nombre o Instagram..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
              style={{
                backgroundColor: COLORS.background.tertiary,
                borderColor: COLORS.border.main,
              }}
            />
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="h-11 px-4"
            style={{
              borderColor: hasActiveFilters ? COLORS.primary.main : COLORS.border.main,
              color: hasActiveFilters ? COLORS.primary.main : COLORS.text.secondary,
            }}
          >
            <Filter className="size-5 mr-2" />
            Filtros
            {hasActiveFilters && (
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: COLORS.primary.main,
                  color: COLORS.text.inverse,
                }}
              >
                {(selectedState ? 1 : 0) + (selectedNiche ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div
            className="rounded-lg border p-4 space-y-4"
            style={{
              backgroundColor: COLORS.background.secondary,
              borderColor: COLORS.border.light,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Estado */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.text.primary }}>
                  <MapPin className="inline-block size-4 mr-1" />
                  Estado
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border"
                  style={{
                    backgroundColor: COLORS.background.primary,
                    borderColor: COLORS.border.main,
                    color: COLORS.text.primary,
                  }}
                >
                  <option value="">Todos los estados</option>
                  {VE_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nicho */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.text.primary }}>
                  <Tag className="inline-block size-4 mr-1" />
                  Nicho/Categoría
                </label>
                <select
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border"
                  style={{
                    backgroundColor: COLORS.background.primary,
                    borderColor: COLORS.border.main,
                    color: COLORS.text.primary,
                  }}
                >
                  <option value="">Todas las categorías</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                className="w-full"
                style={{ color: COLORS.text.secondary }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm font-semibold" style={{ color: COLORS.text.secondary }}>
        {filteredInfluencers.length} influencer{filteredInfluencers.length !== 1 ? "s" : ""} encontrado
        {filteredInfluencers.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      {filteredInfluencers.length === 0 ? (
        <div
          className="rounded-lg border p-8 text-center"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            No se encontraron influencers con los filtros seleccionados
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInfluencers.map((influencer) => (
            <InfluencerCard
              key={influencer.id}
              influencer={influencer}
              merchantId={merchantId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
