"use client";

import { useEffect, useState } from "react";
import { History, AlertCircle, Search } from "lucide-react";
import { fetchUserPurchases } from "@/lib/services/user-purchases.service";
import { PurchaseCardCompact } from "./purchase-card-compact";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { COLORS } from "@/config/colors";
import type {
  PurchaseWithDetails,
  PurchaseStatusFilter,
} from "@/config/types/user-dashboard";

interface PurchaseHistoryTabProps {
  userId: string;
}

type FilterOption = {
  id: PurchaseStatusFilter;
  label: string;
  count?: number;
};

const FILTER_OPTIONS: Omit<FilterOption, "count">[] = [
  { id: "all", label: "Todos" },
  { id: "pending_payment", label: "Pendiente pago" },
  { id: "pending_validation", label: "Pendiente validación" },
  { id: "approved", label: "Aprobados" },
  { id: "redeemed", label: "Canjeados" },
  { id: "rejected", label: "Rechazados" },
  { id: "cancelled", label: "Cancelados" },
];

export function PurchaseHistoryTab({ userId }: PurchaseHistoryTabProps) {
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<PurchaseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<PurchaseStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ─────────────────────────────────────────────────────────────
  // Fetch purchases al montar
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    loadPurchases();
  }, [userId]);

  async function loadPurchases() {
    setLoading(true);
    setError(null);

    const response = await fetchUserPurchases(userId);

    if (response.status === "success") {
      setPurchases(response.data || []);
    } else {
      setError(response.error || "Error cargando historial");
    }

    setLoading(false);
  }

  // ─────────────────────────────────────────────────────────────
  // Aplicar filtros cuando cambien purchases, filter o search
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let filtered = [...purchases];

    // Filtro por estado
    if (activeFilter !== "all") {
      filtered = filtered.filter((p) => p.status === activeFilter);
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) =>
        p.promii_snapshot_title.toLowerCase().includes(query)
      );
    }

    setFilteredPurchases(filtered);
  }, [purchases, activeFilter, searchQuery]);

  // ─────────────────────────────────────────────────────────────
  // Calcular contadores para cada filtro
  // ─────────────────────────────────────────────────────────────
  const filterCounts = FILTER_OPTIONS.map((option) => ({
    ...option,
    count:
      option.id === "all"
        ? purchases.length
        : purchases.filter((p) => p.status === option.id).length,
  }));

  // ─────────────────────────────────────────────────────────────
  // Loading state
  // ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-lg border p-4 animate-pulse"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <div className="space-y-2">
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
          Error cargando historial
        </h3>
        <p className="text-sm mb-4" style={{ color: COLORS.text.secondary }}>
          {error}
        </p>
        <button
          onClick={loadPurchases}
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
  if (purchases.length === 0) {
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
            backgroundColor: COLORS.neutral[100],
            color: COLORS.text.tertiary,
          }}
        >
          <History className="size-8" />
        </div>
        <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
          No tienes compras aún
        </h3>
        <p className="text-sm mb-6" style={{ color: COLORS.text.secondary }}>
          Cuando compres tu primer promii, aparecerá en tu historial.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
            color: COLORS.text.inverse,
          }}
        >
          Explorar Promiis
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros de estado */}
      <div className="flex flex-wrap gap-2">
        {filterCounts.map((option) => (
          <button
            key={option.id}
            onClick={() => setActiveFilter(option.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105",
              activeFilter === option.id
                ? "shadow-sm"
                : "hover:bg-gray-50"
            )}
            style={
              activeFilter === option.id
                ? {
                    background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
                    color: COLORS.text.inverse,
                  }
                : {
                    backgroundColor: COLORS.background.primary,
                    color: COLORS.text.secondary,
                    border: `1px solid ${COLORS.border.main}`,
                  }
            }
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={cn(
                  "ml-2 px-2 py-0.5 rounded-full text-xs font-bold",
                  activeFilter === option.id
                    ? "bg-white/20"
                    : "bg-gray-100"
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
          style={{ color: COLORS.text.tertiary }}
        />
        <Input
          type="text"
          placeholder="Buscar por nombre del promii..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11"
          style={{
            backgroundColor: COLORS.background.tertiary,
            borderColor: COLORS.border.main,
          }}
        />
      </div>

      {/* Lista de purchases */}
      {filteredPurchases.length === 0 ? (
        <div
          className="rounded-lg border p-8 text-center"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            {searchQuery
              ? `No se encontraron compras con "${searchQuery}"`
              : "No hay compras con este filtro"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-semibold" style={{ color: COLORS.text.secondary }}>
            {filteredPurchases.length} {filteredPurchases.length === 1 ? "compra" : "compras"}
          </p>
          {filteredPurchases.map((purchase) => (
            <PurchaseCardCompact key={purchase.id} purchase={purchase} />
          ))}
        </div>
      )}
    </div>
  );
}
