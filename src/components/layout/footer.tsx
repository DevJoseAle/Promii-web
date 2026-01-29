import Link from "next/link";
import { CATEGORIES } from "@/config/categories";

const CITIES = ["Caracas", "Valencia", "Maracaibo", "Barquisimeto", "Puerto La Cruz", "Mérida"];

export function AppFooter() {
  return (
    <footer className="mt-10 border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="text-lg font-bold text-primary">Promii</div>
            <p className="mt-2 text-sm text-text-secondary">
              Promos locales verificadas. Paga directo al comercio y canjea con tu código.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-text-primary">Explorar</div>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              {CATEGORIES.filter((c) => c.href !== "/").slice(0, 6).map((c) => (
                <li key={c.key}>
                  <Link className="hover:text-primary" href={c.href}>
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-text-primary">Buscar por ciudad</div>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              {CITIES.map((city) => (
                <li key={city}>
                  <Link className="hover:text-primary" href={`/?city=${encodeURIComponent(city)}`}>
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-text-primary">Promii</div>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              <li>
                <Link className="hover:text-primary" href="/for-business">
                  Publicar un Promii
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary" href="/for-influencers">
                  Programa de influencers
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary" href="/help">
                  Ayuda / FAQ
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary" href="/legal/terms">
                  Términos
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary" href="/legal/privacy">
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-xs text-text-secondary">
          © {new Date().getFullYear()} Promii. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
