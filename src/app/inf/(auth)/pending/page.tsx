"use client";

import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/AuthContext";

export default function InfluencersPendingPage() {
  const { profile } = useAuth();

  return (
    <AuthShell
      title="Promii Influencers"
      subtitle="Tu solicitud está en revisión. Te avisaremos cuando esté aprobada."
      badgeText="Revisión · Promii Influencers"
    >
      <AuthCard heading="Solicitud enviada" subheading="Estamos validando tu perfil">
        <div className="space-y-3 text-sm text-text-secondary">
          <p>
            Estado actual:{" "}
            <span className="font-semibold text-text-primary">{profile?.state ?? "pending"}</span>
          </p>

          <div className="rounded-lg border border-border bg-surface p-3">
            <div className="font-semibold text-text-primary">¿Necesitas ayuda rápida?</div>
            <div>Escríbenos por WhatsApp y te guiamos.</div>
          </div>

          <Button className="w-full bg-primary text-white hover:bg-primary/90" asChild>
            <a
              href="https://wa.me/XXXXXXXXXXX"
              target="_blank"
              rel="noreferrer"
            >
              Hablar por WhatsApp
            </a>
          </Button>

          <div className="text-xs">
            <Link className="text-primary hover:underline" href="/">
              Volver al home
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
