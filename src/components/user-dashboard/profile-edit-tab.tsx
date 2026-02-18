"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Save, Check, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { updateUserProfile } from "@/lib/services/profile.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COLORS } from "@/config/colors";
import type { UserProfileUpdate } from "@/config/types/user-dashboard";

export function ProfileEditTab() {
  const { profile, refreshProfile } = useAuth();

  // ─────────────────────────────────────────────────────────────
  // State del formulario
  // ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<UserProfileUpdate>({
    first_name: "",
    last_name: "",
    phone: null,
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Validaciones inline
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─────────────────────────────────────────────────────────────
  // Inicializar form con datos del perfil
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (profile) {
      const timeoutId = setTimeout(() => {
        setFormData({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          phone: profile.phone || null,
        });
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [profile]);

  // ─────────────────────────────────────────────────────────────
  // Validar campo individual
  // ─────────────────────────────────────────────────────────────
  const validateField = (name: string, value: string): string | null => {
    if (name === "first_name") {
      if (!value.trim()) return "El nombre es requerido";
      if (value.trim().length < 2) return "Mínimo 2 caracteres";
      return null;
    }

    if (name === "last_name") {
      if (!value.trim()) return "El apellido es requerido";
      if (value.trim().length < 2) return "Mínimo 2 caracteres";
      return null;
    }

    if (name === "phone") {
      // Teléfono es opcional
      if (!value.trim()) return null;

      // Validar formato básico Venezuela (debe tener al menos 10 dígitos)
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length < 10) {
        return "Formato inválido (mínimo 10 dígitos)";
      }

      return null;
    }

    return null;
  };

  // ─────────────────────────────────────────────────────────────
  // Handler: Cambio en input
  // ─────────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value || null,
    }));

    // Validar en tiempo real
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error || "",
    }));

    // Limpiar mensajes de save
    setSaveSuccess(false);
    setSaveError(null);
  };

  // ─────────────────────────────────────────────────────────────
  // Handler: Submit form
  // ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todos los campos
    const newErrors: Record<string, string> = {};

    Object.keys(formData).forEach((key) => {
      const value = formData[key as keyof UserProfileUpdate] || "";
      const error = validateField(key, String(value));
      if (error) {
        newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Guardar
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const response = await updateUserProfile(profile!.id, formData);

    if (response.status === "success") {
      setSaveSuccess(true);
      setSaveError(null);

      // Refrescar perfil en auth store
      await refreshProfile();

      // Ocultar mensaje de éxito después de 3s
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } else {
      setSaveError(response.error || "Error al guardar cambios");
      setSaveSuccess(false);
    }

    setSaving(false);
  };

  // ─────────────────────────────────────────────────────────────
  // Detectar si hay cambios sin guardar
  // ─────────────────────────────────────────────────────────────
  const hasChanges =
    profile &&
    (formData.first_name !== (profile.first_name || "") ||
      formData.last_name !== (profile.last_name || "") ||
      formData.phone !== profile.phone);

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p style={{ color: COLORS.text.secondary }}>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold" style={{ color: COLORS.text.primary }}>
            Información Personal
          </h2>
          <p className="text-sm mt-1" style={{ color: COLORS.text.secondary }}>
            Actualiza tus datos básicos de perfil
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div>
            <label
              htmlFor="first_name"
              className="block text-sm font-semibold mb-2"
              style={{ color: COLORS.text.primary }}
            >
              Nombre <span style={{ color: COLORS.error.main }}>*</span>
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
                style={{ color: COLORS.text.tertiary }}
              />
              <Input
                id="first_name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Tu nombre"
                className="pl-10 h-11"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: errors.first_name
                    ? COLORS.error.main
                    : COLORS.border.main,
                }}
              />
            </div>
            {errors.first_name && (
              <p className="text-xs mt-1" style={{ color: COLORS.error.dark }}>
                {errors.first_name}
              </p>
            )}
          </div>

          {/* Apellido */}
          <div>
            <label
              htmlFor="last_name"
              className="block text-sm font-semibold mb-2"
              style={{ color: COLORS.text.primary }}
            >
              Apellido <span style={{ color: COLORS.error.main }}>*</span>
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
                style={{ color: COLORS.text.tertiary }}
              />
              <Input
                id="last_name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Tu apellido"
                className="pl-10 h-11"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: errors.last_name
                    ? COLORS.error.main
                    : COLORS.border.main,
                }}
              />
            </div>
            {errors.last_name && (
              <p className="text-xs mt-1" style={{ color: COLORS.error.dark }}>
                {errors.last_name}
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold mb-2"
              style={{ color: COLORS.text.primary }}
            >
              Teléfono <span className="text-xs font-normal">(opcional)</span>
            </label>
            <div className="relative">
              <Phone
                className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
                style={{ color: COLORS.text.tertiary }}
              />
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={handleChange}
                placeholder="+58 424-1234567"
                className="pl-10 h-11"
                style={{
                  backgroundColor: COLORS.background.tertiary,
                  borderColor: errors.phone
                    ? COLORS.error.main
                    : COLORS.border.main,
                }}
              />
            </div>
            {errors.phone && (
              <p className="text-xs mt-1" style={{ color: COLORS.error.dark }}>
                {errors.phone}
              </p>
            )}
            <p className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
              Formato: +58 XXX-XXXXXXX
            </p>
          </div>

          {/* Email (readonly) */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold mb-2"
              style={{ color: COLORS.text.primary }}
            >
              Email <span className="text-xs font-normal">(no editable)</span>
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
                style={{ color: COLORS.text.tertiary }}
              />
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                readOnly
                disabled
                className="pl-10 h-11 cursor-not-allowed"
                style={{
                  backgroundColor: COLORS.neutral[100],
                  borderColor: COLORS.border.main,
                  color: COLORS.text.secondary,
                }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
              El email no se puede cambiar desde aquí
            </p>
          </div>

          {/* Mensajes de feedback */}
          {saveSuccess && (
            <div
              className="rounded-lg p-3 flex items-center gap-2"
              style={{
                backgroundColor: COLORS.success.lighter,
                borderLeft: `3px solid ${COLORS.success.main}`,
              }}
            >
              <Check className="size-5" style={{ color: COLORS.success.dark }} />
              <p className="text-sm font-semibold" style={{ color: COLORS.success.dark }}>
                ✓ Cambios guardados exitosamente
              </p>
            </div>
          )}

          {saveError && (
            <div
              className="rounded-lg p-3 flex items-center gap-2"
              style={{
                backgroundColor: COLORS.error.lighter,
                borderLeft: `3px solid ${COLORS.error.main}`,
              }}
            >
              <AlertCircle className="size-5" style={{ color: COLORS.error.dark }} />
              <p className="text-sm font-semibold" style={{ color: COLORS.error.dark }}>
                {saveError}
              </p>
            </div>
          )}

          {/* Botón guardar */}
          <div className="flex items-center gap-4 pt-4 border-t" style={{ borderColor: COLORS.border.light }}>
            <Button
              type="submit"
              disabled={saving || !hasChanges}
              className="px-6 h-11 font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: hasChanges
                  ? `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`
                  : COLORS.neutral[300],
                color: hasChanges ? COLORS.text.inverse : COLORS.neutral[500],
              }}
            >
              {saving ? (
                <>
                  <div className="size-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" />
                  Guardar cambios
                </>
              )}
            </Button>

            {hasChanges && !saving && (
              <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
                Tienes cambios sin guardar
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Info adicional */}
      <div
        className="mt-4 rounded-lg p-4"
        style={{
          backgroundColor: COLORS.info.lighter,
          borderLeft: `3px solid ${COLORS.info.main}`,
        }}
      >
        <p className="text-sm" style={{ color: COLORS.info.dark }}>
          <strong>💡 Tip:</strong> Mantén tu información actualizada para que los merchants puedan contactarte fácilmente.
        </p>
      </div>
    </div>
  );
}
