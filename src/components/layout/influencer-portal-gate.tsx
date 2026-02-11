"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth/authStore";
import { FullscreenLoading } from "../ui/FullScreenLoading";

export default function InfluencerPortalGate({
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

    console.log("[InfluencerPortalGate] Auth check:", { status, profile });

    // 1) No auth -> sign in
    if (status !== "authenticated") {
      console.log("[InfluencerPortalGate] Not authenticated, redirecting to sign-in");
      router.replace("/inf/sign-in");
      return;
    }

    // 2) Sin profile -> esperar
    if (!profile) {
      console.log("[InfluencerPortalGate] No profile, waiting...");
      return;
    }

    // 3) Role
    if (profile.role !== "influencer") {
      console.log("[InfluencerPortalGate] Not influencer, redirecting to apply");
      router.replace("/inf/apply");
      return;
    }

    // 4) States
    if (profile.state === "pending") {
      console.log("[InfluencerPortalGate] Influencer pending approval");
      router.replace("/inf/pending");
    } else if (profile.state === "blocked") {
      console.log("[InfluencerPortalGate] Influencer blocked");
      router.replace("/inf/blocked");
    } else if (profile.state === "rejected") {
      console.log("[InfluencerPortalGate] Influencer rejected");
      router.replace("/inf/rejected");
    }
  }, [loading, status, profile, router]);

  return (
    <>
      <FullscreenLoading show={loading} label="Cargando portal de influencer…" />

      {/* Mientras profile llega, bloquea para evitar flashes */}
      {!loading && status === "authenticated" && profile ? children : null}
    </>
  );
}
