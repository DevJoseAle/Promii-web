"use client";

import Link from "next/link";
import { COLORS } from "@/config/colors";
import { ChevronRight, Home } from "lucide-react";
import { CategoryConfig } from "@/config/categories";
import SubcategoryPromiis from "./subcategory-promiis";

type Props = {
  category: CategoryConfig;
  subcategory: { key: string; label: string; href: string };
};

export default function SubcategoryClient({ category, subcategory }: Props) {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm flex-wrap">
        <Link
          href="/"
          className="transition-colors duration-200 hover:underline"
          style={{ color: COLORS.text.secondary }}
        >
          <Home className="size-4" />
        </Link>
        <ChevronRight className="size-4" style={{ color: COLORS.text.tertiary }} />
        <Link
          href={category.href}
          className="transition-colors duration-200 hover:underline"
          style={{ color: COLORS.text.secondary }}
        >
          {category.label}
        </Link>
        <ChevronRight className="size-4" style={{ color: COLORS.text.tertiary }} />
        <span style={{ color: COLORS.text.primary }} className="font-semibold">
          {subcategory.label}
        </span>
      </nav>

      {/* Promiis with filters */}
      <SubcategoryPromiis
        categoryKey={category.key}
        subcategoryKey={subcategory.key}
        subcategoryLabel={subcategory.label}
      />
    </div>
  );
}
