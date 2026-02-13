"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, User } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Image from "next/image";
import { useAuth } from "@/lib/context/AuthContext";
import { useEffect, useState, Suspense } from "react";
import { ToastService } from "@/lib/toast/toast.service";
import { logoutUser } from "@/lib/auth/auth.service.client";
import { FullscreenLoading } from "../ui/FullScreenLoading";
import { COLORS } from "@/config/colors";

function MainHeaderContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const {
    user,
    profile,
    session,
    signOut,
    existSession,
    isAuthenticated,
    isInfluencer,
    isMerchant,
    isUser,
    loading,
  } = useAuth();

  async function handleLogout() {
    try {
      setLogoutLoading(true);
      await signOut();
    } catch (err: any) {
      console.error("Logout error:", err);
    } finally {
      setLogoutLoading(false);
      window.location.reload();
    }
  }

  function onSubmit(formData: FormData) {
    const q = String(formData.get("q") ?? "").trim();

    // Si no hay búsqueda, no hacer nada
    if (!q) return;

    const params = new URLSearchParams();
    if (q) params.set("q", q);

    router.push(`/search?${params.toString()}`);
  }
  if (logoutLoading) return <FullscreenLoading show={logoutLoading} />;
  return (
    <header
      className="sticky top-0 z-50 shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-transform duration-200 hover:scale-105"
        >
          <Image
            src="/images/promiiLogo.png"
            alt="Promii Logo"
            width={120}
            height={40}
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Search form */}
        <form
          action={onSubmit}
          className="flex w-full flex-1 items-center gap-3"
        >
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
              style={{ color: COLORS.text.secondary }}
            />
            <Input
              name="q"
              defaultValue={sp.get("q") ?? ""}
              placeholder="Buscar promiis, categorías..."
              className="h-11 pl-10 pr-4 transition-all duration-200 focus:ring-2 border-0"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                color: COLORS.text.primary,
              }}
            />
          </div>

          <Button
            type="submit"
            className="h-11 px-6 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 border-0"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: COLORS.text.inverse,
              backdropFilter: "blur(10px)",
            }}
          >
            <Search className="size-4 sm:mr-2" />
            <span className="max-sm:hidden">Buscar</span>
          </Button>
        </form>

        {/* Auth buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {loading ? (
            // Skeleton mientras carga el estado de auth
            <div
              className="h-11 w-[140px] rounded-lg animate-pulse"
              style={{ backgroundColor: COLORS.neutral[200] }}
            />
          ) : isAuthenticated ? (
            <>
              {/* Botón de cuenta según el tipo de usuario */}
              {isUser && (
                <Button
                  asChild
                  variant="ghost"
                  className="h-11 px-4 font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ color: COLORS.text.inverse }}
                >
                  <Link href="/profile">
                    <User className="size-5 mr-2" />
                    Mi Cuenta
                  </Link>
                </Button>
              )}
              {isMerchant && (
                <Button
                  asChild
                  variant="ghost"
                  className="h-11 px-4 font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ color: COLORS.text.inverse }}
                >
                  <Link href="/business/dashboard">
                    <User className="size-5 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              )}
              {isInfluencer && (
                <Button
                  asChild
                  variant="ghost"
                  className="h-11 px-4 font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ color: COLORS.text.inverse }}
                >
                  <Link href="/inf/dashboard">
                    <User className="size-5 mr-2" />
                    Mi Panel
                  </Link>
                </Button>
              )}
              <Button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="h-11 px-4 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 border-0"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: COLORS.text.inverse,
                  backdropFilter: "blur(10px)",
                }}
              >
                {logoutLoading ? "Cerrando..." : "Cerrar sesión"}
              </Button>
            </>
          ) : (
            <Button
              asChild
              className="h-11 px-6 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 border-0"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                color: COLORS.primary.main,
              }}
            >
              <Link href="/auth/sign-in">
                <User className="size-4 mr-2" />
                Iniciar Sesión
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export function MainHeader() {
  return (
    <Suspense fallback={
      <div className="sticky top-0 z-50 border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Promii"
              width={100}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
        </div>
      </div>
    }>
      <MainHeaderContent />
    </Suspense>
  );
}
