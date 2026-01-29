import { notFound } from "next/navigation";
import { INFLUENCERS } from "@/mocks/influencers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

export default async function InfluencerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const i = INFLUENCERS.find((x) => x.slug === slug);
  if (!i) return notFound();
    //TODO Para dejar solo a merchants el contactar por whatsapp

    const isMerchant = false

    const SOCIAL_STYLES = {
  instagram:
    "bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white hover:opacity-90",
  tiktok:
    "bg-black text-white hover:bg-black/90",
  youtube:
    "bg-[#FF0000] text-white hover:bg-[#FF0000]/90",
  whatsapp:
    "bg-[#25D366] text-white hover:bg-[#25D366]/90",
};
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Left */}
      <div className="space-y-6">
        {/* Header */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="h-40 bg-muted" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
                  {i.name}
                </h1>
                <div className="mt-1 text-sm text-text-secondary">{i.handle}</div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary">{i.city}</Badge>
                  <Badge variant="outline">{formatFollowers(i.followers)} seguidores</Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {i.tags.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="hidden md:block text-right text-xs text-text-secondary">
                Perfil público
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        {i.about ? (
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="text-sm font-semibold text-text-primary">Sobre</div>
            <p className="mt-2 text-sm text-text-secondary">{i.about}</p>
          </section>
        ) : null}

        {/* Brands */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-text-primary">
              Marcas con las que trabaja
            </div>
            <div className="text-xs text-text-secondary">{i.brands.length} marcas</div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {i.brands.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="text-sm font-semibold text-text-primary">{b.name}</div>
                <div className="mt-1 text-xs text-text-secondary">{b.city}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Right sticky */}
      <aside className="lg:sticky lg:top-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-sm font-semibold text-text-primary">Contacto</div>
          <div className="mt-3 space-y-2">
            {i.socials?.instagram ? (
              <a href={i.socials.instagram} target="_blank" rel="noreferrer">
                <Button variant="outline" className={`w-full h-11 ${SOCIAL_STYLES.instagram}`}>Instagram</Button>
              </a>
            ) : null}
            {i.socials?.tiktok ? (
              <a href={i.socials.tiktok} target="_blank" rel="noreferrer">
                <Button variant="outline" className={`w-full h-11 ${SOCIAL_STYLES.tiktok}`}>TikTok</Button>
              </a>
            ) : null}
            {i.socials?.youtube ? (
              <a href={i.socials.youtube} target="_blank" rel="noreferrer">
                <Button variant="outline" className={`w-full h-11 ${SOCIAL_STYLES.youtube}`}>YouTube</Button>
              </a>
            ) : null}
            {i.socials?.whatsapp && isMerchant ? (
              <a href={i.socials.whatsapp} target="_blank" rel="noreferrer">
                <Button className={`w-full h-11 ${SOCIAL_STYLES.whatsapp}`}>Contactar por WhatsApp</Button>
              </a>
            ) : null}
          </div>

          <div className="mt-4 rounded-xl bg-muted/40 p-3 text-xs text-text-secondary">
            * Más adelante aquí metemos “media kit” y “alianzas verificadas”.
          </div>
        </div>
      </aside>
    </div>
  );
}
