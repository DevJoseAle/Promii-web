import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/business/",
          "/inf/dashboard",
          "/auth/",
          "/api/",
          "/profile",
        ],
      },
    ],
    sitemap: "https://promii.com/sitemap.xml",
  };
}
