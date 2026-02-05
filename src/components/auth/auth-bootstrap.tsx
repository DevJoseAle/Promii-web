"use client";

import * as React from "react";
import { initAuthListener, useAuthStore } from "@/lib/stores/auth/authStore";

export function AuthBootstrap() {
  const initialize = useAuthStore((s) => s.initialize);
  const hydrated = useAuthStore((s) => s._hasHydrated);

  React.useEffect(() => {
    initAuthListener();
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    initialize();
  }, [hydrated, initialize]);

  return null;
}
