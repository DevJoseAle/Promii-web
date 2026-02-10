"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redirectForRole } from "@/lib/auth/redirects";
import { ProfileRole } from "@/config/types/profile";
import { ToastService } from "@/lib/toast/toast.service";
import { supabase } from "@/lib/supabase/supabase.client";
import { COLORS } from "@/config/colors";

export default function SignInPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wrongRoleRedirect, setWrongRoleRedirect] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setWrongRoleRedirect(null);

    try {
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "").trim();

      // 1. Primero intentar hacer login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error("Auth error:", authError);

        if (authError.message.includes("Invalid login credentials")) {
          setError("Email o contraseña incorrectos.");
          ToastService.showErrorToast("Credenciales incorrectas");
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Debes confirmar tu email antes de iniciar sesión.");
          ToastService.showErrorToast("Email no confirmado");
        } else {
          setError(authError.message);
          ToastService.showErrorToast("Error al iniciar sesión");
        }
        return;
      }

      if (!authData.user) {
        setError("No se pudo obtener información del usuario");
        return;
      }

      // 2. Obtener el perfil del usuario para verificar su rol
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError) {
        setError("Error al verificar el perfil del usuario");
        console.error("Profile error:", profileError);
        return;
      }

      // 3. Verificar que el rol sea "user"
      if (profile.role !== ProfileRole.User) {
        // Cerrar la sesión que acabamos de abrir
        await supabase.auth.signOut();

        // Determinar a dónde redirigir según el rol
        if (profile.role === ProfileRole.Merchant) {
          setWrongRoleRedirect("/business/sign-in");
          setError("Eres un comercio. Por favor usa el portal de negocios.");
          ToastService.showErrorToast("Usa el portal de negocios para acceder");
        } else if (profile.role === ProfileRole.Influencer) {
          setWrongRoleRedirect("/inf/sign-in");
          setError("Eres un influencer. Por favor usa el portal de influencers.");
          ToastService.showErrorToast("Usa el portal de influencers para acceder");
        } else {
          setError("Tipo de usuario no válido para este portal");
        }
        return;
      }

      // 4. Si todo está bien, redirigir al home
      ToastService.showSuccessToast("¡Bienvenido!");
      router.push("/");
      router.refresh();

    } catch (error) {
      console.error("Sign-in error:", error);
      setError("Error inesperado al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Bienvenido a Promii"
      subtitle="Encuentra promos verificadas, paga directo al comercio y canjea con tu código."
      badgeText="Promii · Clientes"
    >
      <AuthCard heading="Acceder" subheading="Ingresa con tu email y contraseña">
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          onSubmit(formData);
        }} className="space-y-3">
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="password" type="password" placeholder="Contraseña" required />

          {error && (
            <div className="text-sm text-danger font-bold" style={{ color: "#C42300" }}>
              {error}
            </div>
          )}

          {wrongRoleRedirect ? (
            <Button
              disabled={loading}
              className="w-full bg-primary text-white hover:bg-primary/90"
              asChild
              style={{ marginBottom: "1rem", backgroundColor: COLORS.bluePrimary }}
            >
              <Link href={wrongRoleRedirect}>
                {wrongRoleRedirect === "/business/sign-in"
                  ? "Ir al portal de negocios"
                  : "Ir al portal de influencers"}
              </Link>
            </Button>
          ) : (
            <Button
              disabled={loading}
              className="w-full bg-primary text-white hover:bg-primary/90"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          )}

          <div className="flex items-center justify-between text-sm">
            <Link className="text-text-secondary hover:text-primary" href="/auth/sign-up">
              Crear cuenta
            </Link>
            <Link className="text-text-secondary hover:text-primary" href="/auth/forgot-password">
              Olvidé mi contraseña
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
