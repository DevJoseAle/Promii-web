"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/context/AuthContext";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCitiesByState } from "@/config/locations/cities";
import { VENEZUELA_STATES } from "@/config/locations/states";
import { ToastService } from "@/lib/toast/toast.service";
import { getSupabaseBrowserClient } from "@/lib/supabase.ssr";
import { PhotosField } from "@/components/ui/merchant/image-uploader";
import { uploadPromiiPhotos } from "@/lib/services/promiis/promiiPhotoUpload.service";

type CurrencyCode = "USD" | "CLP";
type PromiiStatus = "draft";

// =============================
// 1) CATEGORÍAS (DB en inglés, UI en español)
// =============================
const PROMII_CATEGORIES = [
  "food",
  "coffee",
  "dessert",
  "bars",
  "beauty",
  "fitness",
  "health",
  "services",
  "education",
  "events",
  "shopping",
  "kids",
  "pets",
  "other",
] as const;

type PromiiCategory = (typeof PROMII_CATEGORIES)[number];

const PROMII_CATEGORY_LABELS: Record<PromiiCategory, string> = {
  food: "Comida",
  coffee: "Cafeterías",
  dessert: "Postres",
  bars: "Bares",
  beauty: "Belleza",
  fitness: "Fitness",
  health: "Salud",
  services: "Servicios",
  education: "Educación",
  events: "Eventos",
  shopping: "Compras",
  kids: "Niños",
  pets: "Mascotas",
  other: "Otros",
};

// =============================
// 2) FORM STATE (lo que usa el UI)
// =============================
type FormState = {
  title: string;
  description: string;
  terms: string;

  category_primary: PromiiCategory | "";
  category_secondary: PromiiCategory | "";

  price_amount: string;
  price_currency: CurrencyCode;
  original_price_amount: string;

  start_at: string; // datetime-local
  end_at: string;

  max_redemptions: string;
  allow_multiple_per_user: boolean;
  max_units_per_user: string;

  // ✅ Selectores
  stateId: string;
  cityId: string;
  otherCityName: string;

  zone: string;
  address_line: string;

  geo_lat: string;
  geo_lng: string;

  // ✅ Influencers
  assignToInfluencer: boolean;
  default_influencer_id: string;
  photos: File[]; // ✅ nuevas fotos (locales)
};

type Errors = Partial<Record<keyof FormState, string>>;

// =============================
// 3) DB ROW (lo que viene realmente de Supabase)
//    NOTA: state/city aquí son string con nombres (ej: "Barinas")
// =============================
type DbPromiiRow = {
  id: string;
  merchant_id: string;
  status: "draft" | "active" | "paused" | "expired";

  title: string;
  description: string;
  terms: string;

  category_primary: PromiiCategory;
  category_secondary: PromiiCategory | null;

  price_amount: number;
  price_currency: CurrencyCode;
  original_price_amount: number | null;
  discount_label: string | null;

  start_at: string; // ISO
  end_at: string; // ISO

  max_redemptions: number | null;
  allow_multiple_per_user: boolean;
  max_units_per_user: number | null;

  state: string;
  city: string;
  zone: string | null;
  address_line: string | null;

  geo_lat: number | null;
  geo_lng: number | null;

  allow_influencers: boolean;
  default_influencer_id: string | null;
};

// ✅ CORREGIDO: initialData YA NO es FormState
interface CreatePromiiFormProps {
  type: "new" | "edit";
  promiiId?: string;
  initialData?: DbPromiiRow | null;
}

// =============================
// 4) DEFAULTS
// =============================
const DEFAULTS: FormState = {
  title: "",
  description: "",
  terms: "",

  category_primary: "",
  category_secondary: "",

  price_amount: "",
  price_currency: "USD",
  original_price_amount: "",

  start_at: "",
  end_at: "",

  max_redemptions: "",
  allow_multiple_per_user: false,
  max_units_per_user: "1",

  stateId: "",
  cityId: "",
  otherCityName: "",

  zone: "",
  address_line: "",

  geo_lat: "",
  geo_lng: "",

  assignToInfluencer: false,
  default_influencer_id: "",
  photos: [],
};

// =============================
// 5) HELPERS
// =============================

function toNumberOrNull(v: string) {
  const t = v.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function toIntOrNull(v: string) {
  const n = toNumberOrNull(v);
  if (n === null) return null;
  return Number.isInteger(n) ? n : Math.trunc(n);
}

function toISOFromDatetimeLocal(v: string) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

// ✅ FALTABA: ISO -> datetime-local (para editar)
function toDatetimeLocal(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function computeDiscountLabel(original: number | null, current: number | null) {
  if (!original || !current) return "";
  if (original <= 0 || current <= 0) return "";
  if (current >= original) return "";
  const pct = Math.round(((original - current) / original) * 100);
  return `${pct}% OFF`;
}

// UI guarda ID, DB guarda name
function getStateNameById(stateId: string) {
  return VENEZUELA_STATES.find((s: any) => s.id === stateId)?.name ?? stateId;
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function getStateIdByName(stateName: string) {
  const n = normalize(stateName);
  return n
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "_");
}

function getCityIdFromName(stateId: string, cityName: string) {
  const cities = getCitiesByState(stateId);
  const hit = cities.find((c) => normalize(c.name) === normalize(cityName));
  return hit?.id ?? "otra";
}

// ✅ mapper: DB -> FormState
function dbToForm(p: DbPromiiRow): FormState {
  const stateId = getStateIdByName(p.state || "");
  const cityId = getCityIdFromName(stateId, p.city || "");
  const otherCityName = cityId === "otra" ? p.city || "" : "";

  return {
    ...DEFAULTS,
    title: p.title ?? "",
    description: p.description ?? "",
    terms: p.terms ?? "",

    category_primary: (p.category_primary as PromiiCategory) ?? "",
    category_secondary: (p.category_secondary as PromiiCategory) ?? "",

    price_currency: p.price_currency ?? "USD",
    price_amount: p.price_amount != null ? String(p.price_amount) : "",
    original_price_amount:
      p.original_price_amount != null ? String(p.original_price_amount) : "",

    start_at: p.start_at ? toDatetimeLocal(p.start_at) : "",
    end_at: p.end_at ? toDatetimeLocal(p.end_at) : "",

    max_redemptions: p.max_redemptions != null ? String(p.max_redemptions) : "",
    allow_multiple_per_user: !!p.allow_multiple_per_user,
    max_units_per_user:
      p.max_units_per_user != null ? String(p.max_units_per_user) : "1",

    stateId,
    cityId,
    otherCityName,

    zone: p.zone ?? "",
    address_line: p.address_line ?? "",

    geo_lat: p.geo_lat != null ? String(p.geo_lat) : "",
    geo_lng: p.geo_lng != null ? String(p.geo_lng) : "",

    // DB allow_influencers -> form assignToInfluencer
    assignToInfluencer: !!p.allow_influencers,
    default_influencer_id: p.default_influencer_id ?? "",
  };
}

// =============================
// 6) VALIDATE (igual que tenías)
// =============================
function validate(values: FormState): Errors {
  const e: Errors = {};

  if (!values.title.trim()) e.title = "El título es requerido.";
  if (!values.description.trim())
    e.description = "La descripción es requerida.";
  if (!values.terms.trim()) e.terms = "Los términos son requeridos.";

  if (!values.category_primary)
    e.category_primary = "Selecciona una categoría.";

  const price = toNumberOrNull(values.price_amount);
  if (price === null || price <= 0)
    e.price_amount = "Ingresa un precio válido (> 0).";

  const startISO = toISOFromDatetimeLocal(values.start_at);
  const endISO = toISOFromDatetimeLocal(values.end_at);
  if (!startISO) e.start_at = "Selecciona fecha/hora de inicio.";
  if (!endISO) e.end_at = "Selecciona fecha/hora de fin.";
  if (startISO && endISO && new Date(endISO) <= new Date(startISO)) {
    e.end_at = "La fecha de fin debe ser posterior a la de inicio.";
  }

  if (!values.stateId.trim()) e.stateId = "Selecciona un estado.";
  if (!values.cityId.trim()) e.cityId = "Selecciona una ciudad.";

  if (values.cityId === "otra" && !values.otherCityName.trim()) {
    e.otherCityName = "Escribe el nombre de la ciudad.";
  }

  const maxRed = toIntOrNull(values.max_redemptions);
  if (values.max_redemptions.trim() && (maxRed === null || maxRed < 1)) {
    e.max_redemptions = "Debe ser un número entero >= 1.";
  }

  const maxUnits = toIntOrNull(values.max_units_per_user);
  if (values.max_units_per_user.trim() && (maxUnits === null || maxUnits < 1)) {
    e.max_units_per_user = "Debe ser un número entero >= 1.";
  }

  if (!values.allow_multiple_per_user) {
    if (
      values.max_units_per_user.trim() &&
      maxUnits !== null &&
      maxUnits !== 1
    ) {
      e.max_units_per_user =
        "Si no permites múltiples, el máximo por usuario debe ser 1.";
    }
  } else {
    if (values.max_units_per_user.trim() && maxUnits !== null && maxUnits < 2) {
      e.max_units_per_user =
        "Si permites múltiples, el máximo por usuario debe ser >= 2 (o vacío).";
    }
  }

  const lat = toNumberOrNull(values.geo_lat);
  if (values.geo_lat.trim() && (lat === null || lat < -90 || lat > 90)) {
    e.geo_lat = "Latitud inválida (-90 a 90).";
  }

  if (values.photos.length < 1) {
    e.photos = "Debes subir al menos una foto.";
  }

  const lng = toNumberOrNull(values.geo_lng);
  if (values.geo_lng.trim() && (lng === null || lng < -180 || lng > 180)) {
    e.geo_lng = "Longitud inválida (-180 a 180).";
  }

  return e;
}

// =============================
// 7) FIELD
// =============================
function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-sm font-semibold text-text-primary">{label}</div>
        {hint ? (
          <div className="text-xs text-text-secondary">{hint}</div>
        ) : null}
      </div>
      {children}
      {error ? <div className="text-xs text-red-600">{error}</div> : null}
    </div>
  );
}

// =============================
// 8) COMPONENT
// =============================
export function CreatePromiiForm({
  type = "new",
  promiiId,
  initialData,
}: CreatePromiiFormProps) {
  const router = useRouter();

  const supabase = React.useMemo(() => getSupabaseBrowserClient(), []);
  const { profile, session, loading } = useAuth();
  console.log("useAuth",
    {
        profile, session, loading
    }
  );

  const [values, setValues] = React.useState<FormState>(DEFAULTS);
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitting, setSubmitting] = React.useState(false);

  const [globalError, setGlobalError] = React.useState<string | null>(null);

  const isMerchantPending =
    profile?.role === "merchant" && profile?.state === "pending";

  const cities = React.useMemo(() => {
    if (!values.stateId) return [];
    return getCitiesByState(values.stateId);
  }, [values.stateId]);

  function update<K extends keyof FormState>(key: K, val: FormState[K]) {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
    setGlobalError(null);
  }

  // ✅ Reset city al cambiar state (con guard)
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!values.stateId) return;
    setValues((p) => ({ ...p, cityId: "", otherCityName: "" }));
    setErrors((p) => ({ ...p, cityId: undefined, otherCityName: undefined }));
  }, [values.stateId]);

  // ✅ NUEVO: precargar para editar
  React.useEffect(() => {
    if (!initialData) return;
    setValues(dbToForm(initialData));
  }, [initialData]);

  const discountLabelPreview = React.useMemo(() => {
    const original = toNumberOrNull(values.original_price_amount);
    const current = toNumberOrNull(values.price_amount);
    return computeDiscountLabel(original, current);
  }, [values.original_price_amount, values.price_amount]);

  // ✅ tu onSubmit puede quedar igual (todavía insert)
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    setGlobalError(null);

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      ToastService.showErrorToast(
        "Por favor corrige los errores en el formulario",
      );
      return;
    }
    if (values.photos.length < 1) {
      ToastService.showErrorToast("Debes subir al menos 1 foto.");
      return;
    }
    if (values.photos.length > 4) {
      ToastService.showErrorToast("Máximo 4 fotos.");
      return;
    }
    if (submitting) return;

    if (loading) {
      ToastService.showErrorToast("Cargando tu perfil, intenta de nuevo...");
      return;
    }

    if (!session?.user) {
      setGlobalError(
        "No hay sesión activa. Por favor inicia sesión nuevamente.",
      );
      ToastService.showErrorToast("No hay sesión activa");
      return;
    }

    if (!profile) {
      setGlobalError("No pudimos cargar tu perfil. Recarga la página.");
      ToastService.showErrorToast("No pudimos cargar tu perfil");
      return;
    }

    if (profile.role !== "merchant") {
      setGlobalError("Solo merchants pueden crear Promiis.");
      ToastService.showErrorToast("Solo merchants pueden crear Promiis");
      return;
    }

    const merchant_id = profile.id;

    const price_amount = toNumberOrNull(values.price_amount);
    if (price_amount == null || price_amount <= 0) {
      setGlobalError("El precio debe ser mayor a 0.");
      return;
    }

    const original_price_amount = toNumberOrNull(values.original_price_amount);
    const discount_label =
      computeDiscountLabel(original_price_amount, price_amount) || null;

    const max_redemptions = toIntOrNull(values.max_redemptions);
    const max_units_per_user = values.allow_multiple_per_user
      ? toIntOrNull(values.max_units_per_user)
      : 1;

    const startISO = toISOFromDatetimeLocal(values.start_at);
    const endISO = toISOFromDatetimeLocal(values.end_at);

    if (!startISO || !endISO) {
      setGlobalError("Selecciona fechas válidas.");
      return;
    }

    const stateName = getStateNameById(values.stateId);
    const cityName =
      values.cityId === "otra"
        ? values.otherCityName.trim()
        : (cities.find((c: any) => c.id === values.cityId)?.name ?? "");

    const payload = {
      merchant_id,
      status: "draft" as PromiiStatus,

      title: values.title.trim(),
      description: values.description.trim(),
      terms: values.terms.trim(),

      category_primary: values.category_primary,
      category_secondary: values.category_secondary || null,

      price_amount,
      price_currency: values.price_currency,
      original_price_amount,
      discount_label,

      start_at: startISO,
      end_at: endISO,

      max_redemptions,
      allow_multiple_per_user: values.allow_multiple_per_user,
      max_units_per_user,

      state: stateName,
      city: cityName,
      zone: values.zone.trim() || null,
      address_line: values.address_line.trim() || null,

      geo_lat: toNumberOrNull(values.geo_lat),
      geo_lng: toNumberOrNull(values.geo_lng),

      allow_influencers: values.assignToInfluencer,
      default_influencer_id:
        values.assignToInfluencer && values.default_influencer_id.trim()
          ? values.default_influencer_id.trim()
          : null,
    };

    setSubmitting(true);
    try {
      const query =
        type === "edit"
          ? supabase.from("promiis").update(payload).eq("id", promiiId)
          : supabase.from("promiis").insert(payload);

      const { data, error } = await query
        .select("id,status,created_at")
        .single();

      if (error) throw error;
      if (!data?.id) throw new Error("No se pudo obtener el ID del Promii");

      await uploadPromiiPhotos({
        promiiId: data.id, // ✅ CORRECTO
        merchantId: payload.merchant_id,
        files: values.photos,
      });

      ToastService.showSuccessToast("Promii guardado como borrador");
      router.push("/business/dashboard/validate/pending");
    } catch (err: any) {
      const msg =
        err?.message ??
        err?.details ??
        err?.hint ??
        "No se pudo guardar el Promii. Revisa los campos e inténtalo de nuevo.";

      setGlobalError(msg);
      ToastService.showErrorToast(msg);
    } finally {
      setSubmitting(false);
    }
  }

  //

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* ✅ NUEVO: Banner de error global */}
      {globalError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <div className="font-semibold">Error al guardar</div>
          <div className="mt-1 text-red-800">{globalError}</div>
        </div>
      )}

      {isMerchantPending ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="font-semibold">Tu cuenta está en revisión</div>
          <div className="mt-1 text-amber-800">
            Puedes crear Promiis como borrador, pero no aparecerán en Promii
            hasta que tu empresa sea verificada.
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left: form */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div>
            <div className="text-base font-semibold text-text-primary">
              Detalles del Promii
            </div>
            <div className="mt-1 text-sm text-text-secondary">
              Guarda como borrador y luego lo envías a validación.
            </div>
          </div>

          <div className="mt-6 grid gap-5">
            <Field
              label="Título"
              error={errors.title}
              hint="Ej: 2x1 en hamburguesas"
            >
              <Input
                value={values.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Título del Promii"
                className="h-10"
              />
            </Field>

            <Field
              label="Descripción"
              error={errors.description}
              hint="Qué incluye y por qué conviene"
            >
              <textarea
                value={values.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe la promo en pocas líneas..."
                className={cn(
                  "min-h-[96px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-ring/50",
                )}
              />
            </Field>

            <Field
              label="Términos y condiciones"
              error={errors.terms}
              hint="Restricciones y condiciones de uso"
            >
              <textarea
                value={values.terms}
                onChange={(e) => update("terms", e.target.value)}
                placeholder="Ej: No acumulable, válido de lunes a jueves..."
                className={cn(
                  "min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-ring/50",
                )}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Categoría primaria"
                error={errors.category_primary}
                hint="Obligatoria"
              >
                <select
                  value={values.category_primary}
                  onChange={(e) => {
                    const next = e.target.value as PromiiCategory | "";
                    update("category_primary", next);

                    // opcional: si secundaria quedó igual a la primaria, límpiala
                    if (next && values.category_secondary === next) {
                      update("category_secondary", "");
                    }
                  }}
                  required
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="">Selecciona una categoría</option>
                  {PROMII_CATEGORIES.map((key) => (
                    <option key={key} value={key}>
                      {PROMII_CATEGORY_LABELS[key]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Categoría secundaria (opcional)"
                error={errors.category_secondary}
                hint="Recomendada"
              >
                <select
                  value={values.category_secondary}
                  onChange={(e) =>
                    update(
                      "category_secondary",
                      e.target.value as PromiiCategory | "",
                    )
                  }
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  disabled={!values.category_primary}
                >
                  <option value="">
                    {values.category_primary
                      ? "Selecciona una secundaria (opcional)"
                      : "Elige primero una primaria"}
                  </option>

                  {PROMII_CATEGORIES.filter(
                    (k) => k !== values.category_primary,
                  ).map((key) => (
                    <option key={key} value={key}>
                      {PROMII_CATEGORY_LABELS[key]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Precio" error={errors.price_amount}>
                <Input
                  value={values.price_amount}
                  onChange={(e) => update("price_amount", e.target.value)}
                  placeholder="Ej: 9.99"
                  inputMode="decimal"
                  className="h-10"
                />
              </Field>

              <Field
                label="Precio original (opcional)"
                hint="Para calcular % OFF automáticamente"
              >
                <Input
                  value={values.original_price_amount}
                  onChange={(e) =>
                    update("original_price_amount", e.target.value)
                  }
                  placeholder="Ej: 19.99"
                  inputMode="decimal"
                  className="h-10"
                />
              </Field>

              <Field label="Moneda">
                <select
                  value={values.price_currency}
                  onChange={(e) =>
                    update("price_currency", e.target.value as CurrencyCode)
                  }
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="USD">USD</option>
                  <option value="CLP">CLP</option>
                </select>
              </Field>
            </div>

            {/* ✅ Discount label NO editable */}
            <Field
              label="Etiqueta de descuento"
              hint="Se calcula automáticamente"
            >
              <Input
                value={discountLabelPreview}
                disabled
                className="h-10"
                placeholder="Ej: 40% OFF"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Inicio" error={errors.start_at}>
                <Input
                  type="datetime-local"
                  value={values.start_at}
                  onChange={(e) => update("start_at", e.target.value)}
                  className="h-10"
                />
              </Field>

              <Field label="Fin" error={errors.end_at}>
                <Input
                  type="datetime-local"
                  value={values.end_at}
                  onChange={(e) => update("end_at", e.target.value)}
                  className="h-10"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Cupos máximos (opcional)"
                error={errors.max_redemptions}
                hint="Total redenciones"
              >
                <Input
                  value={values.max_redemptions}
                  onChange={(e) => update("max_redemptions", e.target.value)}
                  placeholder="Ej: 200"
                  inputMode="numeric"
                  className="h-10"
                />
              </Field>

              <Field label="¿Permitir múltiples por usuario?">
                <select
                  value={values.allow_multiple_per_user ? "yes" : "no"}
                  onChange={(e) => {
                    const allow = e.target.value === "yes";
                    update("allow_multiple_per_user", allow);

                    // ✅ si NO permite múltiples -> fija 1 y bloquea input
                    if (!allow) update("max_units_per_user", "1");
                    else if (values.max_units_per_user === "1")
                      update("max_units_per_user", "");
                  }}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="no">No</option>
                  <option value="yes">Sí</option>
                </select>
              </Field>

              <Field
                label="Máx. por usuario"
                error={errors.max_units_per_user}
                hint={
                  values.allow_multiple_per_user
                    ? ">= 2 (o vacío)"
                    : "Fijo en 1"
                }
              >
                <Input
                  value={values.max_units_per_user}
                  onChange={(e) => update("max_units_per_user", e.target.value)}
                  placeholder={values.allow_multiple_per_user ? "Ej: 3" : "1"}
                  inputMode="numeric"
                  className="h-10"
                  disabled={!values.allow_multiple_per_user}
                />
              </Field>
            </div>

            {/* ✅ Estado / Ciudad: select + "otra" */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Estado" error={errors.stateId}>
                <select
                  name="state"
                  value={values.stateId}
                  onChange={(e) => update("stateId", e.target.value)}
                  required
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                >
                  <option value="">Selecciona un estado</option>
                  {VENEZUELA_STATES.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Ciudad" error={errors.cityId}>
                <select
                  name="city"
                  value={values.cityId}
                  onChange={(e) => update("cityId", e.target.value)}
                  required
                  disabled={!values.stateId}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                >
                  <option value="">
                    {values.stateId
                      ? "Selecciona una ciudad"
                      : "Elige primero un estado"}
                  </option>

                  {cities.map((c: any) => (
                    <option
                      key={`${values.stateId}-${c.id}-${c.name}`}
                      value={c.id}
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {values.cityId === "otra" ? (
              <Field
                label="Nombre de la ciudad"
                error={errors.otherCityName}
                hint="Para que no te quedes sin publicar por no estar en el listado"
              >
                <Input
                  value={values.otherCityName}
                  onChange={(e) => update("otherCityName", e.target.value)}
                  placeholder="Ej: San Antonio de los Altos"
                  className="h-10"
                />
              </Field>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Zona (opcional)">
                <Input
                  value={values.zone}
                  onChange={(e) => update("zone", e.target.value)}
                  placeholder="Ej: Las Mercedes"
                  className="h-10"
                />
              </Field>

              <Field label="Dirección (opcional)">
                <Input
                  value={values.address_line}
                  onChange={(e) => update("address_line", e.target.value)}
                  placeholder="Ej: Av. Principal, local 12"
                  className="h-10"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Latitud (opcional)" error={errors.geo_lat}>
                <Input
                  value={values.geo_lat}
                  onChange={(e) => update("geo_lat", e.target.value)}
                  placeholder="Ej: 10.495"
                  inputMode="decimal"
                  className="h-10"
                />
              </Field>
              <Field label="Fotos Para el Promii">
                <PhotosField
                  files={values.photos}
                  onChange={(photos) => update("photos", photos)}
                  error={errors.photos}
                />
                {values.photos.length < 1 && (
                  <div className="text-xs text-red-600">
                    Debes subir al menos 1 fotos.
                  </div>
                )}
              </Field>
              <Field label="Longitud (opcional)" error={errors.geo_lng}>
                <Input
                  value={values.geo_lng}
                  onChange={(e) => update("geo_lng", e.target.value)}
                  placeholder="Ej: -66.853"
                  inputMode="decimal"
                  className="h-10"
                />
              </Field>
            </div>

            {/* ✅ Influencers: "Asignar a Influencer" + select vacío */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Asignar a Influencer">
                <select
                  value={values.assignToInfluencer ? "yes" : "no"}
                  onChange={(e) => {
                    const on = e.target.value === "yes";
                    update("assignToInfluencer", on);
                    if (!on) update("default_influencer_id", "");
                  }}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="no">No</option>
                  <option value="yes">Sí</option>
                </select>
              </Field>

              <Field label="Influencer" hint="Tus afiliados aparecerán aquí">
                <select
                  value={values.default_influencer_id}
                  onChange={(e) =>
                    update("default_influencer_id", e.target.value)
                  }
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm disabled:opacity-50"
                  disabled={!values.assignToInfluencer}
                >
                  <option value="">No tienes influencers afiliados</option>
                  {/* Luego: map de afiliados reales */}
                </select>
              </Field>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="h-10 bg-primary text-white hover:bg-primary/90"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Guardando...
                </span>
              ) : (
                <>
                  {type === "edit"
                    ? "Guardar cambios"
                    : "Guardar como borrador"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right: helper panel */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="text-sm font-semibold text-text-primary">
              Qué va a contener un Promii
            </div>
            <div className="mt-3 space-y-2 text-sm text-text-secondary">
              <div>✅ Título claro y atractivo</div>
              <div>✅ Descuento real (ej. 30–60%)</div>
              <div>✅ Condiciones simples</div>
              <div>✅ Vigencia y cupos definidos</div>
              <div>✅ Horarios de uso, dirección</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-primary/5 p-5">
            <div className="text-sm font-semibold text-text-primary">
              Tip: dinero del futuro ✨
            </div>
            <div className="mt-2 text-sm text-text-secondary">
              Los Promiis con más vigencia de uso te permiten que la gente
              compre a futuro, y tú puedas traer dinero{" "}
              <span className="font-semibold text-text-primary">
                del futuro
              </span>
              .
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
