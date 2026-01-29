"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-4 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
      {children}
    </div>
  );
}

function NavLink({
  href,
  label,
  active,
  sub,
}: {
  href: string;
  label: string;
  active: boolean;
  sub?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
        sub ? "ml-2" : "",
        active
          ? "bg-primary text-white shadow-sm"
          : "text-text-primary hover:bg-primary/10 hover:text-primary"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full transition",
          active ? "bg-white" : "bg-text-secondary/40 group-hover:bg-primary"
        )}
      />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export function MerchantSidebar() {
  const pathname = usePathname();

  const isCreate = pathname.startsWith("/business/dashboard/create-promii");

  const isValidatePending = pathname.startsWith("/business/dashboard/validate/pending");
  const isValidateActive = pathname.startsWith("/business/dashboard/validate/active");

  const isInfluencersRequests = pathname.startsWith("/business/dashboard/influencers/requests");
  const isInfluencersAffiliates = pathname.startsWith("/business/dashboard/influencers/affiliates");

  return (
    <aside className="hidden w-[280px] shrink-0 border-r border-border bg-surface md:block">
      <div className="flex h-screen flex-col">
        {/* Brand */}
        <div className="flex items-center gap-2 px-5 py-5">
          <Image src="/images/promiiLogo.png" alt="Promii" width={110} height={26} />
          <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
            Empresas
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-auto px-3 pb-6">
          <div className="rounded-2xl bg-primary/5 p-3">
            <div className="text-sm font-semibold text-text-primary">Portal</div>
            <div className="mt-1 text-xs text-text-secondary">
              Gestiona Promiis, validaciones e influencers
            </div>
          </div>

          <SectionTitle>Promiis</SectionTitle>
          <div className="space-y-1">
            <NavLink
              href="/business/dashboard/create-promii"
              label="Crear Promii"
              active={isCreate}
            />
          </div>

          <SectionTitle>Validar Promiis</SectionTitle>
          <div className="space-y-1">
            <NavLink
              href="/business/dashboard/validate/pending"
              label="Promiis por validar"
              active={isValidatePending}
              sub
            />
            <NavLink
              href="/business/dashboard/validate/active"
              label="Promiis activos"
              active={isValidateActive}
              sub
            />
          </div>

          <SectionTitle>Influencers</SectionTitle>
          <div className="space-y-1">
            <NavLink
              href="/business/dashboard/influencers/requests"
              label="Solicitudes"
              active={isInfluencersRequests}
              sub
            />
            <NavLink
              href="/business/dashboard/influencers/affiliates"
              label="Influencers afiliados"
              active={isInfluencersAffiliates}
              sub
            />
          </div>

          {/* Feedback CTA */}
          <div className="mt-6 rounded-2xl border border-border bg-surface p-3">
            <div className="text-sm font-semibold text-text-primary">Feedback</div>
            <div className="mt-1 text-xs text-text-secondary">
              Ayúdanos a pulir este portal.
            </div>

            <Button
              asChild
              className="mt-3 w-full bg-primary text-white hover:bg-primary/90"
            >
              <Link href="/business/dashboard/feedback">Enviar feedback</Link>
            </Button>
          </div>
        </nav>

        {/* Footer sidebar */}
        <div className="border-t border-border px-5 py-4">
          <div className="text-xs text-text-secondary">Promii Empresas</div>
          <div className="text-xs text-text-secondary">
            Soporte:{" "}
            <a
              className="font-semibold text-primary hover:underline"
              href="https://wa.me/XXXXXXXXXXX"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
