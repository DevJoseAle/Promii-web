"use client";

import Link from "next/link";
import { COLORS } from "@/config/colors";
import { Promii, PromiiCard } from "@/components/ui/promii-card";
import {
  ChevronRight,
  Home,
  SlidersHorizontal,
  Star,
  MapPin,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CategoryConfig } from "@/config/categories";

// Mock data - replace with real data later
const MOCK: Promii[] = [
  {
    id: "1",
    title: "Corte + barba + lavado premium",
    merchant: "Barbería Central",
    location: "Caracas · Chacao",
    rating: 4.8,
    sold: 1200,
    oldPrice: 30,
    price: 12,
    discountPct: 60,
    tag: "Mejor valorado",
  },
  {
    id: "2",
    title: "2x1 en pizzas artesanales",
    merchant: "La Trattoria",
    location: "Valencia · El Viñedo",
    rating: 4.6,
    sold: 800,
    oldPrice: 25,
    price: 10,
    discountPct: 60,
    tag: "Top",
  },
  {
    id: "3",
    title: "Spa: masaje + hidratación facial",
    merchant: "Serenity Spa",
    location: "Caracas · Las Mercedes",
    rating: 4.7,
    sold: 500,
    oldPrice: 50,
    price: 19,
    discountPct: 62,
    tag: "Más vendido",
  },
  {
    id: "4",
    title: "Menú ejecutivo 3 platos",
    merchant: "El Gourmet",
    location: "Caracas · Los Palos Grandes",
    rating: 4.5,
    sold: 350,
    oldPrice: 40,
    price: 15,
    discountPct: 62,
  },
  {
    id: "5",
    title: "Manicure + pedicure completo",
    merchant: "Beauty Salon",
    location: "Valencia · Centro",
    rating: 4.9,
    sold: 680,
    oldPrice: 35,
    price: 14,
    discountPct: 60,
  },
  {
    id: "6",
    title: "2 horas de escape room",
    merchant: "Mystery Lab",
    location: "Maracaibo · Norte",
    rating: 4.7,
    sold: 450,
    oldPrice: 45,
    price: 18,
    discountPct: 60,
  },
];

type Props = {
  category: CategoryConfig;
  subcategory: { key: string; label: string; href: string };
};

export default function SubcategoryClient({ category, subcategory }: Props) {
  const [showFilters, setShowFilters] = useState(false);

  const handleQuickFilter = (filterType: string) => {
    // TODO: Implement filter logic
    console.log(`Filtering by: ${filterType}`);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm flex-wrap">
        <Link
          href="/"
          className="transition-colors duration-200 hover:underline"
          style={{ color: COLORS.text.secondary }}
        >
          <Home className="size-4" />
        </Link>
        <ChevronRight className="size-4" style={{ color: COLORS.text.tertiary }} />
        <Link
          href={category.href}
          className="transition-colors duration-200 hover:underline"
          style={{ color: COLORS.text.secondary }}
        >
          {category.label}
        </Link>
        <ChevronRight className="size-4" style={{ color: COLORS.text.tertiary }} />
        <span style={{ color: COLORS.text.primary }} className="font-semibold">
          {subcategory.label}
        </span>
      </nav>

      {/* Header */}
      <div>
        <h1
          className="text-2xl md:text-3xl font-bold tracking-tight"
          style={{ color: COLORS.text.primary }}
        >
          {subcategory.label}
        </h1>
        <p
          className="text-sm mt-2"
          style={{ color: COLORS.text.secondary }}
        >
          {MOCK.length} promociones disponibles en {subcategory.label.toLowerCase()}
        </p>
      </div>

      {/* Filters bar */}
      <div
        className="flex items-center gap-3 flex-wrap rounded-xl border p-4"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="font-semibold transition-all duration-200"
          style={{
            borderColor: COLORS.border.main,
            color: COLORS.text.primary,
          }}
        >
          <SlidersHorizontal className="size-4 mr-2" />
          Filtros
        </Button>

        <div className="h-6 w-px" style={{ backgroundColor: COLORS.border.main }} />

        {/* Quick filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleQuickFilter('best-rated')}
            className="rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: COLORS.primary.lighter,
              color: COLORS.primary.dark,
            }}
          >
            <Star className="size-3.5 inline mr-1" />
            Mejor valorados
          </button>

          <button
            onClick={() => handleQuickFilter('near-me')}
            className="rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: COLORS.background.tertiary,
              color: COLORS.text.primary,
              border: `1px solid ${COLORS.border.main}`,
            }}
          >
            <MapPin className="size-3.5 inline mr-1" />
            Cerca de mí
          </button>

          <button
            onClick={() => handleQuickFilter('price-low-high')}
            className="rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: COLORS.background.tertiary,
              color: COLORS.text.primary,
              border: `1px solid ${COLORS.border.main}`,
            }}
          >
            <DollarSign className="size-3.5 inline mr-1" />
            Precio: bajo a alto
          </button>
        </div>
      </div>

      {/* Filters panel (collapsible) */}
      {showFilters && (
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: COLORS.background.secondary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="grid gap-6 md:grid-cols-3">
            {/* Price range */}
            <div>
              <label
                className="text-sm font-semibold mb-3 block"
                style={{ color: COLORS.text.primary }}
              >
                Rango de precio
              </label>
              <div className="space-y-2">
                {["$0 - $10", "$10 - $20", "$20 - $50", "$50+"].map((range) => (
                  <label key={range} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="size-4 rounded"
                      style={{ accentColor: COLORS.primary.main }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: COLORS.text.secondary }}
                    >
                      {range}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Discount */}
            <div>
              <label
                className="text-sm font-semibold mb-3 block"
                style={{ color: COLORS.text.primary }}
              >
                Descuento mínimo
              </label>
              <div className="space-y-2">
                {["30%", "40%", "50%", "60%+"].map((discount) => (
                  <label key={discount} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="size-4 rounded"
                      style={{ accentColor: COLORS.primary.main }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: COLORS.text.secondary }}
                    >
                      {discount}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <label
                className="text-sm font-semibold mb-3 block"
                style={{ color: COLORS.text.primary }}
              >
                Calificación
              </label>
              <div className="space-y-2">
                {["4.5+", "4.0+", "3.5+", "3.0+"].map((rating) => (
                  <label key={rating} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="size-4 rounded"
                      style={{ accentColor: COLORS.primary.main }}
                    />
                    <span
                      className="text-sm flex items-center gap-1"
                      style={{ color: COLORS.text.secondary }}
                    >
                      <Star className="size-3.5 fill-current" style={{ color: COLORS.warning.main }} />
                      {rating}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {MOCK.map((p) => (
            <PromiiCard key={p.id} p={p} />
          ))}
        </div>

        {/* Load more */}
        <div className="mt-8 flex justify-center">
          <Button
            className="font-semibold transition-all duration-200 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
              color: COLORS.text.inverse,
            }}
          >
            Cargar más promociones
          </Button>
        </div>
      </section>
    </div>
  );
}
