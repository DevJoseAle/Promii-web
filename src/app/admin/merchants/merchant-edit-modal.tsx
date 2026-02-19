"use client";

import { useCallback, useEffect, useState } from "react";
import { COLORS } from "@/config/colors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastService } from "@/lib/toast/toast.service";
import { X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import {
  getMerchantById,
  updateMerchant,
  type MerchantFull,
  type MerchantUpdatePayload,
} from "@/lib/services/admin/merchants.admin.service";
import { CATEGORIES } from "@/config/categories";

// ─── helpers ──────────────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
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
        disabled={disabled}
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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

// ─── category options ─────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: "", label: "— ninguna —" },
  ...CATEGORIES.map((c) => ({ value: c.key, label: c.label })),
];

// ─── plan options ─────────────────────────────────────────────────────────────

const PLAN_ID_OPTIONS = [
  { value: "basic", label: "Basic" },
  { value: "pro", label: "Pro" },
  { value: "premium", label: "Premium" },
];

const PLAN_STATUS_OPTIONS = [
  { value: "inactive", label: "Inactivo" },
  { value: "active", label: "Activo" },
  { value: "expired", label: "Expirado" },
  { value: "cancelled", label: "Cancelado" },
];

const VERIFICATION_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "approved", label: "Aprobado" },
  { value: "rejected", label: "Rechazado" },
  { value: "blocked", label: "Bloqueado" },
];

// ─── component ────────────────────────────────────────────────────────────────

type Props = {
  isOpen: boolean;
  onClose: () => void;
  merchantId: string;
  merchantName: string;
  onSaved: () => void;
};

export function MerchantEditModal({ isOpen, onClose, merchantId, merchantName, onSaved }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<MerchantFull | null>(null);

  const loadMerchant = useCallback(async () => {
    setLoading(true);
    const res = await getMerchantById(merchantId);
    if (res.status === "success") {
      setForm(res.data);
    } else {
      ToastService.showErrorToast("Error al cargar merchant");
      onClose();
    }
    setLoading(false);
  }, [merchantId, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const timeoutId = setTimeout(() => {
      loadMerchant();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [isOpen, loadMerchant]);

  function set(field: keyof MerchantFull, value: string | number | null) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);

    const payload: MerchantUpdatePayload = {
      verification_status: form.verification_status,
      business_name: form.business_name,
      description: form.description,
      category_primary: form.category_primary,
      category_secondary: form.category_secondary || null,
      address_line: form.address_line,
      state: form.state,
      city: form.city,
      zone: form.zone,
      geo_lat: form.geo_lat,
      geo_lng: form.geo_lng,
      contact_name: form.contact_name,
      contact_email: form.contact_email,
      phone: form.phone,
      whatsapp: form.whatsapp,
      instagram_handle: form.instagram_handle,
      website_url: form.website_url,
      pago_movil_bank: form.pago_movil_bank,
      pago_movil_phone: form.pago_movil_phone,
      pago_movil_id_number: form.pago_movil_id_number,
      pago_movil_beneficiary_name: form.pago_movil_beneficiary_name,
      transfer_bank_name: form.transfer_bank_name,
      transfer_account_number: form.transfer_account_number,
      transfer_account_type: form.transfer_account_type,
      transfer_id_number: form.transfer_id_number,
      transfer_beneficiary_name: form.transfer_beneficiary_name,
      usdt_wallet_address: form.usdt_wallet_address,
      crypto_network: form.crypto_network,
      plan_id: form.plan_id,
      plan_status: form.plan_status,
      plan_start_at: form.plan_start_at,
      plan_end_at: form.plan_end_at,
      monthly_promii_limit: form.monthly_promii_limit,
    };

    const res = await updateMerchant(merchantId, payload);
    if (res.status === "success") {
      ToastService.showSuccessToast("Merchant actualizado");
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
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
              Editar Merchant
            </h2>
            <p className="text-xs mt-0.5" style={{ color: COLORS.text.tertiary }}>
              {merchantName}
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
              <Section title="Estado y Plan">
                <SelectField
                  label="Verification Status"
                  value={form.verification_status}
                  onChange={(v) => set("verification_status", v as MerchantFull["verification_status"])}
                  options={VERIFICATION_OPTIONS}
                />
                <SelectField
                  label="Plan"
                  value={form.plan_id}
                  onChange={(v) => set("plan_id", v)}
                  options={PLAN_ID_OPTIONS}
                />
                <SelectField
                  label="Plan Status"
                  value={form.plan_status}
                  onChange={(v) => set("plan_status", v)}
                  options={PLAN_STATUS_OPTIONS}
                />
                <Field
                  label="Límite Promiis/mes"
                  value={String(form.monthly_promii_limit)}
                  onChange={(v) => set("monthly_promii_limit", parseInt(v) || 0)}
                  type="number"
                />
                <Field
                  label="Plan inicio"
                  value={form.plan_start_at?.slice(0, 10) ?? ""}
                  onChange={(v) => set("plan_start_at", v ? new Date(v).toISOString() : null)}
                  type="date"
                />
                <Field
                  label="Plan fin"
                  value={form.plan_end_at?.slice(0, 10) ?? ""}
                  onChange={(v) => set("plan_end_at", v ? new Date(v).toISOString() : null)}
                  type="date"
                />
              </Section>

              <Section title="Negocio">
                <div className="col-span-2">
                  <Field
                    label="Nombre del negocio"
                    value={form.business_name}
                    onChange={(v) => set("business_name", v)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.text.secondary }}>
                    Descripción
                  </label>
                  <textarea
                    value={form.description ?? ""}
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
                <Field
                  label="Merchant Code"
                  value={form.merchant_code}
                  onChange={() => {}}
                  disabled
                />
              </Section>

              <Section title="Ubicación">
                <div className="col-span-2">
                  <Field
                    label="Dirección"
                    value={form.address_line}
                    onChange={(v) => set("address_line", v)}
                  />
                </div>
                <Field label="Estado" value={form.state} onChange={(v) => set("state", v)} />
                <Field label="Ciudad" value={form.city} onChange={(v) => set("city", v)} />
                <Field label="Zona" value={form.zone ?? ""} onChange={(v) => set("zone", v || null)} />
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

              <Section title="Contacto">
                <Field
                  label="Nombre contacto"
                  value={form.contact_name}
                  onChange={(v) => set("contact_name", v)}
                />
                <Field
                  label="Email contacto"
                  value={form.contact_email}
                  onChange={(v) => set("contact_email", v)}
                  type="email"
                />
                <Field label="Teléfono" value={form.phone} onChange={(v) => set("phone", v)} />
                <Field
                  label="WhatsApp"
                  value={form.whatsapp ?? ""}
                  onChange={(v) => set("whatsapp", v || null)}
                />
                <Field
                  label="Instagram"
                  value={form.instagram_handle ?? ""}
                  onChange={(v) => set("instagram_handle", v || null)}
                />
                <Field
                  label="Website"
                  value={form.website_url ?? ""}
                  onChange={(v) => set("website_url", v || null)}
                />
              </Section>

              <Section title="Pago Móvil">
                <Field
                  label="Banco"
                  value={form.pago_movil_bank ?? ""}
                  onChange={(v) => set("pago_movil_bank", v || null)}
                />
                <Field
                  label="Teléfono"
                  value={form.pago_movil_phone ?? ""}
                  onChange={(v) => set("pago_movil_phone", v || null)}
                />
                <Field
                  label="Cédula/RIF"
                  value={form.pago_movil_id_number ?? ""}
                  onChange={(v) => set("pago_movil_id_number", v || null)}
                />
                <Field
                  label="Beneficiario"
                  value={form.pago_movil_beneficiary_name ?? ""}
                  onChange={(v) => set("pago_movil_beneficiary_name", v || null)}
                />
              </Section>

              <Section title="Transferencia">
                <Field
                  label="Banco"
                  value={form.transfer_bank_name ?? ""}
                  onChange={(v) => set("transfer_bank_name", v || null)}
                />
                <Field
                  label="Número de cuenta"
                  value={form.transfer_account_number ?? ""}
                  onChange={(v) => set("transfer_account_number", v || null)}
                />
                <Field
                  label="Tipo de cuenta"
                  value={form.transfer_account_type ?? ""}
                  onChange={(v) => set("transfer_account_type", v || null)}
                />
                <Field
                  label="Cédula/RIF"
                  value={form.transfer_id_number ?? ""}
                  onChange={(v) => set("transfer_id_number", v || null)}
                />
                <div className="col-span-2">
                  <Field
                    label="Beneficiario"
                    value={form.transfer_beneficiary_name ?? ""}
                    onChange={(v) => set("transfer_beneficiary_name", v || null)}
                  />
                </div>
              </Section>

              <Section title="Crypto (USDT)">
                <div className="col-span-2">
                  <Field
                    label="Wallet Address"
                    value={form.usdt_wallet_address ?? ""}
                    onChange={(v) => set("usdt_wallet_address", v || null)}
                  />
                </div>
                <Field
                  label="Red"
                  value={form.crypto_network ?? ""}
                  onChange={(v) => set("crypto_network", v || null)}
                />
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
