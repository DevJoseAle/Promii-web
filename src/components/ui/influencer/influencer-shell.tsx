"use client";

import * as React from "react";
import { InfluencerSidebar } from "./influencer-sidebar";
import { COLORS } from "@/config/colors";

export function InfluencerShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-dvh"
      style={{ backgroundColor: COLORS.background.secondary }}
    >
      <InfluencerSidebar />
      <main className="lg:pl-[280px] transition-all duration-300">
        <div className="px-4 py-6 pb-20 lg:px-8 lg:py-8 lg:pb-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
