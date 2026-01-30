"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Callout, Text } from "@tremor/react";
import { Info } from "lucide-react";

import { readMerchantState, writeMerchantState, MerchantState } from "@/lib/auth/merchant-state-cache";

export function PendingBanner() {
  const { profile, user } = useAuth();

  // 1) estado instantáneo desde cache
  const [cachedState, setCachedState] = useState<MerchantState>("unknown");
  useEffect(() => {
    setCachedState(readMerchantState());
  }, []);

  // 2) si llega profile real, lo usa y actualiza cache
  const serverState = (profile?.role === "merchant" ? (profile?.state as MerchantState) : "unknown") ?? "unknown";

  useEffect(() => {
    if (serverState !== "unknown") {
      writeMerchantState(serverState);
      setCachedState(serverState);
    }
  }, [serverState]);

  // 3) decisión final
  const effectiveState = serverState !== "unknown" ? serverState : cachedState;

  const isMerchant =
    profile?.role === "merchant" || effectiveState !== "unknown"; // fallback: si tenemos cache, asumimos merchant
  const isPending = effectiveState === "pending";

  if (!isMerchant || !isPending) return null;

  const emailConfirmed =
    !!(user as any)?.email_confirmed_at || !!(user as any)?.confirmed_at;

  return (
    <div className="max-w-3xl">
      <Callout title="Tu empresa está en revisión" icon={Info} color="amber">
        <Text className="mt-1">
          Puedes ver tu dashboard, pero no podrás publicar Promiis hasta que tu cuenta sea aprobada.
          {!emailConfirmed ? " Además, confirma tu correo para evitar bloqueos." : null}
        </Text>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild size="sm" className="bg-primary text-white hover:bg-primary/90">
            <a href="https://wa.me/XXXXXXXXXXX" target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </Button>

          <Button asChild size="sm" variant="outline" onClick={() =>{
                writeMerchantState("pending");
          }}>
            <Link href="/business/apply">Actualizar solicitud</Link>
          </Button>
        </div>
      </Callout>
    </div>
  );
}
