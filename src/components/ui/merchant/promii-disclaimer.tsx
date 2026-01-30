"use client";

import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export function CreatePromiiDisclaimer() {
  const { profile, loading } = useAuth();

  if (loading) return null;

  const isMerchant = profile?.role === "merchant";
  const isPending = profile?.state === "pending";

  if (!isMerchant || !isPending) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 size-4 text-amber-700" />
        <div>
          <div className="font-semibold text-amber-900">
            Importante
          </div>
          <p className="mt-1 text-amber-800">
            Si tu cuenta AÚN está en <span className="font-semibold">pending</span>, los Promiis no aparecerán
            hasta que tu empresa haya sido verificada.
          </p>
        </div>
      </div>
    </div>
  );
}
