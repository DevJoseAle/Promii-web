"use client";

import { useState, useEffect } from "react";
import { BarChart3, Clock, Users, UserCircle, Sparkles, DollarSign, Wrench, ShoppingBag } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { COLORS } from "@/config/colors";
import { OverviewTab } from "./tabs/overview-tab";
import { RequestsTab } from "./tabs/requests-tab";
import { MyMerchantsTab } from "./tabs/my-merchants-tab";
import { MyPromiisTab } from "./tabs/my-promiis-tab";
import { ProfileTab } from "./tabs/profile-tab";
import { EarningsTab } from "./tabs/earnings-tab";
import { ToolsTab } from "./tabs/tools-tab";
import { MyCouponsTab } from "@/components/user-dashboard/my-coupons-tab";
import { PurchaseHistoryTab } from "@/components/user-dashboard/purchase-history-tab";

type TabId = "overview" | "requests" | "merchants" | "promiis" | "earnings" | "tools" | "purchases" | "profile";

type Tab = {
  id: TabId;
  label: string;
  icon: React.ElementType;
};

const TABS: Tab[] = [
  { id: "overview", label: "Resumen", icon: BarChart3 },
  { id: "requests", label: "Solicitudes", icon: Clock },
  { id: "merchants", label: "Mis Marcas", icon: Users },
  { id: "promiis", label: "Mis Promiis", icon: Sparkles },
  { id: "earnings", label: "Ganancias", icon: DollarSign },
  { id: "tools", label: "Herramientas", icon: Wrench },
  { id: "purchases", label: "Mis Compras", icon: ShoppingBag },
  { id: "profile", label: "Mi Perfil", icon: UserCircle },
];

export default function InfluencerDashboardPage() {
  const { profile } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(tabParam || "overview");

  // Update active tab when URL changes
  useEffect(() => {
    if (tabParam && TABS.some(tab => tab.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p style={{ color: COLORS.text.secondary }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab influencerId={profile.id} />}
      {activeTab === "requests" && <RequestsTab influencerId={profile.id} />}
      {activeTab === "merchants" && <MyMerchantsTab influencerId={profile.id} />}
      {activeTab === "promiis" && <MyPromiisTab influencerId={profile.id} />}
      {activeTab === "earnings" && <EarningsTab influencerId={profile.id} />}
      {activeTab === "tools" && <ToolsTab influencerId={profile.id} />}
      {activeTab === "purchases" && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: COLORS.text.primary }}>
              Mis Compras
            </h2>
            <p className="text-sm mb-6" style={{ color: COLORS.text.secondary }}>
              Tus promiis comprados como consumidor
            </p>
            <MyCouponsTab userId={profile.id} />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: COLORS.text.primary }}>
              Historial de Compras
            </h2>
            <p className="text-sm mb-6" style={{ color: COLORS.text.secondary }}>
              Todas tus compras y su estado actual
            </p>
            <PurchaseHistoryTab userId={profile.id} />
          </div>
        </div>
      )}
      {activeTab === "profile" && <ProfileTab influencerId={profile.id} />}
    </div>
  );
}
