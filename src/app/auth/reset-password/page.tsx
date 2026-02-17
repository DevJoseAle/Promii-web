"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastService } from "@/lib/toast/toast.service";
import { updatePassword } from "@/lib/auth/auth.service.client";
import { supabase } from "@/lib/supabase/supabase.client";
import { COLORS } from "@/config/colors";
import { Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Validar / canjear el token al cargar la página
  useEffect(() => {
    handleTokenExchange();
  }, []);

  // Detectar cuando la contraseña se actualiza exitosamente
  useEffect(() => {
    if (!isUpdating) return;

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[ResetPassword] Auth event:", event);

      if (event === "USER_UPDATED" && isUpdating) {
        console.log("[ResetPassword] ✅ Contraseña actualizada, redirigiendo...");
        ToastService.showSuccessToast("Contraseña actualizada con éxito");

        setTimeout(() => {
          window.location.href = "/auth/sign-in?passwordReset=true";
        }, 800);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isUpdating]);

  async function handleTokenExchange() {
    setValidating(true);

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get("token") || searchParams.get("token_hash");
      const type = searchParams.get("type");

      console.log("[ResetPassword] URL params:", { token: token ? "present" : "missing", type });

      // Caso 1: Token en query params (formato de Supabase email template)
      if (token && type === "recovery") {
        console.log("[ResetPassword] Exchanging token for session...");

        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "recovery",
        });

        if (error) {
          console.error("[ResetPassword] verifyOtp error:", error);
          setIsValidToken(false);
          ToastService.showErrorToast("Enlace inválido o expirado");
          return;
        }

        console.log("[ResetPassword] ✅ Token exchanged successfully");
        setIsValidToken(true);
        return;
      }

      // Caso 2: Sin token en URL — verificar si ya hay sesión activa
      // (llegó desde el redirect de authStore via PASSWORD_RECOVERY event)
      const { data, error } = await supabase.auth.getSession();

      console.log("[ResetPassword] Session check:", {
        hasSession: !!data?.session,
        error: error?.message,
      });

      if (error || !data?.session) {
        console.error("[ResetPassword] No valid session or token found");
        setIsValidToken(false);
        ToastService.showErrorToast("Enlace inválido o expirado");
      } else {
        console.log("[ResetPassword] ✅ Active session found");
        setIsValidToken(true);
      }
    } catch (error) {
      console.error("[ResetPassword] Error:", error);
      setIsValidToken(false);
      ToastService.showErrorToast("Error al procesar el enlace");
    } finally {
      setValidating(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validaciones
    if (password.length < 8) {
      ToastService.showErrorToast("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      ToastService.showErrorToast("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    setIsUpdating(true);

    try {
      console.log("[ResetPassword] Iniciando actualización de contraseña...");

      // Llamar directamente a supabase.auth.updateUser sin esperar la promesa
      // porque el evento USER_UPDATED manejará el redirect
      supabase.auth.updateUser({
        password: password,
      }).then(({ error }) => {
        if (error) {
          console.error("[ResetPassword] ❌ Error:", error);
          ToastService.showErrorToast(error.message || "Error al actualizar contraseña");
          setLoading(false);
          setIsUpdating(false);
        }
        // Si no hay error, el evento USER_UPDATED manejará el redirect
      }).catch((error) => {
        console.error("[ResetPassword] ❌ Error inesperado:", error);
        ToastService.showErrorToast("Error inesperado");
        setLoading(false);
        setIsUpdating(false);
      });

    } catch (error) {
      console.error("[ResetPassword] ❌ Error inesperado:", error);
      ToastService.showErrorToast("Error inesperado");
      setLoading(false);
      setIsUpdating(false);
    }
  }

  // Loading state mientras valida el token
  if (validating) {
    return (
      <AuthShell>
        <AuthCard>
          <div className="text-center py-12">
            <Loader2
              className="size-12 mx-auto mb-4 animate-spin"
              style={{ color: COLORS.primary.main }}
            />
            <p className="text-sm" style={{ color: COLORS.text.secondary }}>
              Validando enlace...
            </p>
          </div>
        </AuthCard>
      </AuthShell>
    );
  }

  // Error state - token inválido
  if (!isValidToken) {
    return (
      <AuthShell>
        <AuthCard>
          <div className="text-center py-8">
            <div
              className="inline-flex items-center justify-center size-20 rounded-full mb-6"
              style={{
                backgroundColor: COLORS.error.lighter,
                color: COLORS.error.main,
              }}
            >
              <AlertCircle className="size-10" />
            </div>

            <h2
              className="text-2xl font-bold mb-3"
              style={{ color: COLORS.text.primary }}
            >
              Enlace inválido o expirado
            </h2>

            <p
              className="text-sm mb-6"
              style={{ color: COLORS.text.secondary }}
            >
              El enlace de recuperación ha expirado o ya fue utilizado.
              Por favor, solicita uno nuevo.
            </p>

            <Button
              onClick={() => router.push("/auth/forgot-password")}
              className="px-6 py-2 font-semibold transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
                color: COLORS.text.inverse,
              }}
            >
              Solicitar nuevo enlace
            </Button>
          </div>
        </AuthCard>
      </AuthShell>
    );
  }

  // Form para resetear contraseña
  return (
    <AuthShell blockNavigation={true}>
      <AuthCard>
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center size-16 rounded-full mb-4"
            style={{
              backgroundColor: COLORS.primary.lighter,
              color: COLORS.primary.main,
            }}
          >
            <Lock className="size-8" />
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: COLORS.text.primary }}
          >
            Crea tu nueva contraseña
          </h1>
          <p
            className="text-sm"
            style={{ color: COLORS.text.secondary }}
          >
            Ingresa una contraseña segura de al menos 8 caracteres
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Nueva contraseña */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold mb-2"
              style={{ color: COLORS.text.primary }}
            >
              Nueva contraseña
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 pr-12"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: COLORS.border.main,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: COLORS.text.tertiary }}
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold mb-2"
              style={{ color: COLORS.text.primary }}
            >
              Confirmar contraseña
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 pr-12"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: COLORS.border.main,
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: COLORS.text.tertiary }}
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
          </div>

          {/* Password requirements */}
          <div
            className="rounded-lg border p-3"
            style={{
              backgroundColor: COLORS.info.lighter,
              borderColor: COLORS.info.light,
            }}
          >
            <p
              className="text-xs"
              style={{ color: COLORS.info.dark }}
            >
              <strong>Requisitos:</strong> Mínimo 8 caracteres. Se recomienda usar
              mayúsculas, minúsculas, números y símbolos.
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 font-semibold transition-all hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
              color: COLORS.text.inverse,
            }}
          >
            {loading ? (
              <>
                <div className="size-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Actualizando...
              </>
            ) : (
              "Actualizar contraseña"
            )}
          </Button>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
