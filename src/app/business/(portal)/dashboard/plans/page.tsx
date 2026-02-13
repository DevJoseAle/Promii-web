import { COLORS } from "@/config/colors";
import { PricingSection } from "@/components/pricing/pricing-section";

export default function MerchantPlansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
          Planes y Precios
        </h1>
        <p className="text-sm mt-1" style={{ color: COLORS.text.secondary }}>
          Elige el plan ideal para tu negocio
        </p>
      </div>
      <PricingSection />
    </div>
  );
}
