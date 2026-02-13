import type { MetadataRoute } from "next";

const BASE_URL = "https://promii.shop";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/for-users`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/for-business`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/for-influencers`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/influencers`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Category pages
  const categories = [
    "beauty", "food", "things_to_do", "services", "shopping", "travel", "gifts",
  ];
  const subcategories = [
    "beauty/spa", "beauty/hair", "beauty/nails",
    "food/restaurants", "food/coffee", "food/dessert",
    "things_to_do/cinema", "things_to_do/events", "things_to_do/kids",
    "services/home", "services/cars", "services/repairs",
    "shopping/fashion", "shopping/tech",
    "travel/hotels", "travel/tours",
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/c/${cat}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const subcategoryPages: MetadataRoute.Sitemap = subcategories.map((sub) => ({
    url: `${BASE_URL}/c/${sub}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  // City pages
  const cities = [
    "caracas", "valencia", "maracaibo", "barquisimeto", "puerto-la-cruz", "merida",
  ];

  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${BASE_URL}/city/${city}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...subcategoryPages,
    ...cityPages,
  ];
}
