
"use client";

import * as React from "react";
import { MerchantSidebar } from "./merchant-sidebar";

export function MerchantShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <MerchantSidebar />
      <main className="lg:pl-[280px]">
        <div className="px-4 py-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
