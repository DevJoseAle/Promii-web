"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/supabase.client";
import { ProfileRole } from "@/config/types/profile";
import { COLORS } from "@/config/colors";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

type ProfileCheck = {
  id: string;
  role: ProfileRole;
  state: "pending" | "approved" | "rejected" | "blocked";
};

export default function BusinessSignInPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "").trim();

      // Validación previa por profile
      const { data: profileCheck, error: profileCheckErr } = await supabase
        .from("profiles")
        .select("id, role, state")
        .eq("email", email)
        .maybeSingle<ProfileCheck>();

      if (profileCheckErr) {
        setError("Error verificando tu cuenta. Intenta nuevamente.");
        return;
      }

      if (profileCheck) {
        if (profileCheck.role !== ProfileRole.Merchant) {
          setError(
            "Esta cuenta no tiene permisos de empresa. Ingresa desde el módulo de usuarios."
          );
          return;
        }

        if (profileCheck.state === "blocked") {
          setError("Tu cuenta de empresa ha sido bloqueada. Contacta soporte.");
          return;
        }

        if (profileCheck.state === "rejected") {
          setError("Tu solicitud de empresa fue rechazada. Contacta soporte.");
          return;
        }
      }

      // Login
      const { data, error: signInError } = await supabase.auth.signInWithPassword(
        { email, password }
      );

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Credenciales incorrectas. Verifica tu email y contraseña.");
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Debes confirmar tu email antes de iniciar sesión.");
        } else {
          setError(signInError.message);
        }
        return;
      }

      // Determinar destino
      let destination = "/business/dashboard";
      if (profileCheck?.state === "blocked") destination = "/business/blocked";
      else if (profileCheck?.state === "rejected") destination = "/business/rejected";
      router.replace(destination);
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setError(err?.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Acceso Empresas"
      subtitle="Entra a tu portal de negocio y gestiona tus promociones"
      badgeText="Portal · Promii Empresas"
      variant="business"
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Email field */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-semibold"
            style={{ color: COLORS.text.primary }}
          >
            Email
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
              style={{ color: COLORS.text.tertiary }}
            />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              className="h-11 pl-11"
              style={{
                backgroundColor: COLORS.background.tertiary,
                borderColor: COLORS.border.main,
              }}
            />
          </div>
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-semibold"
            style={{ color: COLORS.text.primary }}
          >
            Contraseña
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
              style={{ color: COLORS.text.tertiary }}
            />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="h-11 pl-11"
              style={{
                backgroundColor: COLORS.background.tertiary,
                borderColor: COLORS.border.main,
              }}
            />
          </div>
        </div>

        {/* Forgot password link */}
        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm font-semibold transition-colors duration-200 hover:underline"
            style={{ color: COLORS.primary.main }}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="flex items-start gap-3 rounded-lg border p-4"
            style={{
              backgroundColor: COLORS.error.lighter,
              borderColor: COLORS.error.light,
            }}
          >
            <AlertCircle className="size-5 shrink-0 mt-0.5" style={{ color: COLORS.error.main }} />
            <div className="text-sm" style={{ color: COLORS.error.dark }}>
              {error}
            </div>
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 font-semibold text-base transition-all duration-200 hover:scale-[1.02] disabled:scale-100"
          style={{
            background: loading
              ? COLORS.text.tertiary
              : `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
            color: COLORS.text.inverse,
          }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-5 animate-spin" />
              Entrando...
            </span>
          ) : (
            "Entrar al Portal"
          )}
        </Button>

        {/* Divider */}
        <div className="relative py-4">
          <div
            className="absolute inset-0 flex items-center"
            style={{ borderTop: `1px solid ${COLORS.border.light}` }}
          />
          <div className="relative flex justify-center">
            <span
              className="bg-white px-4 text-xs font-medium"
              style={{ color: COLORS.text.tertiary, backgroundColor: COLORS.background.primary }}
            >
              ¿Primera vez?
            </span>
          </div>
        </div>

        {/* Sign up link */}
        <div
          className="rounded-lg border p-4 text-center"
          style={{
            backgroundColor: COLORS.background.secondary,
            borderColor: COLORS.border.light,
          }}
        >
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            ¿Aún no tienes cuenta?{" "}
            <Link
              href="/business/apply"
              className="font-semibold transition-colors duration-200 hover:underline"
              style={{ color: COLORS.primary.main }}
            >
              Solicita tu cuenta empresarial
            </Link>
          </p>
          <p className="mt-2 text-xs" style={{ color: COLORS.text.tertiary }}>
            Las cuentas empresariales requieren aprobación para proteger a los usuarios
          </p>
        </div>
      </form>
    </AuthShell>
  );
}
