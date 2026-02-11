import InfluencerPortalGate from "@/components/layout/influencer-portal-gate";

export default function InfluencerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InfluencerPortalGate>{children}</InfluencerPortalGate>;
}
