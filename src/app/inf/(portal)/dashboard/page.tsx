"use client";

import { useState } from "react";
import { BarChart3, Clock, Users, UserCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { cn } from "@/lib/utils";
import { COLORS } from "@/config/colors";
import { OverviewTab } from "./tabs/overview-tab";
import { RequestsTab } from "./tabs/requests-tab";
import { MyMerchantsTab } from "./tabs/my-merchants-tab";
import { MyPromiisTab } from "./tabs/my-promiis-tab";
import { ProfileTab } from "./tabs/profile-tab";

type TabId = "overview" | "requests" | "merchants" | "promiis" | "profile";

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
  { id: "profile", label: "Mi Perfil", icon: UserCircle },
];

export default function InfluencerDashboardPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p style={{ color: COLORS.text.secondary }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
          Dashboard de Influencer
        </h1>
        <p className="text-base" style={{ color: COLORS.text.secondary }}>
          Gestiona tus colaboraciones y códigos de referido
        </p>
      </div>

      {/* Tabs Navigation */}
      <div
        className="border-b"
        style={{ borderColor: COLORS.border.light }}
      >
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "group inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "border-current"
                    : "border-transparent hover:border-gray-300"
                )}
                style={{
                  color: isActive ? COLORS.primary.main : COLORS.text.secondary,
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "size-5 transition-transform group-hover:scale-110",
                    isActive && "animate-pulse"
                  )}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === "overview" && <OverviewTab influencerId={profile.id} />}
        {activeTab === "requests" && <RequestsTab influencerId={profile.id} />}
        {activeTab === "merchants" && <MyMerchantsTab influencerId={profile.id} />}
        {activeTab === "promiis" && <MyPromiisTab influencerId={profile.id} />}
        {activeTab === "profile" && <ProfileTab influencerId={profile.id} />}
      </div>
    </div>
  );
}
