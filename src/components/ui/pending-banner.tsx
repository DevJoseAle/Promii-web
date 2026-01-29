"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";

export function PendingBanner() {
  const { profile, user } = useAuth();

  const isMerchant = profile?.role === "merchant";
  const isPending = profile?.state === "pending";

  if (!isMerchant || !isPending) return null;

  const emailConfirmed =
    !!(user as any)?.email_confirmed_at || !!(user as any)?.confirmed_at;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-sm font-semibold text-text-primary">
        Tu empresa está en revisión
      </div>

      <div className="mt-1 text-sm text-text-secondary">
        Puedes ver tu dashboard, pero no podrás publicar Promiis hasta que tu cuenta sea aprobada.
        {!emailConfirmed ? " Además, confirma tu correo para evitar bloqueos." : null}
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Button asChild className="bg-primary text-white hover:bg-primary/90">
          <a href="https://wa.me/XXXXXXXXXXX" target="_blank" rel="noreferrer">
            Hablar por WhatsApp
          </a>
        </Button>

        <Button variant="outline" asChild>
          <a href="/business/apply">Actualizar solicitud</a>
        </Button>
      </div>
    </div>
  );
}
