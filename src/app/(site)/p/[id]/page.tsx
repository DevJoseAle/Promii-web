import { notFound } from "next/navigation";
import { PROMIIS } from "@/mocks/promiis";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function PromiiDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const{ id }= await params;
  const p = PROMIIS.find((x) => x.id === id);
  if (!p) return notFound();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Left */}
      <div className="space-y-6">
        {/* Media */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="h-[320px] bg-muted" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {p.tag ? <Badge variant="secondary">{p.tag}</Badge> : null}
            <div className="text-sm text-text-secondary">{p.location}</div>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
            {p.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span>⭐ {p.rating.toFixed(1)}</span>
            <span>•</span>
            <span>{p.sold}+ vendidos</span>
            <span>•</span>
            <span className="font-semibold text-text-primary">{p.merchant}</span>
          </div>
        </div>

        {/* About */}
        {p.about ? (
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="text-sm font-semibold text-text-primary">Descripción</div>
            <p className="mt-2 text-sm text-text-secondary">{p.about}</p>
          </section>
        ) : null}

        {/* Highlights */}
        {p.highlights?.length ? (
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="text-sm font-semibold text-text-primary">Incluye</div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-secondary">
              {p.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Terms */}
        {p.terms?.length ? (
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="text-sm font-semibold text-text-primary">Condiciones</div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-secondary">
              {p.terms.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Redeem */}
        {p.redeem?.length ? (
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="text-sm font-semibold text-text-primary">Cómo canjear</div>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-text-secondary">
              {p.redeem.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>

      {/* Right sticky box */}
      <aside className="lg:sticky lg:top-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs text-text-secondary line-through">
                ${p.oldPrice.toFixed(2)}
              </div>
              <div className="text-3xl font-extrabold text-text-primary">
                ${p.price.toFixed(2)}
              </div>
              <div className="mt-1 text-sm font-semibold text-secondary">
                {p.discountPct}% off
              </div>
            </div>

            <div className="text-right text-xs text-text-secondary">
              Promii verificado
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <Button className="h-11 w-full">Comprar</Button>
            <Button variant="outline" className="h-11 w-full">
              Guardar
            </Button>
          </div>

          <div className="mt-4 rounded-xl bg-muted/40 p-3 text-xs text-text-secondary">
            * Por ahora es maqueta. Luego “Comprar” abre el flujo real (WhatsApp / código / pago).
          </div>
        </div>
      </aside>
    </div>
  );
}
