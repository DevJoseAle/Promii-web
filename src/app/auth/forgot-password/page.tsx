"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastService } from "@/lib/toast/toast.service";
import { requestPasswordReset } from "@/lib/auth/auth.service.client";
import { COLORS } from "@/config/colors";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  async function onSubmit(formData: FormData) {
    setLoading(true);

    try {
      const emailValue = String(formData.get("email") ?? "").trim();
      setEmail(emailValue);

      const response = await requestPasswordReset(emailValue);

      if (response.status === "success") {
        setSuccess(true);
        ToastService.showSuccessToast("Correo enviado con éxito");
      } else {
        ToastService.showErrorToast(response.error || "Error al enviar correo");
      }
    } catch (error) {
      console.error("[ForgotPassword] Error:", error);
      ToastService.showErrorToast("Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <AuthCard>
        {!success ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center justify-center size-16 rounded-full mb-4"
                style={{
                  backgroundColor: COLORS.primary.lighter,
                  color: COLORS.primary.main,
                }}
              >
                <Mail className="size-8" />
              </div>
              <h1
                className="text-2xl font-bold mb-2"
                style={{ color: COLORS.text.primary }}
              >
                ¿Olvidaste tu contraseña?
              </h1>
              <p
                className="text-sm"
                style={{ color: COLORS.text.secondary }}
              >
                Ingresa tu correo y te enviaremos un enlace para recuperarla
              </p>
            </div>

            {/* Form */}
            <form action={onSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: COLORS.text.primary }}
                >
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@correo.com"
                  required
                  className="h-11"
                  style={{
                    backgroundColor: COLORS.background.tertiary,
                    borderColor: COLORS.border.main,
                  }}
                />
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
                    Enviando...
                  </>
                ) : (
                  "Enviar enlace de recuperación"
                )}
              </Button>
            </form>

            {/* Back to login */}
            <div className="mt-6 text-center">
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:underline"
                style={{ color: COLORS.primary.main }}
              >
                <ArrowLeft className="size-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Success state */}
            <div className="text-center py-8">
              <div
                className="inline-flex items-center justify-center size-20 rounded-full mb-6"
                style={{
                  backgroundColor: COLORS.success.lighter,
                  color: COLORS.success.main,
                }}
              >
                <CheckCircle className="size-10" />
              </div>

              <h2
                className="text-2xl font-bold mb-3"
                style={{ color: COLORS.text.primary }}
              >
                ¡Correo enviado!
              </h2>

              <p
                className="text-sm mb-2"
                style={{ color: COLORS.text.secondary }}
              >
                Hemos enviado un enlace de recuperación a:
              </p>

              <p
                className="text-base font-semibold mb-6"
                style={{ color: COLORS.primary.main }}
              >
                {email}
              </p>

              <div
                className="rounded-lg border p-4 mb-6 text-left"
                style={{
                  backgroundColor: COLORS.info.lighter,
                  borderColor: COLORS.info.light,
                }}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: COLORS.info.dark }}
                >
                  <strong>Nota:</strong> Revisa tu bandeja de entrada y también la carpeta de spam.
                  El enlace expirará en 1 hora.
                </p>
              </div>

              <Link
                href="/auth/sign-in"
                className="inline-block px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  color: COLORS.text.primary,
                  border: `1px solid ${COLORS.border.main}`,
                }}
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </>
        )}
      </AuthCard>
    </AuthShell>
  );
}
