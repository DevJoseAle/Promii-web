"use client";

import { useCallback, useEffect, useState } from "react";
import { COLORS } from "@/config/colors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastService } from "@/lib/toast/toast.service";
import { X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import {
  getInfluencerById,
  updateInfluencer,
  type InfluencerFull,
  type InfluencerUpdatePayload,
} from "@/lib/services/admin/influencers.admin.service";
import { CATEGORIES } from "@/config/categories";

// ─── shared field components (mismo patrón que merchant-edit-modal) ───────────

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

const VERIFICATION_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "approved", label: "Aprobado" },
  { value: "rejected", label: "Rechazado" },
  { value: "blocked", label: "Bloqueado" },
];

const COLLABORATION_OPTIONS = ["commission", "fixed_fee", "barter", "gifting"];

// ─── component ────────────────────────────────────────────────────────────────

type Props = {
  isOpen: boolean;
  onClose: () => void;
  influencerId: string;
  influencerName: string;
  onSaved: () => void;
};

export function InfluencerEditModal({ isOpen, onClose, influencerId, influencerName, onSaved }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<InfluencerFull | null>(null);

  const loadInfluencer = useCallback(async () => {
    setLoading(true);
    const res = await getInfluencerById(influencerId);
    if (res.status === "success") {
      setForm(res.data);
    } else {
      ToastService.showErrorToast("Error al cargar influencer");
      onClose();
    }
    setLoading(false);
  }, [influencerId, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const timeoutId = setTimeout(() => {
      loadInfluencer();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [isOpen, loadInfluencer]);

  function set(field: keyof InfluencerFull, value: string | number | boolean | string[] | null) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  function toggleCollaboration(type: string) {
    if (!form) return;
    const current = form.collaboration_types;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    set("collaboration_types", updated);
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);

    const payload: InfluencerUpdatePayload = {
      verification_status: form.verification_status,
      display_name: form.display_name,
      bio: form.bio,
      niche_primary: form.niche_primary,
      niche_secondary: form.niche_secondary || null,
      state: form.state,
      city: form.city,
      zone: form.zone,
      instagram_handle: form.instagram_handle,
      tiktok_handle: form.tiktok_handle,
      youtube_handle: form.youtube_handle,
      link_in_bio_url: form.link_in_bio_url,
      collaboration_types: form.collaboration_types,
      accepts_barter: form.accepts_barter,
      min_fee_usd: form.min_fee_usd,
    };

    const res = await updateInfluencer(influencerId, payload);
    if (res.status === "success") {
      ToastService.showSuccessToast("Influencer actualizado");
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
              Editar Influencer
            </h2>
            <p className="text-xs mt-0.5" style={{ color: COLORS.text.tertiary }}>
              {influencerName}
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
              <Section title="Estado">
                <SelectField
                  label="Verification Status"
                  value={form.verification_status}
                  onChange={(v) => set("verification_status", v as InfluencerFull["verification_status"])}
                  options={VERIFICATION_OPTIONS}
                />
                <div className="flex items-center gap-3 self-end pb-1">
                  <input
                    id="accepts_barter"
                    type="checkbox"
                    checked={form.accepts_barter}
                    onChange={(e) => set("accepts_barter", e.target.checked)}
                    className="size-4"
                  />
                  <label
                    htmlFor="accepts_barter"
                    className="text-sm font-semibold"
                    style={{ color: COLORS.text.primary }}
                  >
                    Acepta barter
                  </label>
                </div>
              </Section>

              <Section title="Perfil">
                <div className="col-span-2">
                  <Field
                    label="Nombre público"
                    value={form.display_name}
                    onChange={(v) => set("display_name", v)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.text.secondary }}>
                    Bio
                  </label>
                  <textarea
                    value={form.bio ?? ""}
                    onChange={(e) => set("bio", e.target.value || null)}
                    rows={3}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    style={{
                      backgroundColor: COLORS.background.tertiary,
                      borderColor: COLORS.border.main,
                      color: COLORS.text.primary,
                    }}
                  />
                </div>
                <SelectField
                  label="Nicho principal"
                  value={form.niche_primary}
                  onChange={(v) => set("niche_primary", v)}
                  options={CATEGORY_OPTIONS.filter((o) => o.value !== "")}
                />
                <SelectField
                  label="Nicho secundario"
                  value={form.niche_secondary ?? ""}
                  onChange={(v) => set("niche_secondary", v || null)}
                  options={CATEGORY_OPTIONS}
                />
                <Field
                  label="Fee mínimo (USD)"
                  value={String(form.min_fee_usd ?? "")}
                  onChange={(v) => set("min_fee_usd", v ? parseFloat(v) : null)}
                  type="number"
                />
              </Section>

              <Section title="Redes sociales">
                <Field
                  label="Instagram"
                  value={form.instagram_handle}
                  onChange={(v) => set("instagram_handle", v)}
                />
                <Field
                  label="TikTok"
                  value={form.tiktok_handle ?? ""}
                  onChange={(v) => set("tiktok_handle", v || null)}
                />
                <Field
                  label="YouTube"
                  value={form.youtube_handle ?? ""}
                  onChange={(v) => set("youtube_handle", v || null)}
                />
                <Field
                  label="Link in bio"
                  value={form.link_in_bio_url ?? ""}
                  onChange={(v) => set("link_in_bio_url", v || null)}
                />
              </Section>

              <Section title="Ubicación">
                <Field label="Estado" value={form.state} onChange={(v) => set("state", v)} />
                <Field label="Ciudad" value={form.city} onChange={(v) => set("city", v)} />
                <div className="col-span-2">
                  <Field
                    label="Zona"
                    value={form.zone ?? ""}
                    onChange={(v) => set("zone", v || null)}
                  />
                </div>
              </Section>

              <Section title="Tipos de colaboración">
                <div className="col-span-2 flex flex-wrap gap-3">
                  {COLLABORATION_OPTIONS.map((type) => {
                    const active = form.collaboration_types.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleCollaboration(type)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
                        style={{
                          backgroundColor: active ? COLORS.primary.main : COLORS.background.tertiary,
                          color: active ? "white" : COLORS.text.secondary,
                          borderColor: active ? COLORS.primary.main : COLORS.border.main,
                        }}
                      >
                        {type}
                      </button>
                    );
                  })}
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
