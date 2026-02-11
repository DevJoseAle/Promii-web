"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCitiesByState } from "@/config/locations/cities";
import { VENEZUELA_STATES } from "@/config/locations/states";
import { supabase } from "@/lib/supabase/supabase.client";
import { COLORS } from "@/config/colors";
import {
  Mail,
  Lock,
  Store,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Loader2,
  User,
} from "lucide-react";

type Draft = {
  email: string;
  password: string;
  businessName: string;
  phone: string;
  stateId: string;
  cityId: string;
  zone: string;
};

const DRAFT_KEY = "promii_business_apply_draft_v1";

export default function BusinessApplyPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsEmailVerify, setNeedsEmailVerify] = useState(false);

  // Account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Business
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [stateId, setStateId] = useState("");
  const [cityId, setCityId] = useState("");
  const [zone, setZone] = useState("");

  const filteredCities = useMemo(() => {
    if (!stateId) return [];
    return getCitiesByState(stateId);
  }, [stateId]);

  function saveDraft(next?: Partial<Draft>) {
    const draft: Draft = {
      email,
      password,
      businessName,
      phone,
      stateId,
      cityId,
      zone,
      ...next,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as Draft;
    } catch {
      return null;
    }
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
  }

  async function ensureMerchantRow(userId: string) {
    const categoryPrimary = "food";
    try {
      const { error: merchantErr } = await supabase.from("merchants").upsert(
        {
          id: userId,
          verification_status: "pending",
          business_name: businessName.trim(),
          description: null,
          logo_url: null,
          cover_image_url: null,
          category_primary: categoryPrimary,
          category_secondary: null,
          address_line: "Pendiente",
          state: stateId,
          city: cityId,
          zone: zone.trim() || null,
          geo_lat: null,
          geo_lng: null,
          contact_name: "Pendiente",
          contact_email: email.trim() || "pendiente@promii.com",
          phone: phone.trim(),
          whatsapp: null,
          instagram_handle: null,
          website_url: null,
        },
        { onConflict: "id" }
      );
      if (merchantErr) throw new Error(merchantErr.message);
    } catch (error) {
      console.error("Error ensuring merchant row:", error);
      throw error;
    }
  }

  async function finalizeSubmitWithSession(userId: string) {
    try {
      const { error: appErr } = await supabase
        .from("business_applications")
        .upsert(
          {
            owner_id: userId,
            business_name: businessName.trim(),
            phone: phone.trim(),
            state: stateId || null,
            city: cityId || null,
            zone: zone.trim() || null,
          },
          { onConflict: "owner_id" }
        );

      if (appErr) throw new Error(appErr.message);

      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ role: "merchant", state: "pending" })
        .eq("id", userId);

      if (profileErr) throw new Error(profileErr.message);
      await ensureMerchantRow(userId);
    } catch (error) {
      console.error("Error finalizing submit with session:", error);
      throw error;
    }

    clearDraft();
    router.push("/business/pending");
    router.refresh();
  }

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setEmail(draft.email);
      setPassword(draft.password);
      setBusinessName(draft.businessName);
      setPhone(draft.phone);
      setStateId(draft.stateId);
      setCityId(draft.cityId);
      setZone(draft.zone);
    }
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsEmailVerify(false);

    try {
      const safeBusinessName = businessName.trim();
      const safePhone = phone.trim();

      const { data: authEmail, error: authEmailErr } =
        await supabase.functions.invoke("checkUserExist", {
          body: { email },
        });

      if (authEmailErr) {
        setError("Error verificando el email. Intenta nuevamente.");
        setLoading(false);
        return;
      }

      if (!safeBusinessName || !safePhone) {
        setError("Completa al menos el nombre del negocio y el teléfono.");
        setLoading(false);
        return;
      }

      if (!stateId || !cityId) {
        setError("Selecciona un estado y una ciudad.");
        setLoading(false);
        return;
      }

      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;

      if (userId) {
        try {
          await finalizeSubmitWithSession(userId);
        } catch (e: any) {
          setError(e?.message ?? "No se pudo enviar la solicitud.");
          setLoading(false);
        }
        return;
      }

      const safeEmail = email.trim();
      const safePass = password.trim();

      if (!safeEmail || !safePass) {
        setError("Ingresa tu email y contraseña para crear tu cuenta.");
        setLoading(false);
        return;
      }

      saveDraft();

      const emailRedirectTo = `${window.location.origin}/auth/callback?next=/business/apply`;
      const { error: signUpErr } = await supabase.auth.signUp({
        email: safeEmail,
        password: safePass,
        options: emailRedirectTo ? { emailRedirectTo } : undefined,
      });

      if (signUpErr) {
        setError(signUpErr.message);
        setLoading(false);
        return;
      }

      setNeedsEmailVerify(true);
      setLoading(false);
    } catch (error) {
      console.error("Error en el submit:", error);
      setError("Error al procesar la solicitud.");
      setLoading(false);
    }
  }

  async function onIVerifiedClick() {
    setLoading(true);
    setError(null);

    try {
      const safeEmail = email.trim();
      const safePass = password.trim();

      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: safeEmail,
        password: safePass,
      });

      if (signInErr) {
        setError(
          "Aún no podemos iniciar sesión. Verifica tu correo y vuelve a intentar."
        );
        setLoading(false);
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        setError("No se pudo obtener el usuario.");
        setLoading(false);
        return;
      }

      await finalizeSubmitWithSession(userId);
    } catch (error: any) {
      console.error("Error en verificación:", error);
      setError(error?.message ?? "Error al procesar la verificación.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Solicitud de Negocio"
      subtitle="Completa tu solicitud para publicar Promiis. Verificamos cada negocio para proteger a los usuarios."
      badgeText="Solicitud · Promii Empresas"
      variant="business"
    >
      {needsEmailVerify ? (
        <div
          className="rounded-xl border p-6 space-y-4"
          style={{
            backgroundColor: COLORS.info.lighter,
            borderColor: COLORS.info.light,
          }}
        >
          <div className="flex items-start gap-3">
            <Mail className="size-6 shrink-0 mt-0.5" style={{ color: COLORS.info.main }} />
            <div>
              <div className="font-semibold text-base" style={{ color: COLORS.text.primary }}>
                Verifica tu email
              </div>
              <p className="mt-1 text-sm" style={{ color: COLORS.text.secondary }}>
                Te enviamos un correo de verificación. Revisa tu bandeja de entrada (y spam). Cuando
                verifiques, vuelve y presiona el botón.
              </p>
            </div>
          </div>

          {error && (
            <div
              className="flex items-start gap-3 rounded-lg border p-4"
              style={{
                backgroundColor: COLORS.error.lighter,
                borderColor: COLORS.error.light,
              }}
            >
              <AlertCircle
                className="size-5 shrink-0 mt-0.5"
                style={{ color: COLORS.error.main }}
              />
              <div className="text-sm" style={{ color: COLORS.error.dark }}>
                {error}
              </div>
            </div>
          )}

          <Button
            type="button"
            onClick={onIVerifiedClick}
            disabled={loading}
            className="w-full h-11 font-semibold transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
              color: COLORS.text.inverse,
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-5 animate-spin" />
                Validando...
              </span>
            ) : (
              "Ya verifiqué, continuar"
            )}
          </Button>

          <p className="text-xs text-center" style={{ color: COLORS.text.secondary }}>
            Si ya verificaste y aún falla,{" "}
            <Link
              href="/business/sign-in"
              className="font-semibold hover:underline"
              style={{ color: COLORS.primary.main }}
            >
              inicia sesión aquí
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Sección: Tu Cuenta */}
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
                  Tu Cuenta
                </div>
                <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                  Crea tu cuenta de acceso
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  Email
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
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      saveDraft({ email: e.target.value });
                    }}
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
                <label htmlFor="password" className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  Contraseña
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
                    style={{ color: COLORS.text.tertiary }}
                  />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      saveDraft({ password: e.target.value });
                    }}
                    required
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

          {/* Sección: Tu Negocio */}
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
                  Datos que aparecerán en tu perfil
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="businessName" className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  Nombre del Negocio
                </label>
                <Input
                  id="businessName"
                  name="businessName"
                  placeholder="Ej: Restaurante El Buen Sabor"
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    saveDraft({ businessName: e.target.value });
                  }}
                  required
                  className="h-11"
                  style={{
                    backgroundColor: COLORS.background.tertiary,
                    borderColor: COLORS.border.main,
                  }}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  WhatsApp / Teléfono
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
                    placeholder="+58 414 123 4567"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      saveDraft({ phone: e.target.value });
                    }}
                    required
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

          {/* Sección: Ubicación */}
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
                  Dónde se encuentra tu negocio
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                    Estado
                  </label>
                  <select
                    id="state"
                    name="state"
                    value={stateId}
                    onChange={(e) => {
                      const next = e.target.value;
                      setStateId(next);
                      setCityId("");
                      saveDraft({ stateId: next, cityId: "" });
                    }}
                    required
                    className="h-11 w-full rounded-lg border px-4 text-sm transition-all duration-200 focus:outline-none focus:ring-3"
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
                  <label htmlFor="city" className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                    Ciudad
                  </label>
                  <select
                    id="city"
                    name="city"
                    value={cityId}
                    onChange={(e) => {
                      const next = e.target.value;
                      setCityId(next);
                      saveDraft({ cityId: next });
                    }}
                    required
                    disabled={!stateId}
                    className="h-11 w-full rounded-lg border px-4 text-sm transition-all duration-200 focus:outline-none focus:ring-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: COLORS.background.tertiary,
                      borderColor: COLORS.border.main,
                      color: COLORS.text.primary,
                    }}
                  >
                    <option value="">
                      {stateId ? "Selecciona una ciudad" : "Elige primero un estado"}
                    </option>
                    {filteredCities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="zone" className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  Zona <span className="text-xs font-normal" style={{ color: COLORS.text.tertiary }}>(Opcional)</span>
                </label>
                <Input
                  id="zone"
                  name="zone"
                  placeholder="Ej: Centro, Las Mercedes, etc."
                  value={zone}
                  onChange={(e) => {
                    setZone(e.target.value);
                    saveDraft({ zone: e.target.value });
                  }}
                  className="h-11"
                  style={{
                    backgroundColor: COLORS.background.tertiary,
                    borderColor: COLORS.border.main,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="flex items-start gap-3 rounded-lg border p-4"
              style={{
                backgroundColor: COLORS.error.lighter,
                borderColor: COLORS.error.light,
              }}
            >
              <AlertCircle className="size-5 shrink-0 mt-0.5" style={{ color: COLORS.error.main }} />
              <div className="text-sm" style={{ color: COLORS.error.dark }}>
                {error}
              </div>
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 font-semibold text-base transition-all duration-200 hover:scale-[1.02] disabled:scale-100"
            style={{
              background: loading
                ? COLORS.text.tertiary
                : `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
              color: COLORS.text.inverse,
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-5 animate-spin" />
                Enviando solicitud...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-5" />
                Enviar Solicitud
              </span>
            )}
          </Button>

          {/* Terms */}
          <p className="text-xs text-center" style={{ color: COLORS.text.secondary }}>
            Al enviar, aceptas nuestros{" "}
            <Link
              href="/legal/terms"
              className="font-semibold hover:underline"
              style={{ color: COLORS.primary.main }}
            >
              Términos y Condiciones
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
