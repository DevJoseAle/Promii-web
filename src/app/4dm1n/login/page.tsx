"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/supabase.admin.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COLORS } from "@/config/colors";
import { Mail, Lock, AlertCircle, Loader2, Shield } from "lucide-react";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Login con Supabase (cliente admin independiente)
      const { error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) {
        setError("Email o contraseña incorrectos");
        setLoading(false);
        return;
      }

      // 2. Login exitoso - redirigir con reload completo
      console.log("✅ Login exitoso, redirigiendo con reload...");

      // Esperar un momento para que las cookies se guarden
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Forzar reload completo de la página para que authStore se sincronice
      window.location.replace("/admin");
    } catch (err) {
      console.error("Error en login admin:", err);
      setError("Error inesperado. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${COLORS.primary.dark} 0%, ${COLORS.primary.main} 100%)`,
      }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl border shadow-2xl"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div
              className="flex items-center justify-center size-16 rounded-2xl"
              style={{ backgroundColor: COLORS.primary.lighter }}
            >
              <Shield className="size-8" style={{ color: COLORS.primary.main }} />
            </div>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
            Panel Administrativo
          </h1>
          <p className="text-sm mt-2" style={{ color: COLORS.text.secondary }}>
            Acceso restringido solo para administradores
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
                style={{ color: COLORS.text.tertiary }}
              />
              <Input
                id="email"
                type="email"
                placeholder="admin@promii.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 pl-11"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: COLORS.border.main,
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
              Contraseña
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
                style={{ color: COLORS.text.tertiary }}
              />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 pl-11"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: COLORS.border.main,
                }}
              />
            </div>
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
                Verificando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Shield className="size-5" />
                Acceder al Panel
              </span>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
            Si no tienes acceso, contacta al administrador principal
          </p>
        </div>
      </div>
    </div>
  );
}
