import { MerchantShell } from "@/components/ui/merchant/merchant-shell";
import { PendingBanner } from "@/components/ui/pending-banner";
import { COLORS } from "@/config/colors";

export default function MerchantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MerchantShell>
      {/* Banner pending (si aplica) */}
      <PendingBanner />

      {/* Content canvas */}
      <div
        className="mt-6 rounded-2xl border p-6 shadow-sm"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        {children}
      </div>
    </MerchantShell>
  );
}
