import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  brandLabel?: string; // "Promii" por defecto
  title: string;
  subtitle?: string;
  badgeText?: string; // ej: "Promii Empresas"
  children: ReactNode;

  // look
  variant?: "consumer" | "business";
};

export function AuthShell({
  brandLabel = "Promii",
  title,
  subtitle,
  badgeText,
  children,
  variant = "consumer",
}: Props) {
  const rightPanel =
    variant === "business"
      ? "bg-primary/15"
      : "bg-primary/10";

  return (
    <div className="min-h-dvh bg-background">
      {/* Header minimal */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-lg font-extrabold tracking-tight text-text-primary hover:text-primary"
        >
          {brandLabel}
        </Link>

        {badgeText ? (
          <div className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
            {badgeText}
          </div>
        ) : null}
      </header>

      {/* Body */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-0 px-4 pb-10 md:grid-cols-2">
        {/* Left: form card */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="rounded-3xl bg-surface p-7 shadow-sm">
              <div className="text-2xl font-bold text-text-primary">{title}</div>
              {subtitle ? (
                <div className="mt-2 text-sm text-text-secondary">{subtitle}</div>
              ) : null}

              <div className="mt-6">{children}</div>
            </div>
          </div>
        </div>

        {/* Right: blue panel (no image) */}
        <div className="relative hidden md:block">
          <div
            className={cn(
              "ml-10 h-full min-h-[560px] rounded-3xl border border-border",
              rightPanel
            )}
          >
            {/* Decorative shapes */}
            <div className="absolute -right-8 top-16 size-40 rounded-full bg-primary/20 blur-2xl" />
            <div className="absolute left-10 top-24 size-24 rounded-2xl bg-primary/20" />
            <div className="absolute bottom-16 right-12 size-28 rounded-2xl bg-primary/15" />

            {/* Copy */}
            <div className="absolute inset-0 flex flex-col justify-center p-12">
              <div className="text-sm font-semibold text-text-primary">
                {variant === "business" ? "Portal de negocios" : "Promos locales"}
              </div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight text-text-primary">
                {variant === "business"
                  ? "Promii Empresas"
                  : "Compra fácil. Ahorra más."}
              </div>
              <p className="mt-3 max-w-sm text-sm text-text-secondary">
                {variant === "business"
                  ? "Publica promos, valida compras y crece con confianza. Requiere aprobación para proteger a los usuarios."
                  : "Encuentra Promiis verificados cerca de ti, paga directo al comercio y canjea con tu código."}
              </p>

              <div className="mt-6 rounded-2xl bg-surface/70 p-4 text-xs text-text-secondary backdrop-blur">
                Consejo: Mantén tus promos claras y con condiciones simples para aumentar conversiones.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* footer mini */}
      <div className="mx-auto max-w-6xl px-4 pb-8 text-center text-xs text-text-secondary">
        <Link className="hover:text-primary" href="/help">
          Ayuda
        </Link>{" "}
        ·{" "}
        <Link className="hover:text-primary" href="/legal/terms">
          Términos
        </Link>{" "}
        ·{" "}
        <Link className="hover:text-primary" href="/legal/privacy">
          Privacidad
        </Link>
      </div>
    </div>
  );
}
