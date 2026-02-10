"use client";

import React, { useEffect, useRef } from "react";
import { Profile } from "../auth/auth.service.client";
import { useAuthStore, initAuthListener } from "../stores/auth/authStore";

// ═══════════════════════════════════════════════════════════════
// RE-EXPORT TYPES
// ═══════════════════════════════════════════════════════════════

export type { Profile };

// ═══════════════════════════════════════════════════════════════
// HOOK DE COMPATIBILIDAD
// ═══════════════════════════════════════════════════════════════

export function useAuth() {
  const status = useAuthStore((s) => s.status);
  const session = useAuthStore((s) => s.session);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const signOut = useAuthStore((s) => s.signOut);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const existSession = useAuthStore((s) => s.existSession);

  // Loading es true si no ha hidratado O si el status es loading
  const loading = !hasHydrated || status === "loading";
  const isMerchant = profile?.role === "merchant";
  const isInfluencer = profile?.role === "influencer";
  const isUser = profile?.role === "user";
  const isAuthenticated = !!profile;
  console.log({ isMerchant, isInfluencer, isUser, isAuthenticated });
  return {
    loading,
    session,
    user,
    profile,
    refreshProfile,
    signOut,
    isAuthenticated: status === "authenticated",
    status,
    existSession,
    isMerchant,
    isInfluencer,
    isUser,
  };
}

// ═══════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const listenerInitialized = useRef(false);
  const initialize = useAuthStore((s) => s.initialize);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  // Solo inicializar el listener UNA VEZ
  useEffect(() => {
    if (listenerInitialized.current) return;
    listenerInitialized.current = true;
    console.log("[AuthProvider] Initializing auth listener");
    initAuthListener();
  }, []);

  // Inicializar después de hidratar - SOLO UNA VEZ
  useEffect(() => {
    if (!hasHydrated) return;
    if (initialized.current) return;
    initialized.current = true;

    console.log("[AuthProvider] Initializing auth state");
    initialize();
  }, [hasHydrated, initialize]);

  return <>{children}</>;
}