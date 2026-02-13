import { COLORS } from "@/config/colors";
import { useAuth } from "@/lib/context/AuthContext";
import { Building2, UserStarIcon } from "lucide-react";
import Link from "next/link";

export function TopBar() {
  const { profile, isAuthenticated } = useAuth()
  const showTopBar = !isAuthenticated || isAuthenticated && (profile?.role === "merchant" || profile?.role === "influencer")
  const blue = COLORS.bluePrimary

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
      }}
    >
      {
        showTopBar && (
          <div className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-4 py-2 text-xs">
        <Link
          href="/business/dashboard"

          className="flex items-center gap-1 font-semibold hover:underline"
          style={{ color: COLORS.text.inverse }}
        >
          <Building2 className="h-4 w-4" />
          Promii Empresas
        </Link>

        <Link
          className="flex items-center gap-1 font-semibold hover:underline"
          href="/inf/dashboard"
          style={{ color: COLORS.text.inverse }}
        >
          <UserStarIcon className="h-4 w-4" />
          Promii Influencers
        </Link>
        <Link
          className="hover:opacity-80"
          href="/help"
          style={{ color: COLORS.text.inverse }}
        >
          Ayuda
        </Link>
        <Link
          className="hover:opacity-80"
          href="/auth/sign-in"
          style={{ color: COLORS.text.inverse }}
        >
          Acceder
        </Link>
      </div>
        )
      }
    </div>
  );
}