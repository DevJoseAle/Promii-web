import { notFound } from "next/navigation";
import Link from "next/link";
import { COLORS } from "@/config/colors";
import { ChevronRight, Home, MapPin } from "lucide-react";
import CityPromiis from "./city-promiis";

// Ciudades válidas
const VALID_CITIES = [
  { slug: "caracas", name: "Caracas" },
  { slug: "valencia", name: "Valencia" },
  { slug: "maracaibo", name: "Maracaibo" },
  { slug: "barquisimeto", name: "Barquisimeto" },
  { slug: "puerto-la-cruz", name: "Puerto La Cruz" },
  { slug: "merida", name: "Mérida" },
];

export default async function CityPage({
  params,
}: {
  params: Promise<{ cityName: string }>;
}) {
  const { cityName } = await params;

  const cityData = VALID_CITIES.find((c) => c.slug === cityName);
  if (!cityData) return notFound();

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
          {cityData.name}
        </span>
      </nav>

      {/* City Header */}
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
            <MapPin className="size-8" />
          </div>

          <div className="flex-1">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-3"
              style={{
                backgroundColor: COLORS.background.primary,
                color: COLORS.primary.main,
              }}
            >
              <MapPin className="size-3" />
              Ciudad
            </div>

            <h1
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ color: COLORS.text.primary }}
            >
              Promociones en {cityData.name}
            </h1>

            <p
              className="mt-3 text-base max-w-2xl"
              style={{ color: COLORS.text.secondary }}
            >
              Descubre las mejores ofertas y promociones disponibles en {cityData.name}.
              Ofertas verificadas con descuentos de hasta 70%.
            </p>
          </div>
        </div>
      </div>

      {/* Promiis */}
      <CityPromiis cityName={cityData.name} />
    </div>
  );
}
