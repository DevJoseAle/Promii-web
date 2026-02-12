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
  const listenerInitialized = useRef(false);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  // ✅ SIMPLIFICADO: Solo iniciar listener después de hydrate
  // onAuthStateChange automáticamente dispara INITIAL_SESSION
  useEffect(() => {
    if (!hasHydrated) return;
    if (listenerInitialized.current) return;

    listenerInitialized.current = true;
    console.log("[AuthProvider] Hydrated, initializing listener");
    initAuthListener();
  }, [hasHydrated]);

  return <>{children}</>;
}