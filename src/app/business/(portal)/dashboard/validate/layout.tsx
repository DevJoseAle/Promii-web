import Link from "next/link";
import { ReactNode } from "react";
import { ClipboardCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { ValidateTopBar } from "./top-bar";
import { COLORS } from "@/config/colors";

export default function ValidateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      {/* Header con diseño consistente - igual que Mis Promiis */}
      <div className="flex items-start gap-4">
        <div
          className="flex size-12 items-center justify-center rounded-xl shrink-0"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
          }}
        >
          <ClipboardCheck className="size-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: COLORS.text.primary }}>
            Validar Promiis
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: COLORS.text.secondary }}>
            Revisa y aprueba Promiis antes de que se publiquen.
          </p>
        </div>
      </div>

      {/* Tabs + Search + Filters */}
      <ValidateTopBar />

      {/* Content */}
      {children}
    </div>
  );
}
