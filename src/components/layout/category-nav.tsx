"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/config/categories";
import { COLORS } from "@/config/colors";
import { useAuth } from "@/lib/context/AuthContext";

const BLUE = COLORS.bluePrimary; // "#2d68e8"
const BLUE_LIGHT = COLORS.blueSecondary;

export function CategoryNav() {
  const pathname = usePathname();
  const { isInfluencer, isAuthenticated } = useAuth();

  return (
    <div className="border-b border-border bg-surface mb-1">
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2">
        {CATEGORIES.map((c) => {
          // Si es la categoría de influencers y el usuario está autenticado como influencer, redirigir a su dashboard
          const isInfluencerCategory = c.key === "influencers";
          const targetHref = isInfluencerCategory && isAuthenticated && isInfluencer
            ? "/inf/dashboard"
            : c.href;

          const active =
            (targetHref === "/" && pathname === "/") ||
            (targetHref !== "/" && pathname.startsWith(targetHref));

          return (
            <Link
              key={c.key}
              href={targetHref}
              style={
                {
                  "--cat-accent": BLUE,
                  "--cat-accent-light": BLUE_LIGHT,
                } as React.CSSProperties
              }
              className={cn(
                "group flex min-w-[104px] flex-col items-center justify-center gap-2 px-3 py-3 text-xs transition rounded-lg",
                // Hover/active subtle growth
                "hover:scale-[1.02] active:scale-[1.02]",
                // Hover background + shadow
                "hover:bg-gradient-to-b hover:from-[var(--cat-accent)] hover:to-[var(--cat-accent-light)] hover:shadow-sm",
                // Active background + shadow
                active &&
                  "bg-gradient-to-b from-[var(--cat-accent)] to-[var(--cat-accent-light)] shadow-sm",
                // Optional premium ring on active
                active && "ring-1 ring-[var(--cat-accent)]/20"
              )}
            >
              {/* Icon */}
              <span
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center text-[var(--cat-accent)]",
                  "group-hover:text-white",
                  active && "text-white"
                )}
              >
                {React.cloneElement(c.icon, {
                  className: "h-6 w-6",
                })}
              </span>

              {/* Label */}
              <span
                className={cn(
                  "whitespace-nowrap text-center leading-tight font-semibold text-text-primary",
                  "group-hover:text-white",
                  active && "text-white"
                )}
              >
                {c.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
