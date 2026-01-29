
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

export default function InfluencersSignInPage() {
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

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
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

    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("id, role, state")
      .eq("id", userId)
      .maybeSingle<Profile>();

    if (pErr) {
      setError(pErr.message);
      setLoading(false);
      return;
    }

    // Si no existe profile o no es influencer → aplica
    if (!profile || profile.role !== "influencer") {
      router.push("/influencers/apply");
      router.refresh();
      return;
    }

    // routing por state
    if (profile.state === "approved") router.push("/influencer");
    else if (profile.state === "pending") router.push("/influencers/pending");
    else if (profile.state === "rejected") router.push("/influencers/rejected");
    else router.push("/influencers/blocked");

    router.refresh();
  }

  return (
    <AuthShell
      title="Promii Influencers"
      subtitle="Gana comisión por cada compra con tu código. Requiere aprobación para evitar fraude."
      badgeText="Portal · Promii Influencers"
    >
      <AuthCard heading="Acceso influencers" subheading="Entra a tu portal de creador">
        <form onSubmit={onSubmit} className="space-y-3">
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="password" type="password" placeholder="Contraseña" required />

          {error ? <div className="text-sm text-danger">{error}</div> : null}

          <Button type="submit" disabled={loading} className="w-full bg-primary text-white hover:bg-primary/90">
            {loading ? "Entrando..." : "Entrar al portal"}
          </Button>

          <div className="text-sm text-text-secondary">
            ¿Aún no estás aprobado?{" "}
            <Link className="font-semibold text-primary hover:underline" href="/influencers/apply">
              Solicita tu cuenta
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
