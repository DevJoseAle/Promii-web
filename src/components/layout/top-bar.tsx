import { COLORS } from "@/config/colors";
import { Building2, UserStarIcon } from "lucide-react";
import Link from "next/link";

export function TopBar() {

  const blue = COLORS.bluePrimary

  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-4 py-2 text-xs text-text-secondary">
        <Link
          href="/business/dashboard"
          
          className="flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          <Building2 className="h-4 w-4" style={ { color: blue } }  />
          Promii Empresas
        </Link>

        <Link className="flex items-center gap-1 font-semibold text-primary hover:underline" href="/inf/dashboard">
          <UserStarIcon className="h-4 w-4" color={blue} />
          Promii Influencers
        </Link>
        <Link className="hover:text-primary" href="/help">
          Ayuda
        </Link>
        <Link className="hover:text-primary" href="/auth/sign-in">
          Acceder
        </Link>
      </div>
    </div>
  );
}