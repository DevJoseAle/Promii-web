// src/lib/store/AuthProvider.tsx
"use client";

import { useEffect, useRef } from "react";
import { useAuthStore, initAuthListener } from "../stores/auth/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Inicializar listener de auth (singleton)
    initAuthListener();

    // Inicializar estado
    initialize();
  }, [initialize]);

  return <>{children}</>;
}