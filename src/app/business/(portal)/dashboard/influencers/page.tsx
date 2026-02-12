"use client";

import { useState } from "react";
import { Search, Users, Clock } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { cn } from "@/lib/utils";
import { COLORS } from "@/config/colors";
import { SearchInfluencersTab } from "./tabs/search-influencers-tab";
import { MyInfluencersTab } from "./tabs/my-influencers-tab";
import { PendingRequestsTab } from "./tabs/pending-requests-tab";

type TabId = "search" | "my-influencers" | "pending";

type Tab = {
  id: TabId;
  label: string;
  icon: React.ElementType;
};

const TABS: Tab[] = [
  { id: "search", label: "Buscar Influencers", icon: Search },
  { id: "my-influencers", label: "Mis Influencers", icon: Users },
  { id: "pending", label: "Solicitudes Pendientes", icon: Clock },
];

export default function InfluencersPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("search");

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
          Influencers
        </h1>
        <p className="text-base" style={{ color: COLORS.text.secondary }}>
          Conecta con influencers para promocionar tus promiis
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
        {activeTab === "search" && <SearchInfluencersTab merchantId={profile.id} />}
        {activeTab === "my-influencers" && <MyInfluencersTab merchantId={profile.id} />}
        {activeTab === "pending" && <PendingRequestsTab merchantId={profile.id} />}
      </div>
    </div>
  );
}
