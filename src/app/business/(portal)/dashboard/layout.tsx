import { MerchantSidebar } from "@/components/ui/merchant/merchant-sidebar";
import { PendingBanner } from "@/components/ui/pending-banner";


export default function MerchantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="flex min-h-screen">
        {/* Sidebar izquierda full height */}
        <MerchantSidebar />

        {/* Content */}
        <main className="flex-1">
          {/* Top spacing + container */}
          <div className="mx-auto w-full max-w-6xl px-5 py-6">
            {/* Banner pending (si aplica) */}
            <PendingBanner />

            {/* Content canvas */}
            <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
