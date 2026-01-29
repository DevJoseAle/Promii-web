import Link from "next/link";
import { Button } from "./button";
// OJO: en tu archivo estás importando Badge desde lucide-react (eso es un icono).
// Lo correcto sería usar tu componente Badge UI si lo tienes.
// Si no lo quieres tocar ahora, puedes quitar el badge por mientras.
import { Badge } from "@/components/ui/badge";

export type Promii = {
  id: string;
  title: string;
  merchant: string;
  location: string;
  rating: number;
  sold: number;
  oldPrice: number;
  price: number;
  discountPct: number;
  tag?: string;
};

export function PromiiCard({ p }: { p: Promii }) {
  return (
    <Link
      href={`/p/${p.id}`}
      className="group block overflow-hidden rounded-xl bg-card shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-44 bg-muted" />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-text-primary">
            {p.title}
          </h3>

          {p.tag ? <Badge variant="secondary">{p.tag}</Badge> : null}
        </div>

        <div className="mt-2 text-xs text-text-secondary">{p.location}</div>

        <div className="mt-2 flex items-center gap-2 text-xs text-text-secondary">
          <span>⭐ {p.rating.toFixed(1)}</span>
          <span>•</span>
          <span>{p.sold}+ vendidos</span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <div className="text-xs text-text-secondary line-through">
              ${p.oldPrice.toFixed(2)}
            </div>
            <div className="text-lg font-bold text-text-primary">
              ${p.price.toFixed(2)}{" "}
              <span className="text-xs font-semibold text-secondary">
                {p.discountPct}% off
              </span>
            </div>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            Comprar
          </Button>
        </div>
      </div>
    </Link>
  );
}
