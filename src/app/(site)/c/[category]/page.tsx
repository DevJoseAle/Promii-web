import { notFound } from "next/navigation";
import { CATEGORIES } from "@/config/categories";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categoryKey } = await params;

  const category = CATEGORIES.find((c) => c.key === categoryKey);
  if (!category) return notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{category.label}</h1>
      <p className="text-sm text-text-secondary">
        Subcategorías de {category.label}
      </p>

      <div className="flex flex-wrap gap-2">
        {category.subcategories.map((s) => (
          <a
            key={s.key}
            href={s.href}
            className="rounded-full bg-surface px-4 py-2 text-sm shadow-sm hover:bg-background"
          >
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}
