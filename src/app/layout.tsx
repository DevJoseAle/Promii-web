import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://promii.com"),
  title: {
    default: "Promii — Descubre ofertas increíbles cerca de ti",
    template: "%s | Promii",
  },
  description:
    "Ahorra hasta 70% en restaurantes, spas, entretenimiento y más en Venezuela. Promociones verificadas, compra directo y canjea con tu código único.",
  keywords: [
    "promociones", "descuentos", "ofertas", "Venezuela", "cupones",
    "restaurantes", "spas", "entretenimiento", "Caracas", "Valencia",
    "Maracaibo", "Barquisimeto", "influencers", "comercios",
  ],
  authors: [{ name: "Promii" }],
  creator: "Promii",
  openGraph: {
    type: "website",
    locale: "es_VE",
    url: "https://promii.com",
    siteName: "Promii",
    title: "Promii — Descubre ofertas increíbles cerca de ti",
    description:
      "Ahorra hasta 70% en restaurantes, spas, entretenimiento y más en Venezuela. Promociones verificadas.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Promii — Descubre ofertas increíbles cerca de ti",
    description:
      "Ahorra hasta 70% en restaurantes, spas, entretenimiento y más en Venezuela.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Promii",
    url: "https://promii.com",
    description:
      "Plataforma de promociones locales verificadas en Venezuela. Descuentos en restaurantes, spas, entretenimiento y más.",
    applicationCategory: "ShoppingApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "0",
      offerCount: "100+",
      availability: "https://schema.org/InStock",
    },
    areaServed: {
      "@type": "Country",
      name: "Venezuela",
    },
  };

  return (
    <html
      lang="es"
      className={`${GeistSans.className} antialiased dark:bg-gray-950`}
    >
      <head>
        <meta name="theme-color" content="#46248c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Promii" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={GeistMono.variable}>
        <GoogleAnalytics />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
