"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BarChart3,
  Clock,
  Users,
  Sparkles,
  UserCircle,
  Menu,
  LogOut,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { COLORS } from "@/config/colors";
import { useAuth } from "@/lib/context/AuthContext";
import { supabase } from "@/lib/supabase/supabase.client";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  tab?: string; // Added tab identifier
};

const NAV_ITEMS: NavItem[] = [
  { label: "Resumen", href: "/inf/dashboard", icon: BarChart3, tab: "overview" },
  { label: "Solicitudes", href: "/inf/dashboard?tab=requests", icon: Clock, tab: "requests" },
  { label: "Mis Marcas", href: "/inf/dashboard?tab=merchants", icon: Users, tab: "merchants" },
  { label: "Mis Promiis", href: "/inf/dashboard?tab=promiis", icon: Sparkles, tab: "promiis" },
  { label: "Mi Perfil", href: "/inf/dashboard?tab=profile", icon: UserCircle, tab: "profile" },
];

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";

  // Check if this nav item is active based on the current tab
  const active = item.tab === currentTab;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "text-white shadow-sm"
          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
      )}
      style={
        active
          ? {
              background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
            }
          : undefined
      }
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <div
          className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full"
          style={{ backgroundColor: COLORS.primary.dark }}
        />
      )}

      <Icon
        className={cn(
          "size-5 transition-transform group-hover:scale-110",
          active ? "text-white" : "text-gray-600"
        )}
      />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge != null && (
        <span
          className="flex size-5 items-center justify-center rounded-full text-xs font-bold"
          style={{
            backgroundColor: active ? "rgba(255,255,255,0.2)" : COLORS.primary.lighter,
            color: active ? "white" : COLORS.primary.main,
          }}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function InfluencerSidebar() {
  const { profile } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-6 py-5" style={{ borderColor: COLORS.border.light }}>
        <Link href="/inf/dashboard" className="flex items-center gap-3">
          <div className="relative size-10 rounded-lg overflow-hidden border-2" style={{ borderColor: COLORS.primary.main }}>
            <div
              className="size-full flex items-center justify-center text-lg font-bold"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
                color: "white",
              }}
            >
              {profile?.first_name?.charAt(0).toUpperCase() || "I"}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate" style={{ color: COLORS.text.primary }}>
              {profile?.first_name || "Influencer"}
            </div>
            <div className="text-xs" style={{ color: COLORS.text.tertiary }}>
              Portal de Influencer
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t px-3 py-4" style={{ borderColor: COLORS.border.light }}>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut className="size-5" />
          <span>Cerrar sesión</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex items-center gap-4 border-b bg-white px-4 py-3 lg:hidden" style={{ borderColor: COLORS.border.light }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileOpen(true)}
          className="text-gray-700"
        >
          <Menu className="size-6" />
        </Button>
        <Link href="/inf/dashboard" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Promii" width={32} height={32} />
          <span className="text-lg font-bold" style={{ color: COLORS.primary.main }}>
            Promii
          </span>
        </Link>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-50 hidden w-[280px] flex-col border-r bg-white lg:flex"
        style={{ borderColor: COLORS.border.light }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b px-6 py-5" style={{ borderColor: COLORS.border.light }}>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Promii" width={40} height={40} />
            <span className="text-xl font-bold" style={{ color: COLORS.primary.main }}>
              Promii
            </span>
          </Link>
        </div>

        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-[280px] bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-6 py-5" style={{ borderColor: COLORS.border.light }}>
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.png" alt="Promii" width={32} height={32} />
                <span className="text-lg font-bold" style={{ color: COLORS.primary.main }}>
                  Promii
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileOpen(false)}
                className="text-gray-700"
              >
                <X className="size-5" />
              </Button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
