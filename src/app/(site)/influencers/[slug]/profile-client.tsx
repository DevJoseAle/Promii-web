"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/config/colors";
import {
  MapPin,
  Users,
  Briefcase,
  Instagram,
  Youtube,
  TrendingUp,
  CheckCircle2,
  ExternalLink,
  DollarSign,
  Handshake,
  Star,
} from "lucide-react";
import { InfluencerMock } from "@/mocks/influencers";

type Props = {
  influencer: InfluencerMock;
  isMerchant?: boolean;
};

function formatFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

// TikTok SVG icon
const TikTokIcon = () => (
  <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export default function InfluencerProfileClient({ influencer: i, isMerchant = false }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Main content */}
      <div className="space-y-6">
        {/* Hero section */}
        <div
          className="overflow-hidden rounded-2xl border"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          {/* Cover with gradient */}
          <div
            className="relative h-48"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
            }}
          >
            {/* Decorative elements */}
            <div
              className="absolute -right-20 top-10 size-64 rounded-full opacity-30 blur-3xl"
              style={{ backgroundColor: COLORS.background.primary }}
            />
          </div>

          {/* Profile info */}
          <div className="relative px-6 md:px-8 pb-6">
            {/* Avatar */}
            <div
              className="absolute -top-16 size-32 rounded-full border-4 flex items-center justify-center text-4xl font-bold shadow-xl"
              style={{
                backgroundColor: COLORS.background.primary,
                borderColor: COLORS.background.primary,
                color: COLORS.primary.main,
              }}
            >
              {i.avatarUrl ? (
                <img
                  src={i.avatarUrl}
                  alt={i.name}
                  className="size-full rounded-full object-cover"
                />
              ) : (
                i.name.charAt(0).toUpperCase()
              )}
            </div>

            {/* Content */}
            <div className="pt-20">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h1
                      className="text-2xl md:text-3xl font-bold"
                      style={{ color: COLORS.text.primary }}
                    >
                      {i.name}
                    </h1>
                    <CheckCircle2
                      className="size-6 shrink-0"
                      style={{ color: COLORS.primary.main }}
                      aria-label="Perfil verificado"
                    />
                  </div>

                  <p
                    className="text-base mb-3"
                    style={{ color: COLORS.text.secondary }}
                  >
                    {i.handle}
                  </p>

                  <div className="flex items-center gap-1.5 text-sm mb-4" style={{ color: COLORS.text.tertiary }}>
                    <MapPin className="size-4" />
                    <span>{i.city}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {i.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg px-3 py-1.5 text-sm font-medium"
                        style={{
                          backgroundColor: COLORS.primary.lighter,
                          color: COLORS.primary.dark,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats card */}
                <div
                  className="rounded-xl p-4 min-w-[140px]"
                  style={{
                    backgroundColor: COLORS.background.secondary,
                    border: `1px solid ${COLORS.border.light}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="size-5" style={{ color: COLORS.primary.main }} />
                    <span className="text-xs" style={{ color: COLORS.text.secondary }}>
                      Seguidores
                    </span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
                    {formatFollowers(i.followers)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About section */}
        {i.about && (
          <section
            className="rounded-xl border p-6"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <h2
              className="text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: COLORS.text.primary }}
            >
              <Star className="size-5" style={{ color: COLORS.warning.main }} />
              Sobre mí
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: COLORS.text.secondary }}
            >
              {i.about}
            </p>
          </section>
        )}

        {/* Collaboration types */}
        <section
          className="rounded-xl border p-6"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <h2
            className="text-lg font-bold mb-4 flex items-center gap-2"
            style={{ color: COLORS.text.primary }}
          >
            <Handshake className="size-5" style={{ color: COLORS.success.main }} />
            Tipo de colaboraciones
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div
              className="rounded-lg border p-4"
              style={{
                backgroundColor: COLORS.success.lighter,
                borderColor: COLORS.success.light,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="size-5" style={{ color: COLORS.success.dark }} />
                <span className="font-semibold text-sm" style={{ color: COLORS.success.dark }}>
                  Colaboraciones pagadas
                </span>
              </div>
              <p className="text-xs" style={{ color: COLORS.success.dark }}>
                Acepta colaboraciones con compensación económica
              </p>
            </div>

            <div
              className="rounded-lg border p-4"
              style={{
                backgroundColor: COLORS.info.lighter,
                borderColor: COLORS.info.light,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="size-5" style={{ color: COLORS.info.dark }} />
                <span className="font-semibold text-sm" style={{ color: COLORS.info.dark }}>
                  Comisión por ventas
                </span>
              </div>
              <p className="text-xs" style={{ color: COLORS.info.dark }}>
                Trabaja con códigos de descuento y comisiones
              </p>
            </div>
          </div>
        </section>

        {/* Brands section */}
        <section
          className="rounded-xl border p-6"
          style={{
            backgroundColor: COLORS.background.secondary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div
                className="flex size-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: COLORS.success.lighter, color: COLORS.success.main }}
              >
                <Briefcase className="size-5" />
              </div>
              <div>
                <h2
                  className="text-lg font-bold"
                  style={{ color: COLORS.text.primary }}
                >
                  Marcas colaboradoras
                </h2>
                <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                  {i.brands.length} colaboraciones activas
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {i.brands.map((brand) => (
              <div
                key={brand.id}
                className="group rounded-lg border p-4 transition-all duration-200 hover:shadow-md"
                style={{
                  backgroundColor: COLORS.background.primary,
                  borderColor: COLORS.border.light,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-base truncate"
                      style={{ color: COLORS.text.primary }}
                    >
                      {brand.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-sm" style={{ color: COLORS.text.tertiary }}>
                      <MapPin className="size-3.5" />
                      <span>{brand.city}</span>
                    </div>
                  </div>

                  <CheckCircle2
                    className="size-5 shrink-0"
                    style={{ color: COLORS.success.main }}
                    aria-label="Colaboración verificada"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sidebar */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="space-y-4">
          {/* Contact card */}
          <div
            className="rounded-xl border p-6"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <h3
              className="text-base font-bold mb-4"
              style={{ color: COLORS.text.primary }}
            >
              Contacto y redes
            </h3>

            <div className="space-y-2">
              {/* Instagram */}
              {i.socials?.instagram && (
                <a
                  href={i.socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 h-11 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%)",
                    color: COLORS.text.inverse,
                  }}
                >
                  <Instagram className="size-5" />
                  Instagram
                  <ExternalLink className="size-4" />
                </a>
              )}

              {/* TikTok */}
              {i.socials?.tiktok && (
                <a
                  href={i.socials.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 h-11 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: "#000000",
                    color: COLORS.text.inverse,
                  }}
                >
                  <TikTokIcon />
                  TikTok
                  <ExternalLink className="size-4" />
                </a>
              )}

              {/* YouTube */}
              {i.socials?.youtube && (
                <a
                  href={i.socials.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 h-11 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: "#FF0000",
                    color: COLORS.text.inverse,
                  }}
                >
                  <Youtube className="size-5" />
                  YouTube
                  <ExternalLink className="size-4" />
                </a>
              )}

              {/* WhatsApp - Only for merchants */}
              {i.socials?.whatsapp && isMerchant && (
                <a
                  href={i.socials.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 h-11 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: "#25D366",
                    color: COLORS.text.inverse,
                  }}
                >
                  <WhatsAppIcon />
                  Contactar por WhatsApp
                  <ExternalLink className="size-4" />
                </a>
              )}
            </div>
          </div>

          {/* Info card */}
          <div
            className="rounded-xl border p-4"
            style={{
              backgroundColor: COLORS.info.lighter,
              borderColor: COLORS.info.light,
            }}
          >
            <p
              className="text-xs leading-relaxed"
              style={{ color: COLORS.info.dark }}
            >
              <strong>¿Eres merchant?</strong> Pronto podrás contactar directamente a influencers y ver su media kit completo.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
