import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/config/categories";
import { COLORS } from "@/config/colors";
import { Store, Users, HelpCircle, FileText, Shield } from "lucide-react";

const CITIES = [
  { name: "Caracas", slug: "caracas" },
  { name: "Valencia", slug: "valencia" },
  { name: "Maracaibo", slug: "maracaibo" },
  { name: "Barquisimeto", slug: "barquisimeto" },
  { name: "Puerto La Cruz", slug: "puerto-la-cruz" },
  { name: "Mérida", slug: "merida" },
];

export function AppFooter() {
  return (
    <footer
      className="mt-16 border-t"
      style={{
        backgroundColor: COLORS.background.secondary,
        borderColor: COLORS.border.light,
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Main content grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block transition-transform duration-200 hover:scale-105">
              <Image
                src="/images/promiiLogo.png"
                alt="Promii"
                width={140}
                height={48}
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p
              className="mt-4 text-sm leading-relaxed max-w-sm"
              style={{ color: COLORS.text.secondary }}
            >
              La plataforma de promociones locales más grande de Venezuela. Descubre, compra y canjea ofertas verificadas cerca de ti.
            </p>

            {/* Business CTA */}
            <Link
              href="/business/apply"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: COLORS.primary.lighter,
                borderColor: COLORS.primary.light,
                color: COLORS.primary.dark,
              }}
            >
              <Store className="size-4" />
              ¿Tienes un negocio? Únete a Promii
            </Link>
          </div>

          {/* Explorar column */}
          <div>
            <div
              className="text-sm font-bold mb-4"
              style={{ color: COLORS.text.primary }}
            >
              Explorar
            </div>
            <ul className="space-y-2.5">
              {CATEGORIES.filter((c) => c.href !== "/").slice(0, 6).map((c) => (
                <li key={c.key}>
                  <Link
                    className="text-sm transition-colors duration-200 hover:underline"
                    href={c.href}
                    style={{ color: COLORS.text.secondary }}
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ciudades column */}
          <div>
            <div
              className="text-sm font-bold mb-4"
              style={{ color: COLORS.text.primary }}
            >
              Ciudades
            </div>
            <ul className="space-y-2.5">
              {CITIES.map((city) => (
                <li key={city.slug}>
                  <Link
                    className="text-sm transition-colors duration-200 hover:underline"
                    href={`/city/${city.slug}`}
                    style={{ color: COLORS.text.secondary }}
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <div
              className="text-sm font-bold mb-4"
              style={{ color: COLORS.text.primary }}
            >
              Empresa
            </div>
            <ul className="space-y-2.5">
              <li>
                <Link
                  className="inline-flex items-center gap-2 text-sm transition-colors duration-200 hover:underline"
                  href="/for-influencers"
                  style={{ color: COLORS.text.secondary }}
                >
                  <Users className="size-3.5" />
                  Programa de influencers
                </Link>
              </li>
              <li>
                <Link
                  className="inline-flex items-center gap-2 text-sm transition-colors duration-200 hover:underline"
                  href="/faq"
                  style={{ color: COLORS.text.secondary }}
                >
                  <HelpCircle className="size-3.5" />
                  Ayuda / FAQ
                </Link>
              </li>
              <li>
                <Link
                  className="inline-flex items-center gap-2 text-sm transition-colors duration-200 hover:underline"
                  href="/terms"
                  style={{ color: COLORS.text.secondary }}
                >
                  <FileText className="size-3.5" />
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link
                  className="inline-flex items-center gap-2 text-sm transition-colors duration-200 hover:underline"
                  href="/terms"
                  style={{ color: COLORS.text.secondary }}
                >
                  <Shield className="size-3.5" />
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div
          className="mt-10 mb-6 border-t"
          style={{ borderColor: COLORS.border.light }}
        />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p
            className="text-xs"
            style={{ color: COLORS.text.tertiary }}
          >
            © {new Date().getFullYear()} Promii. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-6 text-xs">
            <Link
              href="/legal/terms"
              className="transition-colors duration-200 hover:underline"
              style={{ color: COLORS.text.tertiary }}
            >
              Términos
            </Link>
            <span style={{ color: COLORS.border.dark }}>·</span>
            <Link
              href="/terms"
              className="transition-colors duration-200 hover:underline"
              style={{ color: COLORS.text.tertiary }}
            >
              Privacidad
            </Link>
            <span style={{ color: COLORS.border.dark }}>·</span>
            <Link
              href="/help"
              className="transition-colors duration-200 hover:underline"
              style={{ color: COLORS.text.tertiary }}
            >
              Ayuda
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
