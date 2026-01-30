import Link from "next/link";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { ValidateTopBar } from "./top-bar";

export default function ValidateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Validar Promiis</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Revisa y aprueba Promiis antes de que se publiquen.
        </p>
      </div>

      {/* Tabs + Search + Filters */}
      <ValidateTopBar />

      {/* Content */}
      <div className="rounded-2xl border border-border bg-surface">
        {children}
      </div>
    </div>
  );
}
