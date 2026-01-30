"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";

type Mode = "pending" | "validated" | "claim";

export function PromiisTable({ mode }: { mode: Mode }) {
  const sp = useSearchParams();
  const q = (sp.get("q") ?? "").trim().toLowerCase();

  // ⚠️ Aquí conectas tu data real (Supabase) según "mode" y "q".
  // No pongo data dummy para no “simular”.
  const rows: Array<{
    id: string;
    title: string;
    category?: string;
    score: string; // ej: "46/46"
    status: "ok" | "warn";
  }> = [];

  const title =
    mode === "pending"
      ? "Promiis por validar"
      : mode === "validated"
      ? "Promiis validados"
      : "Promiis por reclamar";

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-text-primary">{title}</div>

      <div className="divide-y divide-border">
        {rows.length === 0 ? (
          <div className="py-10 text-center text-sm text-text-secondary">
            No hay resultados.
            {q ? " Prueba con otra búsqueda." : ""}
          </div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-4">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-text-primary">
                  {r.title}
                </div>
                {r.category ? (
                  <div className="mt-1 text-xs text-text-secondary">
                    {r.category}
                  </div>
                ) : null}
              </div>

              <div className="ml-4 flex items-center gap-2 text-sm">
                {r.status === "ok" ? (
                  <CheckCircle2 className="size-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="size-4 text-red-600" />
                )}
                <span className="text-text-secondary">{r.score}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
