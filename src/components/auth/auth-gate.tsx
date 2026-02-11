"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth/authStore";
import { FullscreenLoading } from "../ui/FullScreenLoading";
import { ProfileRole } from "@/config/types/profile";

export function AuthGate({
  children,
  roles,
  redirectTo = "/auth/sign-in",
}: {
  children: React.ReactNode;
  roles?: ProfileRole[];
  redirectTo?: string;
}) {
  const router = useRouter();

  const hydrated = useAuthStore((s) => s._hasHydrated);
  const status = useAuthStore((s) => s.status);
  const profile = useAuthStore((s) => s.profile);

  const loading = !hydrated || status === "loading";

  React.useEffect(() => {
    if (loading) return;

    if (status !== "authenticated") {
      router.replace(redirectTo);
      return;
    }

    if (roles?.length && profile?.role && !roles.includes(profile.role)) {
      router.replace("/");
      return;
    }
  }, [loading, status, profile?.role, roles, redirectTo, router]);

  return (
    <>
      <FullscreenLoading show={loading} label="Cargando sesión…" />
      {!loading ? children : null}
    </>
  );
}
