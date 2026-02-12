"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserDashboardTabs } from "@/components/user-dashboard/user-dashboard-tabs";
import { COLORS } from "@/config/colors";

export default function ProfilePage() {
  const { profile, loading, isUser } = useAuth();
  const router = useRouter();

  // Redirect si no es usuario o no está autenticado
  useEffect(() => {
    if (loading) return;

    if (!profile) {
      router.replace("/auth/sign-in");
      return;
    }

    if (!isUser) {
      // Si es merchant o influencer, redirigir a su dashboard
      if (profile.role === "merchant") {
        router.replace("/business/dashboard");
      } else if (profile.role === "influencer") {
        router.replace("/inf/dashboard");
      } else {
        router.replace("/");
      }
    }
  }, [loading, profile, isUser, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
            style={{ color: COLORS.primary.main }}
          />
          <p className="mt-4 text-sm" style={{ color: COLORS.text.secondary }}>
            Cargando perfil...
          </p>
        </div>
      </div>
    );
  }

  // Si no es usuario, mostrar loading mientras redirige
  if (!isUser || !profile) {
    return null;
  }

  // Obtener nombre para el saludo
  const firstName = profile.first_name || "Usuario";

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: COLORS.background.secondary }}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header con saludo */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: COLORS.text.primary }}
          >
            👋 Hola, {firstName}
          </h1>
          <p className="mt-2 text-base" style={{ color: COLORS.text.secondary }}>
            Gestiona tus cupones, historial y favoritos
          </p>
        </div>

        {/* Tabs con contenido */}
        <UserDashboardTabs userId={profile.id} />
      </div>
    </div>
  );
}
