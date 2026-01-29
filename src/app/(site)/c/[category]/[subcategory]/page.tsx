import { notFound } from "next/navigation";
import { CATEGORIES } from "@/config/categories";

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {category.label} · {sub.label}
      </h1>

      <div className="rounded-2xl bg-surface p-6 shadow-sm">
        Listado filtrado por: <b>{categoryKey}</b> / <b>{subKey}</b>
      </div>
    </div>
  );
}
