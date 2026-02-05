"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/supabase.client"; // <-- tu client-only
import { ProfileRole } from "@/config/types/profile";

type ProfileCheck = {
  id: string;
  role: ProfileRole
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

      // 1) Validación previa por profile (opcional, pero útil)
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

      // 2) Login
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

      // 3) Determinar destino (usa el profileCheck si está)
      let destination = "/business/dashboard";
      if (profileCheck?.state === "blocked") destination = "/business/blocked";
      else if (profileCheck?.state === "rejected") destination = "/business/rejected";
      router.replace(destination);

      // Opcional: si quieres re-evaluar server components (no es necesario)
      // router.refresh();
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setError(err?.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Promii Empresas"
      subtitle="Crea promos, valida compras y haz crecer tu negocio. Las empresas requieren aprobación antes de publicar."
      badgeText="Portal · Promii Empresas"
    >
      <AuthCard heading="Acceso empresas" subheading="Entra a tu portal de negocio">
        <form onSubmit={onSubmit} className="space-y-3">
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="password" type="password" placeholder="Contraseña" required />

          {error ? <div className="text-sm text-danger">{error}</div> : null}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white hover:bg-primary/90"
          >
            {loading ? "Entrando..." : "Entrar al portal"}
          </Button>

          <div className="text-sm text-text-secondary">
            ¿Aún no estás aprobado?{" "}
            <Link className="font-semibold text-primary hover:underline" href="/business/apply">
              Solicita tu cuenta
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
