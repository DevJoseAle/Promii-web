"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COLORS } from "@/config/colors";
import { supabase } from "@/lib/supabase/supabase.client";

type OfferType = "fixed" | "barter" | "mixed";

type Offer = {
  id: string;
  influencer_id: string;
  type: OfferType;
  title: string;
  description: string;
  price_usd: number | null;
  barter_description: string | null;
  is_active: boolean;
  created_at: string;
};

type OfferFormState = {
  id?: string;
  type: OfferType;
  title: string;
  description: string;
  price_usd: string;
  barter_description: string;
  is_active: boolean;
};

const emptyForm: OfferFormState = {
  type: "fixed",
  title: "",
  description: "",
  price_usd: "",
  barter_description: "",
  is_active: true,
};

function formatPrice(value: number | null) {
  if (value == null || Number.isNaN(value)) return "N/A";
  return `$${value.toFixed(2)}`;
}

export function OffersTab({ influencerId }: { influencerId: string }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<OfferFormState>(emptyForm);

  const isEditing = !!form.id;

  const loadOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("influencer_offers")
      .select("*")
      .eq("influencer_id", influencerId)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message || "Error al cargar ofertas");
      setOffers([]);
    } else {
      setOffers((data as Offer[]) || []);
    }
    setLoading(false);
  }, [influencerId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadOffers();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [loadOffers]);

  const canShowPrice = form.type === "fixed" || form.type === "mixed";
  const canShowBarter = form.type === "barter" || form.type === "mixed";

  const formError = useMemo(() => {
    if (!form.title.trim()) return "El título es requerido.";
    if (!form.description.trim()) return "La descripción es requerida.";
    if (canShowPrice && !form.price_usd.trim()) return "El precio es requerido.";
    if (canShowBarter && !form.barter_description.trim()) return "El detalle de canje es requerido.";
    return null;
  }, [form, canShowPrice, canShowBarter]);

  function openCreate() {
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(offer: Offer) {
    setForm({
      id: offer.id,
      type: offer.type,
      title: offer.title,
      description: offer.description,
      price_usd: offer.price_usd != null ? String(offer.price_usd) : "",
      barter_description: offer.barter_description ?? "",
      is_active: offer.is_active,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (formError) return;
    setSaving(true);
    setError(null);

    const payload = {
      influencer_id: influencerId,
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim(),
      price_usd: canShowPrice ? Number(form.price_usd) : null,
      barter_description: canShowBarter ? form.barter_description.trim() : null,
      is_active: form.is_active,
    };

    const response = form.id
      ? await supabase.from("influencer_offers").update(payload).eq("id", form.id)
      : await supabase.from("influencer_offers").insert(payload);

    if (response.error) {
      setError(response.error.message || "Error al guardar la oferta");
      setSaving(false);
      return;
    }

    setModalOpen(false);
    setForm(emptyForm);
    await loadOffers();
    setSaving(false);
  }

  async function handleToggleActive(offer: Offer) {
    const { error: updateError } = await supabase
      .from("influencer_offers")
      .update({ is_active: !offer.is_active })
      .eq("id", offer.id);

    if (updateError) {
      setError(updateError.message || "No se pudo actualizar la oferta");
      return;
    }
    await loadOffers();
  }

  async function handleDelete(offer: Offer) {
    const confirmed = window.confirm("¿Eliminar esta oferta? Esta acción no se puede deshacer.");
    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("influencer_offers")
      .delete()
      .eq("id", offer.id);

    if (deleteError) {
      setError(deleteError.message || "No se pudo eliminar la oferta");
      return;
    }
    await loadOffers();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: COLORS.text.primary }}>
            Mis Ofertas
          </h2>
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            Define tus tarifas y modalidades para negociar con marcas.
          </p>
        </div>
        <Button onClick={openCreate}>Crear oferta</Button>
      </div>

      {error && (
        <div
          className="rounded-lg border p-4 text-sm"
          style={{
            backgroundColor: COLORS.error.lighter,
            borderColor: COLORS.error.light,
            color: COLORS.error.dark,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: COLORS.text.secondary }}>Cargando ofertas…</p>
      ) : offers.length === 0 ? (
        <div
          className="rounded-2xl border p-6 text-center"
          style={{
            borderColor: COLORS.border.light,
            backgroundColor: COLORS.background.secondary,
          }}
        >
          <p className="text-sm mb-4" style={{ color: COLORS.text.secondary }}>
            Aún no tienes ofertas publicadas.
          </p>
          <Button onClick={openCreate}>Crear mi primera oferta</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="rounded-2xl border p-5"
              style={{
                borderColor: COLORS.border.light,
                backgroundColor: COLORS.background.primary,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold" style={{ color: COLORS.text.primary }}>
                      {offer.title}
                    </h3>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{
                        backgroundColor: COLORS.primary.lighter,
                        color: COLORS.primary.main,
                      }}
                    >
                      {offer.type === "fixed"
                        ? "Fee fijo"
                        : offer.type === "barter"
                          ? "Canje"
                          : "Mixto"}
                    </span>
                    {!offer.is_active && (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: COLORS.warning.lighter,
                          color: COLORS.warning.dark,
                        }}
                      >
                        Inactiva
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
                    {offer.description}
                  </p>
                  <div className="mt-3 text-sm" style={{ color: COLORS.text.secondary }}>
                    {offer.price_usd != null && (
                      <div>Precio: <span style={{ color: COLORS.text.primary }}>{formatPrice(offer.price_usd)}</span></div>
                    )}
                    {offer.barter_description && (
                      <div>Canje: <span style={{ color: COLORS.text.primary }}>{offer.barter_description}</span></div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button variant="outline" onClick={() => openEdit(offer)}>
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleToggleActive(offer)}
                  >
                    {offer.is_active ? "Desactivar" : "Activar"}
                  </Button>
                  <Button variant="destructive" onClick={() => handleDelete(offer)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            className="w-full max-w-lg rounded-2xl border p-6 shadow-lg"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: COLORS.text.primary }}>
                {isEditing ? "Editar oferta" : "Nueva oferta"}
              </h3>
              <button
                className="text-sm"
                onClick={() => setModalOpen(false)}
                style={{ color: COLORS.text.secondary }}
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  Tipo de negociación
                </label>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: COLORS.border.main }}
                  value={form.type}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, type: e.target.value as OfferType }))
                  }
                >
                  <option value="fixed">Fee fijo</option>
                  <option value="barter">Canje</option>
                  <option value="mixed">Mixto</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  Título
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Paquete IG básico"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  Descripción
                </label>
                <textarea
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  style={{ borderColor: COLORS.border.main }}
                />
              </div>

              {canShowPrice && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                    Precio (USD)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price_usd}
                    onChange={(e) => setForm((prev) => ({ ...prev, price_usd: e.target.value }))}
                    placeholder="150"
                  />
                </div>
              )}

              {canShowBarter && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                    Descripción del canje
                  </label>
                  <Input
                    value={form.barter_description}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, barter_description: e.target.value }))
                    }
                    placeholder="Ej: Cena para 2 en restaurante"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <input
                  id="offer-active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                />
                <label htmlFor="offer-active" style={{ color: COLORS.text.secondary }}>
                  Oferta activa
                </label>
              </div>

              {formError && (
                <p className="text-sm" style={{ color: COLORS.error.dark }}>
                  {formError}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving || !!formError}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
