"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { COLORS } from "@/config/colors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Store,
  Phone,
  MapPin,
  Instagram,
  Globe,
  CreditCard,
  Loader2,
  Save,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase/supabase.client";
import { VENEZUELA_STATES } from "@/config/locations/states";
import { getCitiesByState } from "@/config/locations/cities";

type MerchantData = {
  // Personal info
  first_name: string;
  last_name: string;
  email: string;

  // Business info
  business_name: string;
  description: string;
  phone: string;
  whatsapp: string;

  // Address
  address_line: string;
  state: string;
  city: string;
  zone: string;

  // Social
  instagram_handle: string;
  website_url: string;

  // Payment - Pago Móvil
  pago_movil_bank: string;
  pago_movil_phone: string;
  pago_movil_id_number: string;
  pago_movil_beneficiary_name: string;

  // Payment - Transfer
  transfer_bank_name: string;
  transfer_account_number: string;
  transfer_account_type: string;
  transfer_id_number: string;
  transfer_beneficiary_name: string;

  // Payment - Crypto
  usdt_wallet_address: string;
  crypto_network: string;
};

export default function SettingsPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<MerchantData>({
    first_name: "",
    last_name: "",
    email: "",
    business_name: "",
    description: "",
    phone: "",
    whatsapp: "",
    address_line: "",
    state: "",
    city: "",
    zone: "",
    instagram_handle: "",
    website_url: "",
    pago_movil_bank: "",
    pago_movil_phone: "",
    pago_movil_id_number: "",
    pago_movil_beneficiary_name: "",
    transfer_bank_name: "",
    transfer_account_number: "",
    transfer_account_type: "",
    transfer_id_number: "",
    transfer_beneficiary_name: "",
    usdt_wallet_address: "",
    crypto_network: "",
  });

  const filteredCities = useMemo(() => {
    if (!formData.state) return [];
    return getCitiesByState(formData.state);
  }, [formData.state]);

  useEffect(() => {
    if (profile?.id) {
      loadMerchantData();
    }
  }, [profile?.id]);

  const loadMerchantData = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name, email")
        .eq("id", profile.id)
        .single();

      if (profileError) throw profileError;

      // Get merchant data
      const { data: merchantData, error: merchantError } = await supabase
        .from("merchants")
        .select("*")
        .eq("id", profile.id)
        .single();

      if (merchantError) throw merchantError;

      setFormData({
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        email: profileData.email || "",
        business_name: merchantData.business_name || "",
        description: merchantData.description || "",
        phone: merchantData.phone || "",
        whatsapp: merchantData.whatsapp || "",
        address_line: merchantData.address_line || "",
        state: merchantData.state || "",
        city: merchantData.city || "",
        zone: merchantData.zone || "",
        instagram_handle: merchantData.instagram_handle || "",
        website_url: merchantData.website_url || "",
        pago_movil_bank: merchantData.pago_movil_bank || "",
        pago_movil_phone: merchantData.pago_movil_phone || "",
        pago_movil_id_number: merchantData.pago_movil_id_number || "",
        pago_movil_beneficiary_name: merchantData.pago_movil_beneficiary_name || "",
        transfer_bank_name: merchantData.transfer_bank_name || "",
        transfer_account_number: merchantData.transfer_account_number || "",
        transfer_account_type: merchantData.transfer_account_type || "",
        transfer_id_number: merchantData.transfer_id_number || "",
        transfer_beneficiary_name: merchantData.transfer_beneficiary_name || "",
        usdt_wallet_address: merchantData.usdt_wallet_address || "",
        crypto_network: merchantData.crypto_network || "",
      });
    } catch (err: any) {
      console.error("Error loading merchant data:", err);
      setError(err.message || "Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Validations
      if (!formData.first_name.trim() || !formData.last_name.trim()) {
        throw new Error("Nombre y apellido son obligatorios");
      }

      if (!formData.business_name.trim()) {
        throw new Error("Nombre del negocio es obligatorio");
      }

      if (!formData.phone.trim()) {
        throw new Error("Teléfono es obligatorio");
      }

      if (!formData.address_line.trim()) {
        throw new Error("Dirección es obligatoria");
      }

      if (!formData.state || !formData.city) {
        throw new Error("Estado y ciudad son obligatorios");
      }

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
        })
        .eq("id", profile.id);

      if (profileError) throw profileError;

      // Update merchant
      const { error: merchantError } = await supabase
        .from("merchants")
        .update({
          business_name: formData.business_name.trim(),
          description: formData.description.trim() || null,
          phone: formData.phone.trim(),
          whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
          address_line: formData.address_line.trim(),
          state: formData.state,
          city: formData.city,
          zone: formData.zone.trim() || null,
          contact_name: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
          instagram_handle: formData.instagram_handle.trim() || null,
          website_url: formData.website_url.trim() || null,
          pago_movil_bank: formData.pago_movil_bank.trim() || null,
          pago_movil_phone: formData.pago_movil_phone.trim() || null,
          pago_movil_id_number: formData.pago_movil_id_number.trim() || null,
          pago_movil_beneficiary_name: formData.pago_movil_beneficiary_name.trim() || null,
          transfer_bank_name: formData.transfer_bank_name.trim() || null,
          transfer_account_number: formData.transfer_account_number.trim() || null,
          transfer_account_type: formData.transfer_account_type.trim() || null,
          transfer_id_number: formData.transfer_id_number.trim() || null,
          transfer_beneficiary_name: formData.transfer_beneficiary_name.trim() || null,
          usdt_wallet_address: formData.usdt_wallet_address.trim() || null,
          crypto_network: formData.crypto_network.trim() || null,
        })
        .eq("id", profile.id);

      if (merchantError) throw merchantError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving:", err);
      setError(err.message || "Error guardando cambios");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof MerchantData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin" style={{ color: COLORS.primary.main }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: COLORS.text.primary }}>
          Configuración
        </h1>
        <p className="mt-2 text-base" style={{ color: COLORS.text.secondary }}>
          Actualiza la información de tu perfil y negocio
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success/Error Messages */}
        {success && (
          <div
            className="flex items-start gap-3 rounded-lg border p-4"
            style={{
              backgroundColor: COLORS.success.lighter,
              borderColor: COLORS.success.light,
            }}
          >
            <CheckCircle2 className="size-5 shrink-0" style={{ color: COLORS.success.main }} />
            <div className="text-sm font-semibold" style={{ color: COLORS.success.dark }}>
              Cambios guardados exitosamente
            </div>
          </div>
        )}

        {error && (
          <div
            className="flex items-start gap-3 rounded-lg border p-4"
            style={{
              backgroundColor: COLORS.error.lighter,
              borderColor: COLORS.error.light,
            }}
          >
            <AlertCircle className="size-5 shrink-0" style={{ color: COLORS.error.main }} />
            <div className="text-sm" style={{ color: COLORS.error.dark }}>
              {error}
            </div>
          </div>
        )}

        {/* Personal Info */}
        <div
          className="rounded-xl border p-6 space-y-4"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: COLORS.border.light }}>
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS.primary.lighter, color: COLORS.primary.main }}
            >
              <User className="size-5" />
            </div>
            <div>
              <div className="font-semibold" style={{ color: COLORS.text.primary }}>
                Información Personal
              </div>
              <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                Tu nombre y datos de contacto
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                Nombre <span style={{ color: COLORS.error.main }}>*</span>
              </label>
              <Input
                value={formData.first_name}
                onChange={(e) => updateField("first_name", e.target.value)}
                required
                className="h-11"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: COLORS.border.main,
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                Apellido <span style={{ color: COLORS.error.main }}>*</span>
              </label>
              <Input
                value={formData.last_name}
                onChange={(e) => updateField("last_name", e.target.value)}
                required
                className="h-11"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: COLORS.border.main,
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
              Email
            </label>
            <Input
              value={formData.email}
              disabled
              className="h-11"
              style={{
                backgroundColor: COLORS.background.tertiary,
                borderColor: COLORS.border.main,
                opacity: 0.6,
                cursor: "not-allowed",
              }}
            />
            <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
              El email no se puede cambiar
            </p>
          </div>
        </div>

        {/* Business Info */}
        <div
          className="rounded-xl border p-6 space-y-4"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: COLORS.border.light }}>
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS.success.lighter, color: COLORS.success.main }}
            >
              <Store className="size-5" />
            </div>
            <div>
              <div className="font-semibold" style={{ color: COLORS.text.primary }}>
                Información del Negocio
              </div>
              <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                Datos públicos de tu negocio
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
              Nombre del Negocio <span style={{ color: COLORS.error.main }}>*</span>
            </label>
            <Input
              value={formData.business_name}
              onChange={(e) => updateField("business_name", e.target.value)}
              required
              className="h-11"
              style={{
                backgroundColor: COLORS.background.tertiary,
                borderColor: COLORS.border.main,
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe tu negocio..."
              rows={3}
              className="w-full rounded-lg border p-3 text-sm"
              style={{
                backgroundColor: COLORS.background.tertiary,
                borderColor: COLORS.border.main,
                color: COLORS.text.primary,
              }}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                Teléfono <span style={{ color: COLORS.error.main }}>*</span>
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
                  style={{ color: COLORS.text.tertiary }}
                />
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+58 414 123 4567"
                  required
                  className="h-11 pl-11"
                  style={{
                    backgroundColor: COLORS.background.tertiary,
                    borderColor: COLORS.border.main,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                WhatsApp
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
                  style={{ color: COLORS.text.tertiary }}
                />
                <Input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                  placeholder="+58 414 123 4567"
                  className="h-11 pl-11"
                  style={{
                    backgroundColor: COLORS.background.tertiary,
                    borderColor: COLORS.border.main,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div
          className="rounded-xl border p-6 space-y-4"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: COLORS.border.light }}>
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS.warning.lighter, color: COLORS.warning.main }}
            >
              <MapPin className="size-5" />
            </div>
            <div>
              <div className="font-semibold" style={{ color: COLORS.text.primary }}>
                Ubicación
              </div>
              <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                Dirección física del negocio
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
              Dirección <span style={{ color: COLORS.error.main }}>*</span>
            </label>
            <Input
              value={formData.address_line}
              onChange={(e) => updateField("address_line", e.target.value)}
              placeholder="Av. Principal, Centro Comercial..."
              required
              className="h-11"
              style={{
                backgroundColor: COLORS.background.tertiary,
                borderColor: COLORS.border.main,
              }}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                Estado <span style={{ color: COLORS.error.main }}>*</span>
              </label>
              <select
                value={formData.state}
                onChange={(e) => {
                  updateField("state", e.target.value);
                  updateField("city", "");
                }}
                required
                className="h-11 w-full rounded-lg border px-4 text-sm"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: COLORS.border.main,
                  color: COLORS.text.primary,
                }}
              >
                <option value="">Selecciona un estado</option>
                {VENEZUELA_STATES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                Ciudad <span style={{ color: COLORS.error.main }}>*</span>
              </label>
              <select
                value={formData.city}
                onChange={(e) => updateField("city", e.target.value)}
                required
                disabled={!formData.state}
                className="h-11 w-full rounded-lg border px-4 text-sm"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: COLORS.border.main,
                  color: COLORS.text.primary,
                }}
              >
                <option value="">Selecciona una ciudad</option>
                {filteredCities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
              Zona / Sector
            </label>
            <Input
              value={formData.zone}
              onChange={(e) => updateField("zone", e.target.value)}
              placeholder="Ej: Centro, Zona Industrial..."
              className="h-11"
              style={{
                backgroundColor: COLORS.background.tertiary,
                borderColor: COLORS.border.main,
              }}
            />
          </div>
        </div>

        {/* Social Media */}
        <div
          className="rounded-xl border p-6 space-y-4"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: COLORS.border.light }}>
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS.info.lighter, color: COLORS.info.main }}
            >
              <Instagram className="size-5" />
            </div>
            <div>
              <div className="font-semibold" style={{ color: COLORS.text.primary }}>
                Redes Sociales
              </div>
              <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                Enlaces a tus perfiles (opcional)
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                Instagram
              </label>
              <div className="relative">
                <Instagram
                  className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
                  style={{ color: COLORS.text.tertiary }}
                />
                <Input
                  value={formData.instagram_handle}
                  onChange={(e) => updateField("instagram_handle", e.target.value)}
                  placeholder="@tuusuario"
                  className="h-11 pl-11"
                  style={{
                    backgroundColor: COLORS.background.tertiary,
                    borderColor: COLORS.border.main,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                Sitio Web
              </label>
              <div className="relative">
                <Globe
                  className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
                  style={{ color: COLORS.text.tertiary }}
                />
                <Input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => updateField("website_url", e.target.value)}
                  placeholder="https://tusitio.com"
                  className="h-11 pl-11"
                  style={{
                    backgroundColor: COLORS.background.tertiary,
                    borderColor: COLORS.border.main,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div
          className="rounded-xl border p-6 space-y-4"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: COLORS.border.light }}>
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS.success.lighter, color: COLORS.success.main }}
            >
              <CreditCard className="size-5" />
            </div>
            <div>
              <div className="font-semibold" style={{ color: COLORS.text.primary }}>
                Métodos de Pago
              </div>
              <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                Configura cómo recibirás pagos (opcional)
              </div>
            </div>
          </div>

          {/* Pago Móvil */}
          <div className="space-y-3">
            <div className="font-semibold text-sm" style={{ color: COLORS.text.primary }}>
              Pago Móvil
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                value={formData.pago_movil_bank}
                onChange={(e) => updateField("pago_movil_bank", e.target.value)}
                placeholder="Banco"
                className="h-10"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: COLORS.border.main,
                }}
              />
              <Input
                value={formData.pago_movil_phone}
                onChange={(e) => updateField("pago_movil_phone", e.target.value)}
                placeholder="Teléfono"
                className="h-10"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: COLORS.border.main,
                }}
              />
              <Input
                value={formData.pago_movil_id_number}
                onChange={(e) => updateField("pago_movil_id_number", e.target.value)}
                placeholder="Cédula"
                className="h-10"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: COLORS.border.main,
                }}
              />
              <Input
                value={formData.pago_movil_beneficiary_name}
                onChange={(e) => updateField("pago_movil_beneficiary_name", e.target.value)}
                placeholder="Nombre del beneficiario"
                className="h-10"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: COLORS.border.main,
                }}
              />
            </div>
          </div>

          {/* Transferencia */}
          <div className="space-y-3">
            <div className="font-semibold text-sm" style={{ color: COLORS.text.primary }}>
              Transferencia Bancaria
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                value={formData.transfer_bank_name}
                onChange={(e) => updateField("transfer_bank_name", e.target.value)}
                placeholder="Banco"
                className="h-10"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: COLORS.border.main,
                }}
              />
              <Input
                value={formData.transfer_account_type}
                onChange={(e) => updateField("transfer_account_type", e.target.value)}
                placeholder="Tipo de cuenta (Corriente/Ahorro)"
                className="h-10"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: COLORS.border.main,
                }}
              />
              <Input
                value={formData.transfer_account_number}
                onChange={(e) => updateField("transfer_account_number", e.target.value)}
                placeholder="Número de cuenta"
                className="h-10 sm:col-span-2"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: COLORS.border.main,
                }}
              />
              <Input
                value={formData.transfer_id_number}
                onChange={(e) => updateField("transfer_id_number", e.target.value)}
                placeholder="Cédula"
                className="h-10"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: COLORS.border.main,
                }}
              />
              <Input
                value={formData.transfer_beneficiary_name}
                onChange={(e) => updateField("transfer_beneficiary_name", e.target.value)}
                placeholder="Nombre del beneficiario"
                className="h-10"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: COLORS.border.main,
                }}
              />
            </div>
          </div>

          {/* Crypto */}
          <div className="space-y-3">
            <div className="font-semibold text-sm" style={{ color: COLORS.text.primary }}>
              Criptomonedas (USDT)
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                value={formData.usdt_wallet_address}
                onChange={(e) => updateField("usdt_wallet_address", e.target.value)}
                placeholder="Dirección de wallet"
                className="h-10 sm:col-span-2"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: COLORS.border.main,
                }}
              />
              <Input
                value={formData.crypto_network}
                onChange={(e) => updateField("crypto_network", e.target.value)}
                placeholder="Red (TRC20, BEP20, etc)"
                className="h-10"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: COLORS.border.main,
                }}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="h-11 px-8 font-semibold transition-all duration-200 hover:scale-105"
            style={{
              background: saving
                ? COLORS.text.tertiary
                : `linear-gradient(135deg, ${COLORS.success.main} 0%, ${COLORS.success.light} 100%)`,
              color: COLORS.text.inverse,
            }}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-5 animate-spin" />
                Guardando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="size-5" />
                Guardar Cambios
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
