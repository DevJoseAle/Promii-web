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
import { getSupabaseBrowserClient } from "@/lib/supabase.ssr";

type State = { id: string; name: string };
type City = { id: string; stateId: string; name: string };

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
  const supabase = getSupabaseBrowserClient();

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

          address_line: "Pendiente", // si aún no lo pides en apply, pon placeholder
          state: stateId, // hoy estás guardando IDs; si prefieres nombre, cámbialo
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
        { onConflict: "id" },
      );
      if (merchantErr) throw new Error(merchantErr.message);
    } catch (error) {
      console.error("Error ensuring merchant row:", error);
      throw error;
    }
  }

  async function finalizeSubmitWithSession(userId: string) {
    try {
      // upsert solicitud
      const { error: appErr } = await supabase
        .from("business_applications")
        .upsert(
          {
            owner_id: userId,
            business_name: businessName.trim(),
            phone: phone.trim(),
            state: stateId || null, // guardas ID
            city: cityId || null, // guardas ID
            zone: zone.trim() || null,
          },
          { onConflict: "owner_id" },
        );

      if (appErr) throw new Error(appErr.message);

      // set profile merchant/pending
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

  async function tryAutoSubmitDraftIfSessionExists() {
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    if (!userId) return;

    const draft = loadDraft();
    if (!draft) return;

    // hidrata el form desde draft (para que todo quede consistente)
    setEmail(draft.email);
    setPassword(draft.password);
    setBusinessName(draft.businessName);
    setPhone(draft.phone);
    setStateId(draft.stateId);
    setCityId(draft.cityId);
    setZone(draft.zone);

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
    // 1) Prefill desde draft si existe
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
    console.log("Ingresé", email);
    const safeBusinessName = businessName.trim();
    const safePhone = phone.trim();
    console.log("antes");console.time("checkUserExist");
const {data: authEmail, error: authEmailErr } = await supabase.functions.invoke("checkUserExist", {
  body: { email },
});
console.timeEnd("checkUserExist");
    console.log({authEmail, authEmailErr, email});
    if(authEmailErr){
      setError("Error verificando el email. Intenta nuevamente.");
      setLoading(false);
      let error = new Error(authEmailErr.message);
      throw error;
      return;
    }
    console.log({authEmail, authEmailErr});
    // if (!safeBusinessName || !safePhone) {
    //   setError("Completa al menos el nombre del negocio y el teléfono.");
    //   setLoading(false);
    //   return;
    // }
    // if (!stateId || !cityId) {
    //   setError("Selecciona un estado y una ciudad.");
    //   setLoading(false);
    //   return;
    // }
    // const { data: auth } = await supabase.auth.getUser();
    // const userId = auth.user?.id;

    // if (userId) {
    //   try {
    //     await finalizeSubmitWithSession(userId);
    //   } catch (e: any) {
    //     setError(e?.message ?? "No se pudo enviar la solicitud.");
    //     setLoading(false);
    //   }
    //   return;
    // }

    // // 2) No hay sesión: creamos cuenta, guardamos draft, pedimos verificación
    // const safeEmail = email.trim();
    // const safePass = password.trim();

    // if (!safeEmail || !safePass) {
    //   setError("Ingresa tu email y contraseña para crear tu cuenta.");
    //   setLoading(false);
    //   return;
    // }

    // // guardamos lo que llenó para no perderlo
    // saveDraft();

    // const emailRedirectTo = `${window.location.origin}/auth/callback?next=/business/apply`;
    // const { error: signUpErr } = await supabase.auth.signUp({
    //   email: safeEmail,
    //   password: safePass,
    //   options: emailRedirectTo ? { emailRedirectTo } : undefined,
    // });

    // if (signUpErr) {
    //   setError(signUpErr.message);
    //   setLoading(false);
    //   return;
    // }
    // setNeedsEmailVerify(true);
    // setLoading(false);
  } catch (error) {
    console.error("Error en el submit:", error);
    setError("Error al procesar la solicitud.");
    setLoading(false);
  }finally{
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
      setError("Aún no podemos iniciar sesión. Verifica tu correo y vuelve a intentar.");
      setLoading(false);
      return; // ← RETURN en lugar de throw
    }

    // ✅ Usa el userId directamente del response, no de otra llamada
    const userId = data.user?.id;
    if (!userId) {
      setError("No se pudo obtener el usuario.");
      setLoading(false);
      return;
    }

    // ✅ Llama directamente a finalizeSubmitWithSession con el userId
    await finalizeSubmitWithSession(userId);
    
  } catch (error: any) {
    console.error("Error en verificación:", error);
    setError(error?.message ?? "Error al procesar la verificación.");
    setLoading(false);
  }
}

  return (
    <AuthShell
      title="Promii Empresas"
      subtitle="Completa tu solicitud. Una vez aprobada, podrás publicar Promiis."
      badgeText="Solicitud · Promii Empresas"
    >
      <AuthCard
        heading="Solicitud de negocio"
        subheading="Esto nos ayuda a evitar estafas"
      >
        {/* Panel verificación */}
        {needsEmailVerify ? (
          <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
            <div className="text-sm font-semibold text-text-primary">
              Te enviamos un correo para verificar tu cuenta
            </div>
            <div className="text-sm text-text-secondary">
              Revisa tu bandeja de entrada (y spam). Cuando verifiques, vuelve a
              esta pantalla y presiona el botón.
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
                href="/business/sign-in"
              >
                iniciar sesión
              </Link>
              .
            </div>
          </div>
        ) : null}

        {/* Form principal */}
        <form onSubmit={onSubmit} className="space-y-3">
          {/* Cuenta (solo si no hay sesión) */}
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

          {/* Negocio */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-text-primary">
              Tu negocio
            </div>

            <Input
              placeholder="Nombre del negocio"
              name="businessName"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                saveDraft({ businessName: e.target.value });
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

            {/* Estado (selector) */}
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
              {VENEZUELA_STATES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Ciudad (selector dependiente) */}
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
              placeholder="Zona"
              name="zone"
              value={zone}
              onChange={(e) => {
                setZone(e.target.value);
                saveDraft({ zone: e.target.value });
              }}
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
