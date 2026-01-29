import { BagIcon, CouponIcon, GiftIcon, LuggageIcon, PlaneIcon, RollerSkateIcon, ServingFoodIcon, StarFaceIcon, StarIcon, WellnessIcon } from "@/assets/icons";
import type { LucideIcon } from "lucide-react";
import {
  Star,
  Sparkles,
  Utensils,
  Ticket,
  Wrench,
  ShoppingBag,
  Plane,
  Gift,
} from "lucide-react";
import { JSX } from "react";
import { COLORS } from "./colors";

export type CategoryKey =
  | "top"
  | "influencers"
  | "beauty"
  | "food"
  | "things_to_do"
  | "promos"
  | "services"
  | "shopping"
  | "travel"
  | "gifts";

export type SubcategoryKey =
  | "spa"
  | "hair"
  | "nails"
  | "restaurants"
  | "coffee"
  | "dessert"
  | "cinema"
  | "kids"
  | "events"
  | "repairs"
  | "home"
  | "cars"
  | "fashion"
  | "tech"
  | "hotels"
  | "tours";

export type CategoryConfig = {
  key: CategoryKey;
  label: string;
  icon: JSX.Element;
  href: string; // /c/[category]
  subcategories: Array<{ key: SubcategoryKey; label: string; href: string }>;
};
const iconClass = "h-4 w-4 shrink-0";
const iconSize = 216;
const categoryIcon = (key: CategoryKey): JSX.Element => {
  switch (key) {
    case "top":
      return <StarIcon width={iconSize} height={iconSize} className={iconClass} />;
    case "influencers":
      return <StarFaceIcon width={iconSize} height={iconSize} className={iconClass} />;
    case "beauty":
      return <WellnessIcon width={iconSize} height={iconSize} className={iconClass} />
    case "food":
      return <ServingFoodIcon width={iconSize} height={iconSize} className={iconClass} />;
    case "travel":
      return <PlaneIcon width={iconSize} height={iconSize} className={iconClass} />
    case "services":
      return <LuggageIcon width={iconSize} height={iconSize} className={iconClass} />
    case "shopping":
      return <BagIcon width={iconSize} height={iconSize} className={iconClass} />
    case "promos":
      return <CouponIcon width={iconSize} height={iconSize} className={iconClass} />
    case "things_to_do":
      return <RollerSkateIcon width={iconSize} height={iconSize} className={iconClass} />
    case "gifts":
      return <GiftIcon width={iconSize} height={iconSize} className={iconClass} />;
  
  }
};

export const CATEGORIES: CategoryConfig[] = [
  { key: "top", label: "Top", icon: categoryIcon("top"), href: "/", subcategories: [] },
  {
    key: "influencers",
    label: "Influencers",
    icon: categoryIcon("influencers"),
    href: "/influencers",
    subcategories: [],
  },
  {
    key: "beauty",
    label: "Belleza y Spas",
    icon: categoryIcon("beauty"),
    href: "/c/beauty",
    subcategories: [
      { key: "spa", label: "Spa", href: "/c/beauty/spa" },
      { key: "hair", label: "Peluquería", href: "/c/beauty/hair" },
      { key: "nails", label: "Uñas", href: "/c/beauty/nails" },
    ],
  },
  {
    key: "food",
    label: "Gastronomía",
    icon: categoryIcon("food"),
    href: "/c/food",
    subcategories: [
      {
        key: "restaurants",
        label: "Restaurantes",
        href: "/c/food/restaurants",
      },
      { key: "coffee", label: "Café", href: "/c/food/coffee" },
      { key: "dessert", label: "Postres", href: "/c/food/dessert" },
    ],
  },
  {
    key: "things_to_do",
    label: "Cosas que hacer",
    icon: categoryIcon("things_to_do"),
    href: "/c/things_to_do",
    subcategories: [
      { key: "cinema", label: "Cine", href: "/c/things_to_do/cinema" },
      { key: "events", label: "Eventos", href: "/c/things_to_do/events" },
      { key: "kids", label: "Planes con niños", href: "/c/things_to_do/kids" },
    ],
  },
  {
    key: "services",
    label: "Servicios",
    icon: categoryIcon("services"),
    href: "/c/services",
    subcategories: [
      { key: "home", label: "Hogar", href: "/c/services/home" },
      { key: "cars", label: "Auto", href: "/c/services/cars" },
      { key: "repairs", label: "Reparaciones", href: "/c/services/repairs" },
    ],
  },
  {
    key: "shopping",
    label: "Producto",
    icon: categoryIcon("shopping"),
    href: "/c/shopping",
    subcategories: [
      { key: "fashion", label: "Moda", href: "/c/shopping/fashion" },
      { key: "tech", label: "Tecnología", href: "/c/shopping/tech" },
    ],
  },
  {
    key: "travel",
    label: "Viajes",
    icon: categoryIcon("travel"),
    href: "/c/travel",
    subcategories: [
      { key: "hotels", label: "Hoteles", href: "/c/travel/hotels" },
      { key: "tours", label: "Tours", href: "/c/travel/tours" },
    ],
  },
  {
    key: "gifts",
    label: "Regalos",
    icon: categoryIcon("gifts"),
    href: "/c/gifts",
    subcategories: [],
  },
];
