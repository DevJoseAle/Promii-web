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

  return {
    loading,
    session,
    user,
    profile,
    refreshProfile,
    signOut,
    isAuthenticated: status === "authenticated",
    status,
    existSession
  };
}

// ═══════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const initialize = useAuthStore((s) => s.initialize);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Inicializar listener
    initAuthListener();
  }, []);

  // Inicializar después de hidratar
  useEffect(() => {
    if (hasHydrated) {
      initialize();
    }
  }, [hasHydrated, initialize]);

  return <>{children}</>;
}