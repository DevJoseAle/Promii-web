"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AuthBootstrap } from "@/components/auth/auth-bootstrap";
import { useAuthStore } from "@/lib/stores/auth/authStore";
import { FullscreenLoading } from "../ui/FullScreenLoading";

export default function BusinessPortalGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const hydrated = useAuthStore((s) => s._hasHydrated);
  const status = useAuthStore((s) => s.status);
  const profile = useAuthStore((s) => s.profile);

  const loading = !hydrated || status === "loading";

  React.useEffect(() => {
    if (loading) return;

    // 1) No auth -> sign in
    if (status !== "authenticated") {
      router.replace("/business/sign-in");
      return;
    }

    // 2) Sin profile -> apply (o puedes esperar un poco si quieres)
    if (!profile) {
      // si quieres: router.replace("/business/sign-in");
      return;
    }

    // 3) Role
    if (profile.role !== "merchant") {
      router.replace("/business/apply");
      return;
    }

    // 4) States
    if (profile.state === "blocked") router.replace("/business/blocked");
    else if (profile.state === "rejected") router.replace("/business/rejected");
  }, [loading, status, profile, router]);
console.log({loading, status, profile, router});
  return (
    <>
      {/* Bootstrap una vez en esta rama /business */}
      <AuthBootstrap />

      <FullscreenLoading show={loading} label="Cargando portal…" />

      {/* Mientras profile llega, bloquea para evitar flashes */}
      {!loading && status === "authenticated" && profile ? children : null}
    </>
  );
}
