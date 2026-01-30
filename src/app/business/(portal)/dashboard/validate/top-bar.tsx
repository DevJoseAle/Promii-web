"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Tab = { label: string; href: string };

const TABS: Tab[] = [
  { label: "Por validar", href: "/business/dashboard/validate/pending" },
  { label: "Validados", href: "/business/dashboard/validate" },
  { label: "Por reclamar", href: "/business/dashboard/validate/claim" },
];

export function ValidateTopBar() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const router = useRouter();

  function setQuery(q: string) {
    const params = new URLSearchParams(sp.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    router.push(`${pathname}?${params.toString()}`);
  }

  const q = sp.get("q") ?? "";

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          {TABS.map((t) => {
            const active =
              pathname === t.href ||
              (t.href !== "/business/dashboard/validate" &&
                pathname.startsWith(t.href));

            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "relative -mb-px py-3 text-sm font-medium transition",
                  "text-text-secondary hover:text-text-primary",
                  active && "text-primary"
                )}
              >
                {t.label}
                {active ? (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-primary" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
          <Input
            value={q}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar promiis..."
            className="h-10 pl-9"
          />
        </div>

        <Button variant="outline" className="h-10 gap-2">
          <SlidersHorizontal className="size-4" />
          Filters
        </Button>
      </div>
    </div>
  );
}
