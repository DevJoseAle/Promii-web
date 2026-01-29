export type PromiiMock = {
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

  about?: string;
  highlights?: string[];
  terms?: string[];
  redeem?: string[];
};

export const PROMIIS: PromiiMock[] = [
  {
    id: "1",
    title: "Corte + barba + lavado premium",
    merchant: "Barbería Black",
    location: "Caracas · Chacao",
    rating: 4.8,
    sold: 1200,
    oldPrice: 30,
    price: 12,
    discountPct: 60,
    tag: "Top",
    about:
      "Un servicio premium para salir impecable hoy mismo. Reserva por WhatsApp y paga directo al comercio.",
    highlights: ["Incluye lavado", "Barba con perfilado", "Atención sin cita (según disponibilidad)"],
    terms: ["Válido de lunes a jueves", "No aplica con otras promos", "Sujeto a disponibilidad"],
    redeem: ["Compra/asegura tu cupo", "Escribe por WhatsApp al comercio", "Muestra tu código al llegar"],
  },
  {
    id: "2",
    title: "2x1 en pizzas artesanales",
    merchant: "Pizzería Napoli",
    location: "Valencia · El Viñedo",
    rating: 4.6,
    sold: 800,
    oldPrice: 25,
    price: 10,
    discountPct: 60,
    tag: "Nuevo",
    about:
      "Promo ideal para compartir. Canjea fácil y rápido con tu código.",
    highlights: ["Ingredientes frescos", "Masa artesanal", "Listo en 15-25 min"],
    terms: ["Solo para retirar", "Válido hasta agotar cupos diarios"],
    redeem: ["Contacta al comercio", "Indica la promo Promii", "Canjea con tu código"],
  },
  {
    id: "3",
    title: "Spa: masaje + hidratación facial",
    merchant: "Aura Spa",
    location: "Caracas · Las Mercedes",
    rating: 4.7,
    sold: 500,
    oldPrice: 50,
    price: 19,
    discountPct: 62,
    about:
      "Relájate y recarga. Perfecto para un regalo o un capricho.",
    highlights: ["Masaje relajante", "Hidratación facial", "Ambiente premium"],
    terms: ["Requiere reserva", "Válido 30 días desde la compra"],
    redeem: ["Reserva por WhatsApp", "Confirma disponibilidad", "Presenta tu código"],
  },
];
