"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase.ssr";

type Profile = {
  id: string;
  role: "user" | "merchant" | "influencer" | "admin";
  state: "pending" | "approved" | "rejected" | "blocked";
};

export default function BusinessSignInPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setError("No se pudo obtener tu usuario. Intenta nuevamente.");
      setLoading(false);
      return;
    }

    // ✅ leemos profile real (no merchants)
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, role, state")
      .eq("id", userId)
      .maybeSingle<Profile>();

    if (profileErr) {
      setError(profileErr.message);
      setLoading(false);
      return;
    }

    // si no hay profile, manda a apply (o flujo de reparación)
    if (!profile) {
      router.push("/business/apply");
      router.refresh();
      return;
    }

    // si no es merchant, lo mandamos a apply (porque este portal es empresas)
    if (profile.role !== "merchant") {
      router.push("/business/apply");
      router.refresh();
      return;
    }

    // routing por state
    if (profile.state === "approved") router.push("/merchant");
    else if (profile.state === "pending") router.push("/business/pending");
    else if (profile.state === "rejected") router.push("/business/rejected");
    else router.push("/business/blocked");

    router.refresh();
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
