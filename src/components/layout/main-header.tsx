"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Search, User } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Image from "next/image";
import { useAuth } from "@/lib/context/AuthContext";
import { useEffect, useState } from "react";
import { ToastService } from "@/lib/toast/toast.service";
import { logoutUser } from "@/lib/auth/auth.service.client";
import { FullscreenLoading } from "../ui/FullScreenLoading";

export function MainHeader() {
  const router = useRouter();
  const sp = useSearchParams();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const { user, profile, session, signOut, existSession } = useAuth();

  console.log("MainHeader Fuera logout",{ profile, user, session, existSession });
  async function handleLogout() {
    console.log("entre");
    try {
      setLogoutLoading(true);
      console.log("entre 2");
      await signOut();
      console.log("entre 3");
      console.log("entre 4");
  
    } catch (err: any) {
      console.error("Logout error:", err);
    }finally{
      setLogoutLoading(false);
      window.location.reload();
    }

  }

  function onSubmit(formData: FormData) {
    const q = String(formData.get("q") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();

    const params = new URLSearchParams(sp.toString());
    if (q) params.set("q", q);
    else params.delete("q");

    if (city) params.set("city", city);
    else params.delete("city");

    router.push(`/?${params.toString()}`);
  }
  if (logoutLoading) return <FullscreenLoading show={logoutLoading} />;
  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-xl font-extrabold tracking-tight text-primary">
            <Image
              src={"/images/promiiLogo.png"}
              alt="Promii Logo"
              width={120}
              height={30}
            />
          </div>
        </Link>

        <form
          action={onSubmit}
          className="flex w-full flex-1 items-center gap-2"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
            <Input
              name="q"
              defaultValue={sp.get("q") ?? ""}
              placeholder="Búsqueda"
              className="h-10 pl-9"
            />
          </div>

          <div className="relative w-[200px] shrink-0 max-sm:hidden">
            <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
            <Input
              name="city"
              defaultValue={sp.get("city") ?? ""}
              placeholder="Ciudad"
              className="h-10 pl-9"
            />
          </div>

          <Button
            type="submit"
            className="h-10 bg-primary text-white hover:bg-primary/90"
          >
            Buscar
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={logoutLoading}
          >
            <p>{logoutLoading ? "Cerrando..." : "Cerrar sesión"}</p>
          </Button>

          <Button variant="ghost" size="icon" aria-label="Cuenta">
            <User className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
