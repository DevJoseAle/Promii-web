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
  User,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Instagram,
  Youtube,
  Users,
  Sparkles,
} from "lucide-react";

// TikTok icon
const TikTokIcon = () => (
  <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

type Draft = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  stateId: string;
  cityId: string;
  instagramHandle: string;
  tiktokHandle: string;
  youtubeHandle: string;
  audienceSize: string;
  niche: string;
  notes: string;
};

const DRAFT_KEY = "promii_influencer_apply_draft_v1";

export default function InfluencerApplyPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [needsEmailVerify, setNeedsEmailVerify] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cuenta
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Influencer
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [stateId, setStateId] = useState("");
  const [cityId, setCityId] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [tiktokHandle, setTiktokHandle] = useState("");
  const [youtubeHandle, setYoutubeHandle] = useState("");
  const [audienceSize, setAudienceSize] = useState("");
  const [niche, setNiche] = useState("");
  const [notes, setNotes] = useState("");

  const filteredCities = useMemo(() => {
    if (!stateId) return [];
    return getCitiesByState(stateId);
  }, [stateId]);

  function saveDraft(next?: Partial<Draft>) {
    const draft: Draft = {
      email,
      password,
      fullName,
      phone,
      stateId,
      cityId,
      instagramHandle,
      tiktokHandle,
      youtubeHandle,
      audienceSize,
      niche,
      notes,
      ...next,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }

  function loadDraft(): Draft | null {
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

  async function ensureInfluencerRow(userId: string) {
    const stateName = VENEZUELA_STATES.find((s) => s.id === stateId)?.name || "";
    const cityName = filteredCities.find((c) => c.id === cityId)?.name || "";

    const { error: influencerErr } = await supabase.from("influencers").upsert(
      {
        id: userId,
        display_name: fullName.trim(),
        bio: notes.trim() || null,
        state: stateName,
        city: cityName,
        niche: niche.trim() || null,
        instagram_handle: instagramHandle.trim().replace("@", "") || null,
        tiktok_handle: tiktokHandle.trim().replace("@", "") || null,
        youtube_handle: youtubeHandle.trim().replace("@", "") || null,
        twitter_handle: null,
        followers_count: audienceSize.trim() === "" ? 0 : Number.parseInt(audienceSize.trim(), 10) || 0,
      },
      { onConflict: "id" }
    );

    if (influencerErr) throw new Error(influencerErr.message);
  }

  async function finalizeSubmitWithSession(userId: string) {
    const audienceInt =
      audienceSize.trim() === ""
        ? null
        : Number.parseInt(audienceSize.trim(), 10);

    if (audienceInt !== null && Number.isNaN(audienceInt)) {
      throw new Error("El tamaño de audiencia debe ser un número.");
    }

    const { error: appErr } = await supabase
      .from("influencer_applications")
      .upsert(
        {
          owner_id: userId,
          full_name: fullName.trim(),
          phone: phone.trim(),
          country: "VE",
          state_id: stateId || null,
          city_id: cityId || null,
          instagram_handle: instagramHandle.trim() || null,
          tiktok_handle: tiktokHandle.trim() || null,
          youtube_handle: youtubeHandle.trim() || null,
          audience_size: audienceInt,
          niche: niche.trim() || null,
          notes: notes.trim() || null,
        },
        { onConflict: "owner_id" }
      );

    if (appErr) throw new Error(appErr.message);

    // Create influencer record
    await ensureInfluencerRow(userId);

    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ role: "influencer", state: "pending" })
      .eq("id", userId);

    if (profileErr) throw new Error(profileErr.message);

    clearDraft();
    router.push("/inf/pending");
    router.refresh();
  }

  async function tryAutoSubmitDraftIfSessionExists() {
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    if (!userId) return;

    const draft = loadDraft();
    if (!draft) return;

    setEmail(draft.email);
    setPassword(draft.password);
    setFullName(draft.fullName);
    setPhone(draft.phone);
    setStateId(draft.stateId);
    setCityId(draft.cityId);
    setInstagramHandle(draft.instagramHandle);
    setTiktokHandle(draft.tiktokHandle);
    setYoutubeHandle(draft.youtubeHandle);
    setAudienceSize(draft.audienceSize);
    setNiche(draft.niche);
    setNotes(draft.notes);

    setLoading(true);
    setError(null);
    try {
      await finalizeSubmitWithSession(userId);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo enviar la solicitud.");
      setLoading(false);
    }
  }

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setEmail(draft.email);
      setPassword(draft.password);
      setFullName(draft.fullName);
      setPhone(draft.phone);
      setStateId(draft.stateId);
      setCityId(draft.cityId);
      setInstagramHandle(draft.instagramHandle);
      setTiktokHandle(draft.tiktokHandle);
      setYoutubeHandle(draft.youtubeHandle);
      setAudienceSize(draft.audienceSize);
      setNiche(draft.niche);
      setNotes(draft.notes);
    }

    void tryAutoSubmitDraftIfSessionExists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsEmailVerify(false);

    if (!fullName.trim() || !phone.trim()) {
      setError("Completa tu nombre y tu teléfono (WhatsApp).");
      setLoading(false);
      return;
    }

    if (!stateId || !cityId) {
      setError("Selecciona un estado y una ciudad.");
      setLoading(false);
      return;
    }

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    const isConfirmed =
      !!(user as any)?.email_confirmed_at || !!(user as any)?.confirmed_at;

    if (user?.id && isConfirmed) {
      try {
        await finalizeSubmitWithSession(user.id);
      } catch (e: any) {
        setError(e?.message ?? "No se pudo enviar la solicitud.");
        setLoading(false);
      }
      return;
    }

    if (user?.id && !isConfirmed) {
      saveDraft();
      setNeedsEmailVerify(true);
      setLoading(false);
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

    const emailRedirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=/inf/apply`
        : undefined;

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
  }

  async function onIVerifiedClick() {
    setLoading(true);
    setError(null);

    const safeEmail = email.trim();
    const safePass = password.trim();

    const { error: signInErr } = await supabase.auth.signInWithPassword({
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

    await tryAutoSubmitDraftIfSessionExists();
  }

  return (
    <AuthShell
      title="Solicitud de Influencer"
      subtitle="Únete a Promii Influencers y gana comisión por cada venta que generes con tu código único."
      badgeText="Solicitud · Promii Influencers"
      variant="influencer"
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
              href="/inf/sign-in"
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

          {/* Sección: Tu Perfil */}
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
                <Sparkles className="size-5" />
              </div>
              <div>
                <div className="font-semibold" style={{ color: COLORS.text.primary }}>
                  Tu Perfil de Influencer
                </div>
                <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                  Información básica sobre ti
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  Nombre completo
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Tu nombre completo"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    saveDraft({ fullName: e.target.value });
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
                  Dónde te encuentras
                </div>
              </div>
            </div>

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
                  className="h-11 w-full rounded-lg border px-4 text-sm transition-all duration-200 focus:outline-none focus:ring-2"
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
                  className="h-11 w-full rounded-lg border px-4 text-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>

          {/* Sección: Redes Sociales */}
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
                <Users className="size-5" />
              </div>
              <div>
                <div className="font-semibold" style={{ color: COLORS.text.primary }}>
                  Redes Sociales
                </div>
                <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                  Tus perfiles (opcional pero recomendado)
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="instagram" className="text-sm font-semibold flex items-center gap-2" style={{ color: COLORS.text.primary }}>
                  <Instagram className="size-4" />
                  Instagram
                </label>
                <Input
                  id="instagram"
                  name="instagramHandle"
                  placeholder="@tu_usuario"
                  value={instagramHandle}
                  onChange={(e) => {
                    setInstagramHandle(e.target.value);
                    saveDraft({ instagramHandle: e.target.value });
                  }}
                  className="h-11"
                  style={{
                    backgroundColor: COLORS.background.tertiary,
                    borderColor: COLORS.border.main,
                  }}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="tiktok" className="text-sm font-semibold flex items-center gap-2" style={{ color: COLORS.text.primary }}>
                  <TikTokIcon />
                  TikTok
                </label>
                <Input
                  id="tiktok"
                  name="tiktokHandle"
                  placeholder="@tu_usuario"
                  value={tiktokHandle}
                  onChange={(e) => {
                    setTiktokHandle(e.target.value);
                    saveDraft({ tiktokHandle: e.target.value });
                  }}
                  className="h-11"
                  style={{
                    backgroundColor: COLORS.background.tertiary,
                    borderColor: COLORS.border.main,
                  }}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="youtube" className="text-sm font-semibold flex items-center gap-2" style={{ color: COLORS.text.primary }}>
                  <Youtube className="size-4" />
                  YouTube
                </label>
                <Input
                  id="youtube"
                  name="youtubeHandle"
                  placeholder="Tu canal o @usuario"
                  value={youtubeHandle}
                  onChange={(e) => {
                    setYoutubeHandle(e.target.value);
                    saveDraft({ youtubeHandle: e.target.value });
                  }}
                  className="h-11"
                  style={{
                    backgroundColor: COLORS.background.tertiary,
                    borderColor: COLORS.border.main,
                  }}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="audienceSize" className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  Tamaño de audiencia <span className="text-xs font-normal" style={{ color: COLORS.text.tertiary }}>(Opcional)</span>
                </label>
                <Input
                  id="audienceSize"
                  name="audienceSize"
                  inputMode="numeric"
                  placeholder="Ej: 12000"
                  value={audienceSize}
                  onChange={(e) => {
                    const next = e.target.value.replace(/[^\d]/g, "");
                    setAudienceSize(next);
                    saveDraft({ audienceSize: next });
                  }}
                  className="h-11"
                  style={{
                    backgroundColor: COLORS.background.tertiary,
                    borderColor: COLORS.border.main,
                  }}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="niche" className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  Nicho / Categoría <span className="text-xs font-normal" style={{ color: COLORS.text.tertiary }}>(Opcional)</span>
                </label>
                <Input
                  id="niche"
                  name="niche"
                  placeholder="Ej: Comida, Fitness, Tecnología"
                  value={niche}
                  onChange={(e) => {
                    setNiche(e.target.value);
                    saveDraft({ niche: e.target.value });
                  }}
                  className="h-11"
                  style={{
                    backgroundColor: COLORS.background.tertiary,
                    borderColor: COLORS.border.main,
                  }}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  Cuéntanos sobre ti <span className="text-xs font-normal" style={{ color: COLORS.text.tertiary }}>(Opcional)</span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    saveDraft({ notes: e.target.value });
                  }}
                  placeholder="Cuéntanos un poco sobre tu contenido y estilo..."
                  className="min-h-[96px] w-full resize-none rounded-lg border px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: COLORS.background.tertiary,
                    borderColor: COLORS.border.main,
                    color: COLORS.text.primary,
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
