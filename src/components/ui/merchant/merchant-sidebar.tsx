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
import { COLORS } from "@/config/colors";

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
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        collapsed && "justify-center px-2",
        active
          ? "text-white shadow-sm"
          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
      )}
      style={
        active
          ? {
              background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
            }
          : undefined
      }
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
    >
      {/* Indicador activo (barra izquierda) */}
      {active && (
        <div
          className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full"
          style={{ backgroundColor: COLORS.primary.dark }}
        />
      )}

      <Icon
        className={cn(
          "size-5 transition-transform group-hover:scale-110",
          active ? "text-white" : "text-gray-600",
        )}
      />
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {item.badge != null ? (
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold shadow-sm"
              style={{
                backgroundColor: active ? "rgba(255,255,255,0.2)" : COLORS.error.lighter,
                color: active ? "white" : COLORS.error.dark,
              }}
            >
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
        "flex h-dvh flex-col border-r transition-[width] duration-300 shadow-lg",
        collapsed ? "w-[76px]" : "w-[280px]",
      )}
      style={{
        backgroundColor: COLORS.background.primary,
        borderColor: COLORS.border.light,
      }}
    >
      {/* Brand / Header */}
      {/* Top actions */}
      {/* Top actions */}
      <div
        className={cn(
          "flex flex-col items-center gap-3 px-3 py-5",
          collapsed && "px-2",
        )}
        style={{
          borderBottom: `1px solid ${COLORS.border.light}`,
          background: `linear-gradient(180deg, ${COLORS.background.primary} 0%, ${COLORS.background.secondary} 100%)`,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center transition-transform hover:scale-105"
          title="Ir a Promii Home"
        >
          <div className="text-xl font-extrabold tracking-tight">
            <Image
              src="/images/promiiLogo.png"
              alt="Promii Logo"
              width={collapsed ? 40 : 120}
              height={30}
              priority
              className="transition-all duration-300"
            />
          </div>
        </Link>

        {/* Toggle sidebar */}
        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:scale-105"
            style={{
              backgroundColor: COLORS.primary.lighter,
              color: COLORS.primary.dark,
            }}
            aria-label="Toggle sidebar"
            title="Contraer menú"
          >
            <span>Contraer</span>
            <ChevronRight className="size-4" />
          </button>
        )}

        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-2 transition-all hover:scale-110"
            style={{
              backgroundColor: COLORS.primary.lighter,
              color: COLORS.primary.dark,
            }}
            aria-label="Toggle sidebar"
            title="Expandir menú"
          >
            <ChevronRight className="size-4 rotate-180" />
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1 mb-6">
          {TOP_ITEMS.map((it) => (
            <NavLink key={it.href} item={it} collapsed={collapsed} />
          ))}
        </div>

        {/* Divider */}
        {!collapsed && (
          <div className="my-4 flex items-center gap-2">
            <div
              className="h-px flex-1"
              style={{ backgroundColor: COLORS.border.light }}
            />
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: COLORS.text.tertiary }}
            >
              Gestión
            </span>
            <div
              className="h-px flex-1"
              style={{ backgroundColor: COLORS.border.light }}
            />
          </div>
        )}

        <div className="mt-4">
          <Accordion
            type="multiple"
            className={cn(
              "space-y-2",
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
                      "rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-gray-50",
                      collapsed && "justify-center px-2",
                    )}
                    style={{ color: COLORS.text.primary }}
                  >
                    <span
                      className={cn(
                        "flex items-center gap-3",
                        collapsed && "justify-center",
                      )}
                    >
                      <GroupIcon
                        className="size-5"
                        style={{ color: COLORS.primary.main }}
                      />
                      {!collapsed ? <span>{g.label}</span> : null}
                    </span>
                  </AccordionTrigger>

                  {!collapsed ? (
                    <AccordionContent className="pb-2 pt-1">
                      <div className="space-y-1 pl-2">
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
      <div
        className={cn("p-3", collapsed && "p-2")}
        style={{
          borderTop: `1px solid ${COLORS.border.light}`,
          background: `linear-gradient(180deg, ${COLORS.background.secondary} 0%, ${COLORS.background.primary} 100%)`,
        }}
      >
        <Link
          href="/merchant/feedback"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:scale-105",
            collapsed && "justify-center px-2",
          )}
          style={{
            backgroundColor: COLORS.info.lighter,
            color: COLORS.info.dark,
          }}
          title={collapsed ? "Feedback" : undefined}
        >
          <MessageSquarePlus className="size-5" />
          {!collapsed ? <span>Enviar Feedback</span> : null}
        </Link>
      </div>
    </div>
  );
}

// Mobile Bottom Tabs (solo las más importantes)
const MOBILE_TABS: NavItem[] = [
  { label: "Dashboard", href: "/business/dashboard", icon: LayoutDashboard },
  { label: "Crear", href: "/business/dashboard/create-promii", icon: Sparkles },
  { label: "Mis Promiis", href: "/business/dashboard/my-promiis", icon: ClipboardCheck },
  { label: "Validar", href: "/business/dashboard/validate/pending", icon: BadgeCheck },
  { label: "Más", href: "#", icon: Menu }, // Abre drawer con el resto
];

function MobileBottomBar() {
  const pathname = usePathname();
  const [showMore, setShowMore] = React.useState(false);

  return (
    <>
      {/* Bottom Tab Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden pb-safe"
        style={{
          backgroundColor: COLORS.background.primary,
          borderTop: `1px solid ${COLORS.border.light}`,
          boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {MOBILE_TABS.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "#"
              ? false
              : pathname === item.href || (item.href !== "/business/dashboard" && pathname.startsWith(item.href));

            if (item.href === "#") {
              // Botón "Más" que abre drawer
              return (
                <Drawer key="more" open={showMore} onOpenChange={setShowMore}>
                  <DrawerTrigger asChild>
                    <button
                      className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all active:scale-95"
                      style={{
                        color: COLORS.text.secondary,
                      }}
                    >
                      <Icon className="size-6" />
                      <span className="text-xs font-medium">Más</span>
                    </button>
                  </DrawerTrigger>

                  <DrawerContent className="max-h-[85vh]">
                    <div
                      className="flex justify-between items-center px-4 py-3"
                      style={{ borderBottom: `1px solid ${COLORS.border.light}` }}
                    >
                      <span className="text-sm font-bold" style={{ color: COLORS.primary.dark }}>
                        Todas las opciones
                      </span>
                      <DrawerClose asChild>
                        <button
                          className="rounded-lg px-3 py-1.5 text-sm font-semibold transition-all"
                          style={{
                            backgroundColor: COLORS.neutral[100],
                            color: COLORS.text.secondary,
                          }}
                        >
                          Cerrar
                        </button>
                      </DrawerClose>
                    </div>
                    <div className="overflow-y-auto px-4 py-4">
                      {/* Grupos completos */}
                      {GROUPS.map((group) => (
                        <div key={group.label} className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <group.icon className="size-5" style={{ color: COLORS.primary.main }} />
                            <h3 className="text-sm font-bold" style={{ color: COLORS.text.primary }}>
                              {group.label}
                            </h3>
                          </div>
                          <div className="space-y-1 pl-2">
                            {group.items.map((it) => {
                              const ItemIcon = it.icon;
                              const itemActive = pathname === it.href || pathname.startsWith(it.href);
                              return (
                                <Link
                                  key={it.href}
                                  href={it.href}
                                  onClick={() => setShowMore(false)}
                                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
                                  style={{
                                    backgroundColor: itemActive ? COLORS.primary.lighter : "transparent",
                                    color: itemActive ? COLORS.primary.dark : COLORS.text.secondary,
                                  }}
                                >
                                  <ItemIcon className="size-5" />
                                  <span className="flex-1">{it.label}</span>
                                  {it.badge && (
                                    <span
                                      className="rounded-full px-2 py-0.5 text-xs font-bold"
                                      style={{
                                        backgroundColor: COLORS.error.lighter,
                                        color: COLORS.error.dark,
                                      }}
                                    >
                                      {it.badge}
                                    </span>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Feedback */}
                      <div
                        className="mt-6 pt-6"
                        style={{ borderTop: `1px solid ${COLORS.border.light}` }}
                      >
                        <Link
                          href="/merchant/feedback"
                          onClick={() => setShowMore(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
                          style={{
                            backgroundColor: COLORS.info.lighter,
                            color: COLORS.info.dark,
                          }}
                        >
                          <MessageSquarePlus className="size-5" />
                          <span>Enviar Feedback</span>
                        </Link>
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all active:scale-95 min-w-0"
                style={{
                  color: isActive ? COLORS.primary.main : COLORS.text.secondary,
                }}
              >
                <div className="relative">
                  <Icon className="size-6" />
                  {item.badge && (
                    <span
                      className="absolute -top-1 -right-1 size-2 rounded-full"
                      style={{ backgroundColor: COLORS.error.main }}
                    />
                  )}
                </div>
                <span className={cn("text-xs font-medium truncate max-w-[60px]", isActive && "font-bold")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Top Header Mobile (delicado y limpio) */}
      <div
        className="sticky top-0 z-30 flex flex-col items-center justify-center px-4 py-3 lg:hidden"
        style={{
          backgroundColor: COLORS.background.primary,
          borderBottom: `1px solid ${COLORS.border.light}`,
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
        }}
      >
        <Image
          src="/images/promiiLogo.png"
          alt="Promii Logo"
          width={90}
          height={22}
          priority
          className="opacity-90"
        />
        <div className="flex items-center gap-1.5 mt-1">
          <div
            className="h-1 w-1 rounded-full"
            style={{ backgroundColor: COLORS.primary.main }}
          />
          <span
            className="text-[10px] font-medium tracking-wide uppercase"
            style={{ color: COLORS.text.tertiary }}
          >
            Portal Empresas
          </span>
          <div
            className="h-1 w-1 rounded-full"
            style={{ backgroundColor: COLORS.primary.main }}
          />
        </div>
      </div>
    </>
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

      {/* Mobile: Bottom Bar + Top Header */}
      <MobileBottomBar />
    </>
  );
}
