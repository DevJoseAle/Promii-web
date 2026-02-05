"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function FullscreenLoading({
  show,
  label = "Cargando…",
  className,
}: {
  show: boolean;
  label?: string;
  className?: string;
}) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] grid place-items-center bg-white/90 backdrop-blur-[1px]",
        className
      )}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        {/* Logo (puedes reemplazar por tu SVG/imagen) */}
        <div className="text-3xl font-extrabold tracking-tight text-primary">
          Promii
        </div>

        {/* Spinner simple */}
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-primary" />

        <div className="text-xs text-text-secondary">{label}</div>
      </div>
    </div>
  );
}
