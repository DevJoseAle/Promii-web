"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redirectForRole } from "@/lib/auth/redirects";
import { supabase } from "@/lib/supabase";

export default function SignInPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Get role from profiles
    const userId = data.user?.id;
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    router.push(redirectForRole(profile?.role));
    router.refresh();
  }

  return (
    <AuthShell
      title="Bienvenido a Promii"
      subtitle="Encuentra promos verificadas, paga directo al comercio y canjea con tu código."
      badgeText="Promii · Clientes"
    >
      <AuthCard heading="Acceder" subheading="Ingresa con tu email y contraseña">
        <form action={onSubmit} className="space-y-3">
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="password" type="password" placeholder="Contraseña" required />

          {error ? <div className="text-sm text-danger">{error}</div> : null}

          <Button disabled={loading} className="w-full bg-primary text-white hover:bg-primary/90">
            {loading ? "Entrando..." : "Entrar"}
          </Button>

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
