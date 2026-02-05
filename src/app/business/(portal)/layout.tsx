import BusinessPortalGate from "@/components/layout/business-portal-gate";

export default function BusinessPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BusinessPortalGate>{children}</BusinessPortalGate>;
}
