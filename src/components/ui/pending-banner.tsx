"use client";

import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";

// Tremor
import { Info } from "lucide-react";

export function PendingBanner() {
  const { profile, user } = useAuth();

  const isMerchant = profile?.role === "merchant";
  const isPending = profile?.state === "pending";
  if (!isMerchant || !isPending) return null;

  const emailConfirmed =
    !!(user as any)?.email_confirmed_at || !!(user as any)?.confirmed_at;

  return (
    <div className="max-w-3xl">
      <Callout
        className="rounded-xl"
        title="Tu empresa está en revisión"
        icon={Info}
        color="amber"
      >
        <Text className="mt-1">
          Puedes usar el dashboard, pero no podrás publicar Promiis hasta que tu cuenta sea aprobada.
          {!emailConfirmed ? " Además, confirma tu correo para evitar bloqueos." : null}
        </Text>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild size="sm" className="bg-primary text-white hover:bg-primary/90">
            <a href="https://wa.me/XXXXXXXXXXX" target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </Button>

          <Button asChild size="sm" variant="outline">
            <Link href="/business/apply">Actualizar solicitud</Link>
          </Button>
        </div>
      </Callout>
    </div>
  );
}
