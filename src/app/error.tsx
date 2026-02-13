"use client";

import { COLORS } from "@/config/colors";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ backgroundColor: COLORS.background.secondary }}
    >
      <div className="text-center max-w-md">
        <div
          className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl"
          style={{ backgroundColor: COLORS.error.lighter }}
        >
          <AlertTriangle className="size-10" style={{ color: COLORS.error.main }} />
        </div>

        <h1
          className="text-6xl font-bold mb-2"
          style={{ color: COLORS.error.main }}
        >
          500
        </h1>
        <h2
          className="text-xl font-bold mb-3"
          style={{ color: COLORS.text.primary }}
        >
          Algo salió mal
        </h2>
        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: COLORS.text.secondary }}
        >
          Tuvimos un problema procesando tu solicitud. Nuestro equipo ya fue notificado. Intenta de nuevo o vuelve al inicio.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all duration-200 hover:scale-105 cursor-pointer"
            style={{
              backgroundColor: COLORS.primary.main,
              color: "white",
            }}
          >
            <RotateCcw className="size-4" />
            Intentar de nuevo
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{
              borderColor: COLORS.border.main,
              color: COLORS.text.primary,
            }}
          >
            <Home className="size-4" />
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
