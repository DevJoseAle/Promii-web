export type InfluencerTag =
  | "Gastronomía"
  | "Turismo"
  | "Entretenimiento"
  | "Servicios"
  | "Belleza"
  | "Fitness"
  | "Moda"
  | "Tecnología"
  | "Educación"
  | "Familia"
  | "Mascotas"
  | "Hogar";

export type InfluencerMock = {
  id: string;
  name: string;
  slug: string;
  handle: string;
  city: string; // MVP: ciudad principal
  followers: number;
  avatarUrl?: string;

  tags: InfluencerTag[];

  about?: string;

  socials?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    whatsapp?: string;
  };

  brands: {
    id: string;
    name: string;
    city: string;
    logoUrl?: string;
  }[];
};

export const INFLUENCERS: InfluencerMock[] = [
  {
    id: "inf_1",
    name: "Neutro",
    slug: "neutro",
    handle: "@neutro",
    city: "Caracas",
    followers: 520000,
    tags: ["Entretenimiento", "Turismo", "Gastronomía"],
    about:
      "Creador de contenido enfocado en entretenimiento, lugares y experiencias. Colaboro con marcas locales para impulsar ventas y visitas.",
    socials: {
      instagram: "https://instagram.com/",
      tiktok: "https://tiktok.com/",
      youtube: "https://youtube.com/",
      whatsapp: "https://wa.me/584120000000",
    },
    brands: [
      { id: "m1", name: "Barbería Black", city: "Caracas" },
      { id: "m2", name: "Aura Spa", city: "Caracas" },
      { id: "m3", name: "Pizzería Napoli", city: "Valencia" },
      { id: "m4", name: "Hotel Vista", city: "Caracas" },
    ],
  },
  {
    id: "inf_2",
    name: "Carla Foodie",
    slug: "carla-foodie",
    handle: "@carlafoodie",
    city: "Valencia",
    followers: 87000,
    tags: ["Gastronomía", "Servicios"],
    about:
      "Reseñas honestas y rutas gastronómicas. Enfocada en restaurantes y delivery.",
    socials: {
      instagram: "https://instagram.com/",
      whatsapp: "https://wa.me/584120000001",
    },
    brands: [
      { id: "m5", name: "Sushi Koi", city: "Valencia" },
      { id: "m6", name: "Burger Lab", city: "Valencia" },
      { id: "m7", name: "Café Central", city: "Valencia" },
    ],
  },
  {
    id: "inf_3",
    name: "Vane Beauty",
    slug: "vane-beauty",
    handle: "@vanebeauty",
    city: "Maracaibo",
    followers: 23000,
    tags: ["Belleza", "Moda", "Servicios"],
    about:
      "Tutoriales, recomendaciones y descuentos reales en belleza y moda.",
    socials: {
      instagram: "https://instagram.com/",
      tiktok: "https://tiktok.com/",
      whatsapp: "https://wa.me/584120000002",
    },
    brands: [
      { id: "m8", name: "Nails Studio", city: "Maracaibo" },
      { id: "m9", name: "Boutique Lía", city: "Maracaibo" },
    ],
  },
];

export const CITIES = ["Caracas", "Valencia", "Maracaibo"] as const;

export const FOLLOWER_BUCKETS = [
  { key: "all", label: "Todos" },
  { key: "0-10k", label: "0–10k" },
  { key: "10k-50k", label: "10k–50k" },
  { key: "50k-200k", label: "50k–200k" },
  { key: "200k+", label: "200k+" },
] as const;

export function inFollowerBucket(followers: number, bucket: string) {
  switch (bucket) {
    case "0-10k":
      return followers >= 0 && followers < 10_000;
    case "10k-50k":
      return followers >= 10_000 && followers < 50_000;
    case "50k-200k":
      return followers >= 50_000 && followers < 200_000;
    case "200k+":
      return followers >= 200_000;
    default:
      return true;
  }
}
