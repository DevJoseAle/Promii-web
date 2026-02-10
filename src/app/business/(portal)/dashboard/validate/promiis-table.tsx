"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, FileText, ClipboardCheck, Award, Search } from "lucide-react";
import { COLORS } from "@/config/colors";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Mode = "pending" | "validated" | "claim";

const MODE_CONFIG = {
  pending: {
    icon: FileText,
    emptyMessage: "No hay Promiis pendientes de validar.",
  },
  validated: {
    icon: ClipboardCheck,
    emptyMessage: "No hay Promiis validados todavía.",
  },
  claim: {
    icon: Award,
    emptyMessage: "No hay Promiis por reclamar.",
  },
};

export function PromiisTable({ mode }: { mode: Mode }) {
  const sp = useSearchParams();
  const q = (sp.get("q") ?? "").trim().toLowerCase();

  // ⚠️ Aquí conectas tu data real (Supabase) según "mode" y "q".
  // No pongo data dummy para no "simular".
  const rows: Array<{
    id: string;
    title: string;
    category?: string;
    score: string; // ej: "46/46"
    status: "ok" | "warn";
    merchant?: string;
    date?: string;
  }> = [];

  const config = MODE_CONFIG[mode];
  const Icon = config.icon;

  return (
    <div
      className="rounded-xl border shadow-sm overflow-hidden"
      style={{
        backgroundColor: COLORS.background.primary,
        borderColor: COLORS.border.light,
      }}
    >
      <div className="px-6 py-4 border-b" style={{ borderColor: COLORS.border.light }}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
            {rows.length} {rows.length === 1 ? "Promii" : "Promiis"}
          </div>
          {q && (
            <div className="flex items-center gap-2 text-xs" style={{ color: COLORS.text.secondary }}>
              <Search className="size-3" />
              <span>Buscando: &quot;{q}&quot;</span>
            </div>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="p-12 text-center">
          <Icon className="size-12 mx-auto mb-3" style={{ color: COLORS.text.tertiary }} />
          <p className="text-sm mb-2" style={{ color: COLORS.text.secondary }}>
            {q ? `No hay resultados para "${q}".` : config.emptyMessage}
          </p>
          {q && (
            <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
              Prueba con otra búsqueda.
            </p>
          )}
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: COLORS.border.light }}>
          {rows.map((r) => (
            <div
              key={r.id}
              className="px-6 py-4 transition-colors duration-200 hover:bg-opacity-50"
              style={{ backgroundColor: "transparent" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 flex size-8 items-center justify-center rounded-lg shrink-0"
                      style={{
                        backgroundColor: r.status === "ok" ? COLORS.success.lighter : COLORS.error.lighter,
                        color: r.status === "ok" ? COLORS.success.main : COLORS.error.main,
                      }}
                    >
                      {r.status === "ok" ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        <AlertCircle className="size-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium mb-1" style={{ color: COLORS.text.primary }}>
                        {r.title}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs" style={{ color: COLORS.text.secondary }}>
                        {r.category && (
                          <span className="flex items-center gap-1">
                            <span className="size-1 rounded-full" style={{ backgroundColor: COLORS.primary.main }} />
                            {r.category}
                          </span>
                        )}
                        {r.merchant && (
                          <span className="flex items-center gap-1">
                            <span className="size-1 rounded-full" style={{ backgroundColor: COLORS.text.tertiary }} />
                            {r.merchant}
                          </span>
                        )}
                        {r.date && (
                          <span className="flex items-center gap-1">
                            <span className="size-1 rounded-full" style={{ backgroundColor: COLORS.text.tertiary }} />
                            {r.date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div
                    className="px-3 py-1.5 rounded-lg border text-sm font-semibold"
                    style={{
                      backgroundColor: r.status === "ok" ? COLORS.success.lighter : COLORS.error.lighter,
                      borderColor: r.status === "ok" ? COLORS.success.light : COLORS.error.light,
                      color: r.status === "ok" ? COLORS.success.dark : COLORS.error.dark,
                    }}
                  >
                    {r.score}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="h-9 transition-all duration-200 hover:scale-105"
                    style={{
                      borderColor: COLORS.border.main,
                      color: COLORS.text.secondary,
                    }}
                  >
                    <Link href={`/business/dashboard/validate/${r.id}`}>
                      Ver detalles
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
