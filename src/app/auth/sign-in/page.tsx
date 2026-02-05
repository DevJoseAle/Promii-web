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

export default function SignInPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();
    console.log({email,password});
        // Get role from profiles
  
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("email", email)
      .maybeSingle();
      console.log({profile,profileError});

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      let error = new Error(profileError.message);
      throw error
    }

    if(profile?.role != ProfileRole.User){
      setError("Por favor usa el portal de negocios para acceder.");
      ToastService.showErrorToast("Por favor usa el portal de negocios para acceder.");
      throw new Error("Por favor usa el portal de negocios para acceder.");
    }
     const { data, error } = await supabase.auth.signInWithPassword({ email, password });
     console.log({data, error});
     if (error) {
       setError(error.message);
       setLoading(false);
       console.log(error);
       throw error;
     }
     console.log(data);
       router.push(redirectForRole(profile?.role));
       router.refresh();
    } catch (error) {
      console.error("Sign-in error:", error);
    }finally{
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
