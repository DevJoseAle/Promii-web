"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCitiesByState } from "@/config/locations/cities";
import { VENEZUELA_STATES } from "@/config/locations/states";
import { supabase } from "@/lib/supabase/supabase.client";

type Draft = {
  // cuenta
  email: string;
  password: string;

  // datos influencer
  fullName: string;
  phone: string;

  stateId: string;
  cityId: string;

  instagramHandle: string;
  tiktokHandle: string;
  youtubeHandle: string;

  audienceSize: string; // string para input; convertimos a int al guardar
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

  async function finalizeSubmitWithSession(userId: string) {
    // audience size int o null
    const audienceInt =
      audienceSize.trim() === ""
        ? null
        : Number.parseInt(audienceSize.trim(), 10);

    if (audienceInt !== null && Number.isNaN(audienceInt)) {
      throw new Error("El tamaño de audiencia debe ser un número.");
    }

    // 1) upsert influencer_applications (1 por usuario)
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
        { onConflict: "owner_id" },
      );

    if (appErr) throw new Error(appErr.message);

    // 2) set profile role=influencer, state=pending
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ role: "influencer", state: "pending" })
      .eq("id", userId);

    if (profileErr) throw new Error(profileErr.message);

    clearDraft();
    router.push("/influencers/pending");
    router.refresh();
  }

  async function tryAutoSubmitDraftIfSessionExists() {
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    if (!userId) return;

    const draft = loadDraft();
    if (!draft) return;

    // hidratar UI desde draft para consistencia
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
    // Prefill desde draft
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

    // Si viene del correo y ya hay sesión → auto submit
    void tryAutoSubmitDraftIfSessionExists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsEmailVerify(false);

    // validación mínima
    if (!fullName.trim() || !phone.trim()) {
      setError("Completa tu nombre y tu teléfono (WhatsApp).");
      setLoading(false);
      return;
    }

    // opcional: exigir ubicación
    if (!stateId || !cityId) {
      setError("Selecciona un estado y una ciudad.");
      setLoading(false);
      return;
    }

    // 1) ¿ya hay sesión? → enviar directo
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    // ✅ si existe user PERO no está confirmado, forzamos flujo verify
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

    // si hay user pero NO confirmado -> guardamos draft y mostramos verify
    if (user?.id && !isConfirmed) {
      saveDraft();
      setNeedsEmailVerify(true);
      setLoading(false);
      return;
    }

    // 2) sin sesión → signup + draft + verify
    const safeEmail = email.trim();
    const safePass = password.trim();

    if (!safeEmail || !safePass) {
      setError("Ingresa tu email y contraseña para crear tu cuenta.");
      setLoading(false);
      return;
    }

    saveDraft();

    // ✅ importantísimo para que la sesión quede: /auth/callback
    const emailRedirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=/influencers/apply`
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

    // confirm email ON: normalmente no habrá sesión aún
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
        "Aún no podemos iniciar sesión. Verifica tu correo y vuelve a intentar.",
      );
      setLoading(false);
      return;
    }

    await tryAutoSubmitDraftIfSessionExists();
  }

  return (
    <AuthShell
      title="Promii Influencers"
      subtitle="Solicita tu cuenta. Una vez aprobada, podrás compartir códigos y ganar comisión por compra."
      badgeText="Solicitud · Promii Influencers"
    >
      <AuthCard
        heading="Solicitud de influencer"
        subheading="Esto nos ayuda a evitar fraude"
      >
        {needsEmailVerify ? (
          <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
            <div className="text-sm font-semibold text-text-primary">
              Te enviamos un correo para verificar tu cuenta
            </div>
            <div className="text-sm text-text-secondary">
              Revisa tu bandeja (y spam). Al verificar, volverás aquí y podrás
              continuar.
            </div>

            {error ? <div className="text-sm text-danger">{error}</div> : null}

            <Button
              type="button"
              onClick={onIVerifiedClick}
              disabled={loading}
              className="w-full bg-primary text-white hover:bg-primary/90"
            >
              {loading ? "Validando..." : "Ya verifiqué, continuar"}
            </Button>

            <div className="text-xs text-text-secondary">
              Si ya verificaste y aún falla, vuelve a{" "}
              <Link
                className="text-primary hover:underline"
                href="/influencers/sign-in"
              >
                iniciar sesión
              </Link>
              .
            </div>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-3">
          {/* Cuenta */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-text-primary">
              Tu cuenta
            </div>

            <Input
              placeholder="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                saveDraft({ email: e.target.value });
              }}
              required
            />

            <Input
              placeholder="Contraseña"
              name="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                saveDraft({ password: e.target.value });
              }}
              required
            />
          </div>

          {/* Datos influencer */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-text-primary">
              Tu perfil
            </div>

            <Input
              placeholder="Nombre completo"
              name="fullName"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                saveDraft({ fullName: e.target.value });
              }}
              required
            />

            <Input
              placeholder="WhatsApp / Teléfono"
              name="phone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                saveDraft({ phone: e.target.value });
              }}
              required
            />

            {/* Estado */}
            <select
              name="state"
              value={stateId}
              onChange={(e) => {
                const next = e.target.value;
                setStateId(next);
                setCityId("");
                saveDraft({ stateId: next, cityId: "" });
              }}
              required
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="">Selecciona un estado</option>
              {VENEZUELA_STATES.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Ciudad */}
            <select
              name="city"
              value={cityId}
              onChange={(e) => {
                const next = e.target.value;
                setCityId(next);
                saveDraft({ cityId: next });
              }}
              required
              disabled={!stateId}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
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

            <Input
              placeholder="@instagram (opcional)"
              name="instagramHandle"
              value={instagramHandle}
              onChange={(e) => {
                setInstagramHandle(e.target.value);
                saveDraft({ instagramHandle: e.target.value });
              }}
            />

            <Input
              placeholder="@tiktok (opcional)"
              name="tiktokHandle"
              value={tiktokHandle}
              onChange={(e) => {
                setTiktokHandle(e.target.value);
                saveDraft({ tiktokHandle: e.target.value });
              }}
            />

            <Input
              placeholder="Canal de YouTube (opcional)"
              name="youtubeHandle"
              value={youtubeHandle}
              onChange={(e) => {
                setYoutubeHandle(e.target.value);
                saveDraft({ youtubeHandle: e.target.value });
              }}
            />

            <Input
              placeholder="Tamaño audiencia (ej: 12000) (opcional)"
              name="audienceSize"
              inputMode="numeric"
              value={audienceSize}
              onChange={(e) => {
                // solo números
                const next = e.target.value.replace(/[^\d]/g, "");
                setAudienceSize(next);
                saveDraft({ audienceSize: next });
              }}
            />

            <Input
              placeholder="Nicho (ej: comida, fitness, tecnología) (opcional)"
              name="niche"
              value={niche}
              onChange={(e) => {
                setNiche(e.target.value);
                saveDraft({ niche: e.target.value });
              }}
            />

            <textarea
              name="notes"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                saveDraft({ notes: e.target.value });
              }}
              placeholder="Cuéntanos un poco sobre tu contenido (opcional)"
              className="min-h-[96px] w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
          </div>

          {error ? <div className="text-sm text-danger">{error}</div> : null}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {loading ? "Enviando..." : "Enviar solicitud"}
          </Button>

          <div className="text-xs text-text-secondary">
            Al enviar, aceptas nuestros{" "}
            <Link className="text-primary hover:underline" href="/legal/terms">
              Términos
            </Link>
            .
          </div>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
