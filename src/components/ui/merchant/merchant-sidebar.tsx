"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ClipboardCheck,
  MessageSquarePlus,
  Sparkles,
  Users,
  BadgeCheck,
  LayoutDashboard,
  ChevronRight,
  Menu,
} from "lucide-react";

// Tremor (Raw) components (si ya los copiaste a /components, ajusta rutas)

import { cn } from "@/lib/utils"; // el cn típico (shadcn). Si usas otro, cambia esta línea.
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@radix-ui/react-accordion";
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose } from "../Drawer";
import Image from "next/image";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
};

type NavGroup = {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
  defaultOpen?: boolean;
};

const TOP_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/business/dashboard", icon: LayoutDashboard },
];

const GROUPS: NavGroup[] = [
  {
    label: "Promiis",
    icon: Sparkles,
    defaultOpen: true,
    items: [
      {
        label: "Crear Promii",
        href: "/business/dashboard/create-promii",
        icon: Sparkles,
      },
      {
        label: "Mis Promiis",
        href: "/business/dashboard/my-promiis",
        icon: ClipboardCheck,
        badge: "!",
      },
      {
        label: "Por validar",
        href: "/business/dashboard/validate/pending",
        icon: ClipboardCheck,
      },
      {
        label: "Promiis activos",
        // Si tu pantalla de validate maneja pestañas "pending/active",
        // puedes usar query param para ir directo a "activos"
        href: "/business/dashboard/validate?tab=active",
        icon: BadgeCheck,
      },
    ],
  },
  {
    label: "Influencers",
    icon: Users,
    items: [
      {
        label: "Solicitudes",
        href: "/business/dashboard/influencers/request", // <- es request (singular)
        icon: Users,
        badge: 2,
      },
      {
        label: "Afiliados",
        href: "/business/dashboard/influencers/affiliates",
        icon: BadgeCheck,
      },
    ],
  },
];

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();


const active =
  pathname === item.href ||
  (item.href !== "/business/dashboard" && pathname.startsWith(item.href));


  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
        "text-text-secondary hover:bg-muted/60 hover:text-text-primary",
        active && "bg-muted text-text-primary",
        collapsed && "justify-center px-2",
      )}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
    >
      <Icon
        className={cn(
          "size-5",
          active ? "text-primary" : "text-text-secondary",
        )}
      />
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {item.badge != null ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {item.badge}
            </span>
          ) : null}
        </>
      ) : null}
    </Link>
  );
}

function SidebarInner({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  return (
    <div
      className={cn(
        "flex h-dvh flex-col border-r border-border bg-surface",
        "transition-[width] duration-200",
        collapsed ? "w-[76px]" : "w-[280px]",
      )}
    >
      {/* Brand / Header */}
      {/* Top actions */}
      {/* Top actions */}
      <div
        className={cn(
          "flex flex-col items-center gap-3 border-b border-border px-3 py-4",
          collapsed && "px-2",
        )}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center"
          title="Ir a Promii Home"
        >
          <div className="text-xl font-extrabold tracking-tight text-primary">
            <Image
              src="/images/promiiLogo.png"
              alt="Promii Logo"
              width={120}
              height={30}
              priority
            />
          </div>
        </Link>

        {/* Toggle sidebar */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center justify-center rounded-lg p-2 transition",
            "text-text-secondary hover:bg-muted hover:text-text-primary",
          )}
          aria-label="Toggle sidebar"
          title={collapsed ? "Expandir menú" : "Contraer menú"}
        >
          {!collapsed && <p>Abrir / Cerrar</p>}
          <ChevronRight
            className={cn(
              "size-5 transition-transform",
              collapsed ? "rotate-180" : "rotate-0",
            )}
          />
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="space-y-1">
          {TOP_ITEMS.map((it) => (
            <NavLink key={it.href} item={it} collapsed={collapsed} />
          ))}
        </div>

        <div className="mt-4">
          <Accordion
            type="multiple"
            className={cn(
              "rounded-xl",
              collapsed && "pointer-events-none opacity-100",
            )}
            defaultValue={GROUPS.filter((g) => g.defaultOpen).map(
              (g) => g.label,
            )}
          >
            {GROUPS.map((g) => {
              const GroupIcon = g.icon;
              return (
                <AccordionItem
                  key={g.label}
                  value={g.label}
                  className="border-b-0"
                >
                  <AccordionTrigger
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm",
                      collapsed && "justify-center px-2",
                    )}
                  >
                    <span
                      className={cn(
                        "flex items-center gap-3",
                        collapsed && "justify-center",
                      )}
                    >
                      <GroupIcon className="size-5 text-text-secondary" />
                      {!collapsed ? (
                        <span className="text-sm font-semibold text-text-primary">
                          {g.label}
                        </span>
                      ) : null}
                    </span>
                  </AccordionTrigger>

                  {!collapsed ? (
                    <AccordionContent className="pb-2">
                      <div className="space-y-1">
                        {g.items.map((it) => (
                          <NavLink key={it.href} item={it} collapsed={false} />
                        ))}
                      </div>
                    </AccordionContent>
                  ) : null}
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>

      {/* Bottom actions */}
      <div className={cn("border-t border-border p-3", collapsed && "p-2")}>
        <Link
          href="/merchant/feedback"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
            "text-text-secondary hover:bg-muted/60 hover:text-text-primary",
            collapsed && "justify-center px-2",
          )}
          title={collapsed ? "Feedback" : undefined}
        >
          <MessageSquarePlus className="size-5" />
          {!collapsed ? <span className="font-semibold">Feedback</span> : null}
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
            "text-text-secondary hover:bg-muted/60 hover:text-text-primary",
            collapsed && "justify-center px-2",
          )}
          aria-label="Toggle Sidebar"
          title={collapsed ? "Expandir" : "Contraer"}
        >
          <ChevronRight
            className={cn(
              "size-5 transition-transform",
              collapsed ? "rotate-180" : "rotate-0",
            )}
          />
          {!collapsed ? (
            <span className="font-semibold">Toggle Sidebar</span>
          ) : null}
        </button>
      </div>
    </div>
  );
}

export function MerchantSidebar() {
  const [collapsed, setCollapsed] = React.useState(false);

  // Persist simple (opcional)
  React.useEffect(() => {
    const v = localStorage.getItem("promii:merchantSidebarCollapsed");
    if (v === "1") setCollapsed(true);
  }, []);
  React.useEffect(() => {
    localStorage.setItem(
      "promii:merchantSidebarCollapsed",
      collapsed ? "1" : "0",
    );
  }, [collapsed]);

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <SidebarInner collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>

      {/* Mobile: Drawer */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface px-4 py-3 lg:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Abrir menú">
              <Menu className="size-5" />
            </Button>
          </DrawerTrigger>

          <DrawerContent className="sm:max-w-sm">
            <div className="flex justify-end">
              <DrawerClose asChild>
                <Button variant="ghost">Cerrar</Button>
              </DrawerClose>
            </div>
            <div className="mt-2">
              <SidebarInner collapsed={false} setCollapsed={() => {}} />
            </div>
          </DrawerContent>
        </Drawer>

        <div className="text-sm font-semibold text-text-primary">
          Promii Empresas
        </div>
      </div>
    </>
  );
}
