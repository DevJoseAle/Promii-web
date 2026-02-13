import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Promii — Ofertas cerca de ti",
    short_name: "Promii",
    description:
      "Descubre promociones verificadas en restaurantes, spas, entretenimiento y más. Ahorra hasta 70%.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#46248c",
    orientation: "portrait",
    categories: ["shopping", "lifestyle", "food"],
    lang: "es",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
