import { InfluencerShell } from "@/components/ui/influencer/influencer-shell";
import { COLORS } from "@/config/colors";

export default function InfluencerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InfluencerShell>
      {/* Content canvas */}
      <div
        className="rounded-2xl border p-6 shadow-sm"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        {children}
      </div>
    </InfluencerShell>
  );
}
