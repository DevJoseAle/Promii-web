"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { COLORS } from "@/config/colors";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Store,
  Users,
  Tag,
  Gift,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";
import Image from "next/image";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Merchants", href: "/admin/merchants", icon: Store },
  { label: "Influencers", href: "/admin/influencers", icon: Users },
  { label: "Promiis", href: "/admin/promiis", icon: Tag },
  { label: "Promii Red", href: "/admin/promii-red", icon: Gift },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // El middleware ya verificó permisos, solo renderizar el layout

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-6 py-5" style={{ borderColor: COLORS.border.light }}>
        <div
          className="flex size-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: COLORS.primary.main }}
        >
          <Shield className="size-6 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold" style={{ color: COLORS.text.primary }}>
            Panel Admin
          </div>
          <div className="text-xs" style={{ color: COLORS.text.tertiary }}>
            {profile?.first_name || "Administrador"}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="size-5 text-gray-600 transition-transform group-hover:scale-110" />
              <span>{item.label}</span>
            </Link>
          );
        })}
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
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background.secondary }}>
      {/* Mobile Header */}
      <div
        className="sticky top-0 z-40 flex items-center gap-4 border-b bg-white px-4 py-3 lg:hidden"
        style={{ borderColor: COLORS.border.light }}
      >
        <Button variant="ghost" size="sm" onClick={() => setMobileOpen(true)} className="text-gray-700">
          <Menu className="size-6" />
        </Button>
        <div className="flex items-center gap-2">
          <Shield className="size-6" style={{ color: COLORS.primary.main }} />
          <span className="text-lg font-bold" style={{ color: COLORS.primary.main }}>
            Admin
          </span>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-50 hidden w-[280px] flex-col border-r bg-white lg:flex"
        style={{ borderColor: COLORS.border.light }}
      >
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
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-[280px] bg-white" onClick={(e) => e.stopPropagation()}>
            <div
              className="flex items-center justify-between border-b px-6 py-5"
              style={{ borderColor: COLORS.border.light }}
            >
              <div className="flex items-center gap-2">
                <Shield className="size-6" style={{ color: COLORS.primary.main }} />
                <span className="text-lg font-bold" style={{ color: COLORS.primary.main }}>
                  Admin
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setMobileOpen(false)} className="text-gray-700">
                <X className="size-5" />
              </Button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:pl-[280px]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
