import { notFound } from "next/navigation";
import Link from "next/link";
import { CATEGORIES } from "@/config/categories";
import { COLORS } from "@/config/colors";
import { ChevronRight, Home, Sparkles } from "lucide-react";
import CategoryPromiis from "./category-promiis";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categoryKey } = await params;

  const category = CATEGORIES.find((c) => c.key === categoryKey);
  if (!category) return notFound();

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/"
          className="transition-colors duration-200 hover:underline"
          style={{ color: COLORS.text.secondary }}
        >
          <Home className="size-4" />
        </Link>
        <ChevronRight className="size-4" style={{ color: COLORS.text.tertiary }} />
        <span style={{ color: COLORS.text.primary }} className="font-semibold">
          {category.label}
        </span>
      </nav>

      {/* Category Header */}
      <div
        className="relative overflow-hidden rounded-2xl border p-8 md:p-12"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary.lighter} 0%, ${COLORS.background.primary} 100%)`,
          borderColor: COLORS.border.light,
        }}
      >
        {/* Decorative element */}
        <div
          className="absolute -right-20 -top-20 size-64 rounded-full opacity-30 blur-3xl"
          style={{ backgroundColor: COLORS.primary.main }}
        />

        <div className="relative z-10 flex items-start gap-6">
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-2xl shadow-lg"
            style={{
              backgroundColor: COLORS.background.primary,
              color: COLORS.primary.main,
            }}
          >
            <div className="scale-150">{category.icon}</div>
          </div>

          <div className="flex-1">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-3"
              style={{
                backgroundColor: COLORS.background.primary,
                color: COLORS.primary.main,
              }}
            >
              <Sparkles className="size-3" />
              Categoría
            </div>

            <h1
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ color: COLORS.text.primary }}
            >
              {category.label}
            </h1>

            <p
              className="mt-3 text-base max-w-2xl"
              style={{ color: COLORS.text.secondary }}
            >
              Explora las mejores promociones en {category.label.toLowerCase()}. Ofertas verificadas con descuentos de hasta 70%.
            </p>
          </div>
        </div>
      </div>

      {/* Subcategories */}
      {category.subcategories.length > 0 && (
        <section>
          <div className="mb-6">
            <h2
              className="text-xl font-bold"
              style={{ color: COLORS.text.primary }}
            >
              Explora por subcategoría
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: COLORS.text.secondary }}
            >
              Encuentra exactamente lo que buscas
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.subcategories.map((sub) => (
              <Link
                key={sub.key}
                href={sub.href}
                className="group relative overflow-hidden rounded-xl border p-6 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                style={{
                  backgroundColor: COLORS.background.primary,
                  borderColor: COLORS.border.light,
                }}
              >
                {/* Decorative background */}
                <div
                  className="absolute -right-10 -top-10 size-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20"
                  style={{ backgroundColor: COLORS.primary.main }}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: COLORS.text.primary }}
                    >
                      {sub.label}
                    </h3>
                    <p
                      className="text-sm mt-1"
                      style={{ color: COLORS.text.secondary }}
                    >
                      Ver ofertas
                    </p>
                  </div>

                  <ChevronRight
                    className="size-5 transition-transform duration-200 group-hover:translate-x-1"
                    style={{ color: COLORS.primary.main }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Promiis */}
      <CategoryPromiis categoryKey={category.key} categoryLabel={category.label} />
    </div>
  );
}
