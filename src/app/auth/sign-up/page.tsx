"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { COLORS } from "@/config/colors";
import { UserRole } from "@/config/types/user";
import { signUpUser } from "@/lib/auth/auth.service.client";
import { Mail, Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function SignUpUserPage() {
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) return setError("Ingresa tu email.");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirm) return setError("Las contraseñas no coinciden.");

    setLoading(true);

    const res = await signUpUser({ email, password, role: UserRole.USER });

    setLoading(false);

    if (res.status === "error") {
      setError(res.message ?? res.error);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: COLORS.background.secondary }}>
        <div
          className="w-full max-w-md p-8 rounded-xl border shadow-lg text-center"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div
            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: COLORS.success.lighter }}
          >
            <CheckCircle className="w-8 h-8" style={{ color: COLORS.success.main }} />
          </div>

          <h1 className="text-2xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
            ¡Cuenta Creada!
          </h1>

          <p className="text-sm mb-6" style={{ color: COLORS.text.secondary }}>
            Te hemos enviado un correo de confirmación a:
          </p>

          <div
            className="px-4 py-3 rounded-lg mb-6 font-medium"
            style={{ backgroundColor: COLORS.primary.lighter, color: COLORS.primary.main }}
          >
            {email}
          </div>

          <div
            className="p-4 rounded-lg mb-6 text-left"
            style={{ backgroundColor: COLORS.background.secondary }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: COLORS.text.primary }}>
              Próximos pasos:
            </p>
            <ol className="text-sm space-y-2" style={{ color: COLORS.text.secondary }}>
              <li>1. Revisa tu bandeja de entrada</li>
              <li>2. Haz click en el enlace de confirmación</li>
              <li>3. Inicia sesión y comienza a disfrutar de Promii</li>
            </ol>
          </div>

          <p className="text-xs mb-4" style={{ color: COLORS.text.tertiary }}>
            Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
          </p>

          <Link
            href="/"
            className="inline-block w-full px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: COLORS.primary.main,
              color: "white",
            }}
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: COLORS.background.secondary }}>
      <div
        className="w-full max-w-md p-8 rounded-xl border shadow-lg"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold" style={{ color: COLORS.text.primary }}>
            Crear Cuenta
          </h1>
          <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
            Regístrate para comprar Promiis y disfrutar de descuentos exclusivos
          </p>
        </div>

        {/* Info Box */}
        <div
          className="mb-6 p-4 rounded-lg border-l-4"
          style={{
            backgroundColor: COLORS.primary.lighter,
            borderLeftColor: COLORS.primary.main,
          }}
        >
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: COLORS.primary.main }} />
            <div className="text-sm" style={{ color: COLORS.text.secondary }}>
              <p className="font-semibold mb-1" style={{ color: COLORS.text.primary }}>
                Verificación por email
              </p>
              <p>
                Recibirás un correo de confirmación. Haz click en el enlace para activar tu cuenta.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                className="w-full pl-10 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: COLORS.border.main,
                  color: COLORS.text.primary,
                }}
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: COLORS.text.tertiary }} />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                className="w-full pl-10 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: COLORS.border.main,
                  color: COLORS.text.primary,
                }}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: COLORS.text.tertiary }} />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                className="w-full pl-10 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: COLORS.border.main,
                  color: COLORS.text.primary,
                }}
                placeholder="Repite tu contraseña"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: COLORS.text.tertiary }} />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="p-3 rounded-lg flex items-start gap-3"
              style={{
                backgroundColor: COLORS.error.lighter,
                borderColor: COLORS.error.main,
              }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.error.main }} />
              <p className="text-sm" style={{ color: COLORS.error.main }}>
                {error}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            style={{
              backgroundColor: COLORS.primary.main,
              color: "white",
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creando cuenta...</span>
              </>
            ) : (
              "Crear Cuenta"
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-6 text-center text-sm" style={{ color: COLORS.text.secondary }}>
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/auth/sign-in"
            className="font-medium hover:underline"
            style={{ color: COLORS.primary.main }}
          >
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
