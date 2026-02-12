"use client"

import { ReactNode, useEffect } from "react";
import { CategoryNav } from "./category-nav";
import { MainHeader } from "./main-header";
import { TopBar } from "./top-bar";

import { AppFooter } from "./footer";
import { AuthProvider } from "@/lib/context/AuthContext";
import { AuthBootstrap } from "../auth/auth-bootstrap";
import { initAuthListener } from "@/lib/stores/auth/authStore";
import { COLORS } from "@/config/colors";

export function AppShell({ children }: { children: ReactNode }) {
  
  return (
    <div className="min-h-dvh" style={{ backgroundColor: COLORS.background.primary, color: COLORS.text.primary }}>
      <AuthBootstrap />

      <TopBar />
      <MainHeader />
      <CategoryNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
      <AppFooter />
    </div>
  );
}
