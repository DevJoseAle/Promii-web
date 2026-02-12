"use client";

import { useState } from "react";
import { Ticket, History, Settings, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLORS } from "@/config/colors";
import { MyCouponsTab } from "./my-coupons-tab";
import { PurchaseHistoryTab } from "./purchase-history-tab";
import { ProfileEditTab } from "./profile-edit-tab";
import { FavoritesTab } from "./favorites-tab";

type TabId = "coupons" | "history" | "profile" | "favorites";

type Tab = {
  id: TabId;
  label: string;
  icon: React.ElementType;
};

const TABS: Tab[] = [
  { id: "coupons", label: "Mis Cupones", icon: Ticket },
  { id: "history", label: "Historial", icon: History },
  { id: "profile", label: "Mis Datos", icon: Settings },
  { id: "favorites", label: "Favoritos", icon: Heart },
];

interface UserDashboardTabsProps {
  userId: string;
}

export function UserDashboardTabs({ userId }: UserDashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("coupons");

  return (
    <div>
      {/* Tabs navigation */}
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

      {/* Tab content */}
      <div className="mt-8">
        {activeTab === "coupons" && <MyCouponsTab userId={userId} />}

        {activeTab === "history" && <PurchaseHistoryTab userId={userId} />}

        {activeTab === "profile" && <ProfileEditTab />}

        {activeTab === "favorites" && <FavoritesTab userId={userId} />}
      </div>
    </div>
  );
}
