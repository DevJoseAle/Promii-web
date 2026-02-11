import { notFound } from "next/navigation";
import { CATEGORIES } from "@/config/categories";
import SubcategoryClient from "./subcategory-client";

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ category: string; subcategory: string }>;
}) {
  const { category: categoryKey, subcategory: subKey } = await params;

  const category = CATEGORIES.find((c) => c.key === categoryKey);
  if (!category) return notFound();

  const sub = category.subcategories.find((s) => s.key === subKey);
  if (!sub) return notFound();

  return <SubcategoryClient category={category} subcategory={sub} />;
}
