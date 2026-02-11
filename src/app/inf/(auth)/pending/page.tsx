"use client";

import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/AuthContext";
import { COLORS } from "@/config/colors";
import { Clock, CheckCircle2, MessageCircle, Home, Sparkles } from "lucide-react";

export default function InfluencersPendingPage() {
  const { profile } = useAuth();

  return (
    <AuthShell
      title="Solicitud en Revisión"
      subtitle="Tu solicitud está siendo revisada por nuestro equipo. Te notificaremos cuando esté aprobada."
      badgeText="Revisión · Promii Influencers"
      variant="influencer"
    >
      <div className="space-y-6">
        {/* Status card */}
        <div
          className="rounded-xl border p-8 text-center"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary.lighter} 0%, ${COLORS.background.primary} 100%)`,
            borderColor: COLORS.border.light,
          }}
        >
          {/* Decorative element */}
          <div
            className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full shadow-lg"
            style={{
              backgroundColor: COLORS.background.primary,
              color: COLORS.warning.main,
            }}
          >
            <Clock className="size-10" />
          </div>

          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: COLORS.text.primary }}
          >
            Solicitud Recibida
          </h2>

          <p
            className="text-base mb-6 max-w-md mx-auto"
            style={{ color: COLORS.text.secondary }}
          >
            Tu solicitud ha sido enviada exitosamente. Estamos revisando tu perfil y te avisaremos por email cuando esté lista.
          </p>

          {/* Status badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold text-sm"
            style={{
              backgroundColor: COLORS.warning.lighter,
              color: COLORS.warning.dark,
            }}
          >
            <Sparkles className="size-4" />
            Estado: {profile?.state ?? "En revisión"}
          </div>
        </div>

        {/* Steps card */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <h3
            className="text-lg font-bold mb-4"
            style={{ color: COLORS.text.primary }}
          >
            ¿Qué sigue?
          </h3>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: COLORS.success.lighter, color: COLORS.success.main }}
              >
                <CheckCircle2 className="size-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1" style={{ color: COLORS.text.primary }}>
                  1. Solicitud enviada
                </div>
                <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                  Recibimos tu información y está en cola de revisión.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: COLORS.warning.lighter, color: COLORS.warning.main }}
              >
                <Clock className="size-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1" style={{ color: COLORS.text.primary }}>
                  2. Revisión del equipo
                </div>
                <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                  Validamos tu perfil, redes sociales y contenido (1-3 días hábiles).
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: COLORS.info.lighter, color: COLORS.info.main }}
              >
                <MessageCircle className="size-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1" style={{ color: COLORS.text.primary }}>
                  3. Te notificamos
                </div>
                <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                  Te enviamos un email cuando tu cuenta esté lista para usar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Help card */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: COLORS.background.secondary,
            borderColor: COLORS.border.light,
          }}
        >
          <h3
            className="text-base font-bold mb-2"
            style={{ color: COLORS.text.primary }}
          >
            ¿Necesitas ayuda?
          </h3>
          <p
            className="text-sm mb-4"
            style={{ color: COLORS.text.secondary }}
          >
            Si tienes dudas o necesitas acelerar tu solicitud, escríbenos por WhatsApp.
          </p>

          <Button
            className="w-full h-11 font-semibold transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: "#25D366",
              color: COLORS.text.inverse,
            }}
            asChild
          >
            <a
              href="https://wa.me/XXXXXXXXXXX"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="size-5 mr-2" />
              Hablar por WhatsApp
            </a>
          </Button>
        </div>

        {/* Back to home */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-200 hover:underline"
            style={{ color: COLORS.primary.main }}
          >
            <Home className="size-4" />
            Volver al home
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
