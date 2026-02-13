import { PricingSection } from "@/components/pricing/pricing-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planes y Precios - Promii",
  description: "Publica tus promociones en Promii. Planes desde $17/mes para comercios en Venezuela.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <PricingSection />
    </div>
  );
}
