
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Promii, PromiiCard } from "@/components/ui/promii-card";
import { useAuth } from "@/lib/context/AuthContext";


const MOCK: Promii[] = [
  {
    id: "1",
    title: "Corte + barba + lavado premium",
    merchant: "Barbería Central",
    location: "Caracas · Chacao",
    rating: 4.8,
    sold: 1200,
    oldPrice: 30,
    price: 12,
    discountPct: 60,
    tag: "Mejor valorado",
  },
  {
    id: "2",
    title: "2x1 en pizzas artesanales",
    merchant: "La Trattoria",
    location: "Valencia · El Viñedo",
    rating: 4.6,
    sold: 800,
    oldPrice: 25,
    price: 10,
    discountPct: 60,
    tag: "Top",
  },
  {
    id: "3",
    title: "Spa: masaje + hidratación facial",
    merchant: "Serenity Spa",
    location: "Caracas · Las Mercedes",
    rating: 4.7,
    sold: 500,
    oldPrice: 50,
    price: 19,
    discountPct: 62,
    tag: "Más vendido",
  },
];



export default function HomePage() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-bold text-text-primary">
          Hola, date un capricho hoy con un gran Promii
        </h1>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {MOCK.map((p) => (
            <PromiiCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-muted p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Tendencias</h2>
          <Button variant="outline">Mostrar todo</Button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {MOCK.concat(MOCK).slice(0, 4).map((p, idx) => (
            <PromiiCard key={`${p.id}-${idx}`} p={p} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-xl font-bold text-text-primary">Ofertas de comida</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Descubre promos en restaurantes, cafés y postres.
          </p>
          <Button className="mt-4 bg-primary text-white hover:bg-primary/90">
            Ver gastronomía
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-xl font-bold text-text-primary">Planes y experiencias</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Cine, eventos y cosas que hacer cerca de ti.
          </p>
          <Button className="mt-4 bg-primary text-white hover:bg-primary/90">
            Ver experiencias
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-text-primary">Popular en Promii</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {MOCK.concat(MOCK).slice(0, 8).map((p, idx) => (
            <PromiiCard key={`${p.id}-popular-${idx}`} p={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
