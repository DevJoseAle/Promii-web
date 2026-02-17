"use client";

import { useState, useEffect } from "react";
import { COLORS } from "@/config/colors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastService } from "@/lib/toast/toast.service";
import { X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import {
  getPromiiById,
  updatePromii,
  type PromiiFull,
  type PromiiUpdatePayload,
} from "@/lib/services/admin/promiis.admin.service";
import { CATEGORIES } from "@/config/categories";

// ─── shared field components ──────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.text.secondary }}>
        {label}
      </label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 text-sm"
        style={{ backgroundColor: COLORS.background.tertiary, borderColor: COLORS.border.main }}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.text.secondary }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 rounded-md border px-3 text-sm"
        style={{
          backgroundColor: COLORS.background.tertiary,
          borderColor: COLORS.border.main,
          color: COLORS.text.primary,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border rounded-lg overflow-hidden" style={{ borderColor: COLORS.border.light }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold"
        style={{ backgroundColor: COLORS.background.secondary, color: COLORS.text.primary }}
      >
        {title}
        {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>
      {open && <div className="p-4 grid grid-cols-2 gap-3">{children}</div>}
    </div>
  );
}

// ─── options ──────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: "", label: "— ninguna —" },
  ...CATEGORIES.map((c) => ({ value: c.key, label: c.label })),
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Borrador" },
  { value: "active", label: "Activo" },
  { value: "paused", label: "Pausado" },
  { value: "expired", label: "Expirado" },
];

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "VES", label: "VES (Bolívares)" },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 16); // "YYYY-MM-DDTHH:mm"
}

function fromDateInput(val: string): string | null {
  if (!val) return null;
  return new Date(val).toISOString();
}

// ─── component ────────────────────────────────────────────────────────────────

type Props = {
  isOpen: boolean;
  onClose: () => void;
  promiiId: string;
  promiiTitle: string;
  onSaved: () => void;
};

export function PromiiEditModal({ isOpen, onClose, promiiId, promiiTitle, onSaved }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PromiiFull | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    loadPromii();
  }, [isOpen, promiiId]);

  async function loadPromii() {
    setLoading(true);
    const res = await getPromiiById(promiiId);
    if (res.status === "success") {
      setForm(res.data);
    } else {
      ToastService.showErrorToast("Error al cargar promii");
      onClose();
    }
    setLoading(false);
  }

  function set(field: keyof PromiiFull, value: string | number | boolean | null) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);

    const payload: PromiiUpdatePayload = {
      status: form.status,
      title: form.title,
      description: form.description,
      terms: form.terms,
      category_primary: form.category_primary,
      category_secondary: form.category_secondary || null,
      price_amount: form.price_amount,
      price_currency: form.price_currency,
      original_price_amount: form.original_price_amount,
      discount_label: form.discount_label,
      start_at: form.start_at,
      end_at: form.end_at,
      max_redemptions: form.max_redemptions,
      allow_multiple_per_user: form.allow_multiple_per_user,
      max_units_per_user: form.max_units_per_user,
      state: form.state,
      city: form.city,
      zone: form.zone,
      address_line: form.address_line,
      geo_lat: form.geo_lat,
      geo_lng: form.geo_lng,
      allow_influencers: form.allow_influencers,
    };

    const res = await updatePromii(promiiId, payload);
    if (res.status === "success") {
      ToastService.showSuccessToast("Promii actualizado");
      onSaved();
      onClose();
    } else {
      ToastService.showErrorToast(res.error || "Error al guardar");
    }
    setSaving(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div
        className="relative w-full max-w-2xl my-8 rounded-xl shadow-2xl"
        style={{ backgroundColor: COLORS.background.primary }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: COLORS.border.light }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: COLORS.text.primary }}>
              Editar Promii
            </h2>
            <p className="text-xs mt-0.5 max-w-sm truncate" style={{ color: COLORS.text.tertiary }}>
              {promiiTitle}
            </p>
          </div>
          <button onClick={onClose} style={{ color: COLORS.text.tertiary }}>
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {loading || !form ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-8 animate-spin" style={{ color: COLORS.primary.main }} />
            </div>
          ) : (
            <>
              <Section title="Estado y Categorías">
                <SelectField
                  label="Status"
                  value={form.status}
                  onChange={(v) => set("status", v as PromiiFull["status"])}
                  options={STATUS_OPTIONS}
                />
                <SelectField
                  label="Categoría principal"
                  value={form.category_primary}
                  onChange={(v) => set("category_primary", v)}
                  options={CATEGORY_OPTIONS.filter((o) => o.value !== "")}
                />
                <SelectField
                  label="Categoría secundaria"
                  value={form.category_secondary ?? ""}
                  onChange={(v) => set("category_secondary", v || null)}
                  options={CATEGORY_OPTIONS}
                />
              </Section>

              <Section title="Contenido">
                <div className="col-span-2">
                  <Field
                    label="Título"
                    value={form.title}
                    onChange={(v) => set("title", v)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.text.secondary }}>
                    Descripción
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    rows={3}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    style={{
                      backgroundColor: COLORS.background.tertiary,
                      borderColor: COLORS.border.main,
                      color: COLORS.text.primary,
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.text.secondary }}>
                    Términos y condiciones
                  </label>
                  <textarea
                    value={form.terms}
                    onChange={(e) => set("terms", e.target.value)}
                    rows={3}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    style={{
                      backgroundColor: COLORS.background.tertiary,
                      borderColor: COLORS.border.main,
                      color: COLORS.text.primary,
                    }}
                  />
                </div>
              </Section>

              <Section title="Precio">
                <Field
                  label="Precio final"
                  value={String(form.price_amount)}
                  onChange={(v) => set("price_amount", parseFloat(v) || 0)}
                  type="number"
                />
                <SelectField
                  label="Moneda"
                  value={form.price_currency}
                  onChange={(v) => set("price_currency", v)}
                  options={CURRENCY_OPTIONS}
                />
                <Field
                  label="Precio original"
                  value={String(form.original_price_amount ?? "")}
                  onChange={(v) => set("original_price_amount", v ? parseFloat(v) : null)}
                  type="number"
                />
                <Field
                  label="Etiqueta de descuento"
                  value={form.discount_label ?? ""}
                  onChange={(v) => set("discount_label", v || null)}
                />
              </Section>

              <Section title="Fechas y Límites">
                <Field
                  label="Fecha inicio"
                  value={toDateInput(form.start_at)}
                  onChange={(v) => set("start_at", fromDateInput(v) ?? form.start_at)}
                  type="datetime-local"
                />
                <Field
                  label="Fecha fin"
                  value={toDateInput(form.end_at)}
                  onChange={(v) => set("end_at", fromDateInput(v) ?? form.end_at)}
                  type="datetime-local"
                />
                <Field
                  label="Máx. canjes totales"
                  value={String(form.max_redemptions ?? "")}
                  onChange={(v) => set("max_redemptions", v ? parseInt(v) : null)}
                  type="number"
                />
                <Field
                  label="Máx. unidades por usuario"
                  value={String(form.max_units_per_user ?? "")}
                  onChange={(v) => set("max_units_per_user", v ? parseInt(v) : null)}
                  type="number"
                />
                <div className="col-span-2 flex items-center gap-3">
                  <input
                    id="allow_multiple"
                    type="checkbox"
                    checked={form.allow_multiple_per_user}
                    onChange={(e) => set("allow_multiple_per_user", e.target.checked)}
                    className="size-4"
                  />
                  <label
                    htmlFor="allow_multiple"
                    className="text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    Permitir múltiples compras por usuario
                  </label>
                </div>
              </Section>

              <Section title="Ubicación">
                <Field label="Estado" value={form.state} onChange={(v) => set("state", v)} />
                <Field label="Ciudad" value={form.city} onChange={(v) => set("city", v)} />
                <Field
                  label="Zona"
                  value={form.zone ?? ""}
                  onChange={(v) => set("zone", v || null)}
                />
                <Field
                  label="Dirección"
                  value={form.address_line ?? ""}
                  onChange={(v) => set("address_line", v || null)}
                />
                <Field
                  label="Geo Lat"
                  value={String(form.geo_lat ?? "")}
                  onChange={(v) => set("geo_lat", v ? parseFloat(v) : null)}
                  type="number"
                />
                <Field
                  label="Geo Lng"
                  value={String(form.geo_lng ?? "")}
                  onChange={(v) => set("geo_lng", v ? parseFloat(v) : null)}
                  type="number"
                />
              </Section>

              <Section title="Influencers">
                <div className="col-span-2 flex items-center gap-3">
                  <input
                    id="allow_influencers"
                    type="checkbox"
                    checked={form.allow_influencers}
                    onChange={(e) => set("allow_influencers", e.target.checked)}
                    className="size-4"
                  />
                  <label
                    htmlFor="allow_influencers"
                    className="text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    Permite influencers
                  </label>
                </div>
              </Section>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && form && (
          <div
            className="flex items-center justify-end gap-3 px-6 py-4 border-t"
            style={{ borderColor: COLORS.border.light }}
          >
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              style={{ backgroundColor: COLORS.primary.main, color: "white" }}
            >
              {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Guardar cambios
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
