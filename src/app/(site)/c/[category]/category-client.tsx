"use client";

import { Promii, PromiiCard } from "@/components/ui/promii-card";
import { COLORS } from "@/config/colors";
import { TrendingUp } from "lucide-react";

type Props = {
  categoryLabel: string;
  promiis: Promii[];
};

export default function CategoryFeatured({ categoryLabel, promiis }: Props) {
  return (
    <section
      className="rounded-2xl border p-8"
      style={{
        backgroundColor: COLORS.background.secondary,
        borderColor: COLORS.border.light,
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="flex size-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: COLORS.success.lighter, color: COLORS.success.main }}
        >
          <TrendingUp className="size-5" />
        </div>
        <div>
          <h2
            className="text-xl font-bold"
            style={{ color: COLORS.text.primary }}
          >
            Destacados en {categoryLabel}
          </h2>
          <p
            className="text-sm"
            style={{ color: COLORS.text.secondary }}
          >
            Los promiis más populares de esta categoría
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {promiis.map((p) => (
          <PromiiCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}
