import Link from "next/link";
import { COLORS } from "@/config/colors";
import { SearchX, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ backgroundColor: COLORS.background.secondary }}
    >
      <div className="text-center max-w-md">
        <div
          className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl"
          style={{ backgroundColor: COLORS.primary.lighter }}
        >
          <SearchX className="size-10" style={{ color: COLORS.primary.main }} />
        </div>

        <h1
          className="text-6xl font-bold mb-2"
          style={{ color: COLORS.primary.main }}
        >
          404
        </h1>
        <h2
          className="text-xl font-bold mb-3"
          style={{ color: COLORS.text.primary }}
        >
          Página no encontrada
        </h2>
        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: COLORS.text.secondary }}
        >
          La página que buscas no existe o fue movida. Pero no te preocupes, hay muchas ofertas esperándote.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: COLORS.primary.main,
              color: "white",
            }}
          >
            <Home className="size-4" />
            Ir al inicio
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{
              borderColor: COLORS.border.main,
              color: COLORS.text.primary,
            }}
          >
            <ArrowLeft className="size-4" />
            Buscar ofertas
          </Link>
        </div>
      </div>
    </div>
  );
}
