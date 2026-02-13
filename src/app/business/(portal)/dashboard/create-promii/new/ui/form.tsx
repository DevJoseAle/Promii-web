"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/context/AuthContext";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COLORS } from "@/config/colors";
import { getCitiesByState } from "@/config/locations/cities";
import { VENEZUELA_STATES } from "@/config/locations/states";
import { ToastService } from "@/lib/toast/toast.service";
import { PhotosField, type ExistingPhoto } from "@/components/ui/merchant/image-uploader";
import { uploadPromiiPhotos, fetchPromiiPhotos, deletePromiiPhoto, type PromiiPhotoRow } from "@/lib/services/promiis/promiiPhotoUpload.service";
import { supabase } from "@/lib/supabase/supabase.client";
import { useAuthStore } from "@/lib/stores/auth/authStore";
import { getMerchantPartnerships, assignInfluencerToPromii, type PartnershipWithDetails } from "@/lib/services/influencer";

type CurrencyCode = "USD" | "CLP";
type PromiiStatus = "draft" | "active" | "paused" | "expired";

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
  useAutoCode: boolean; // true = automático, false = manual
  manualReferralCode: string; // código manual del merchant
  extraDiscountType: "percentage" | "fixed" | "";
  extraDiscountValue: string;
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
  useAutoCode: true,
  manualReferralCode: "",
  extraDiscountType: "",
  extraDiscountValue: "",
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
    photos: []
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

  // photos validation is handled in onSubmit (needs existingPhotos state)

  const lng = toNumberOrNull(values.geo_lng);
  if (values.geo_lng.trim() && (lng === null || lng < -180 || lng > 180)) {
    e.geo_lng = "Longitud inválida (-180 a 180).";
  }

  // Validar código manual si está activado
  if (values.assignToInfluencer && !values.useAutoCode) {
    const code = values.manualReferralCode.trim();
    if (!code) {
      e.manualReferralCode = "El código es requerido si eliges código manual";
    } else if (code.length < 8 || code.length > 17) {
      e.manualReferralCode = "El código debe tener entre 8 y 17 caracteres";
    } else if (!/^[A-Z0-9_-]+$/i.test(code)) {
      e.manualReferralCode = "Solo letras, números, guiones (-) y guiones bajos (_)";
    }
  }

  return e;
}

// =============================
// 7) DESIGN COMPONENTS (interface-design principles)
// =============================

// Section Header Component
function SectionHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-center gap-3 pb-5" style={{ borderBottom: `1px solid ${COLORS.border.light}` }}>
      <div
        className="flex size-10 items-center justify-center rounded-lg shrink-0"
        style={{ backgroundColor: COLORS.primary.lighter }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-bold truncate" style={{ color: COLORS.text.primary }}>
          {title}
        </h2>
        <p className="text-sm mt-0.5" style={{ color: COLORS.text.secondary }}>
          {description}
        </p>
      </div>
    </div>
  );
}

// Field Component
function Field({
  label,
  hint,
  error,
  children,
  required,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
          {label}
          {required && <span style={{ color: COLORS.error.main }} className="ml-0.5">*</span>}
        </label>
        {hint && (
          <span className="text-xs" style={{ color: COLORS.text.tertiary }}>
            {hint}
          </span>
        )}
      </div>
      {children}
      {error && (
        <div
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: COLORS.error.dark }}
        >
          <svg className="size-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
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
  const status = useAuthStore((s) => s.status);
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const hydrated = useAuthStore((s) => s._hasHydrated);
  const loading = !hydrated || status === "loading";

  console.log("useAuth", {
    profile,
    session,
    loading,
  });

  const [values, setValues] = React.useState<FormState>(DEFAULTS);
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitting, setSubmitting] = React.useState(false);

  const [globalError, setGlobalError] = React.useState<string | null>(null);

  // Existing photos (for edit mode)
  const [existingPhotos, setExistingPhotos] = React.useState<ExistingPhoto[]>([]);
  const [removedPhotoIds, setRemovedPhotoIds] = React.useState<string[]>([]);
  const [existingPhotoRows, setExistingPhotoRows] = React.useState<PromiiPhotoRow[]>([]);

  // Influencer partnerships
  const [approvedInfluencers, setApprovedInfluencers] = React.useState<PartnershipWithDetails[]>([]);
  const [loadingInfluencers, setLoadingInfluencers] = React.useState(false);

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

  function handleRemoveExistingPhoto(photoId: string) {
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
    setRemovedPhotoIds((prev) => [...prev, photoId]);
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

  // ✅ Load approved influencers
  React.useEffect(() => {
    if (!profile?.id) return;

    async function loadInfluencers() {
      setLoadingInfluencers(true);
      const response = await getMerchantPartnerships(profile!.id, "approved");
      if (response.status === "success" && response.data) {
        setApprovedInfluencers(response.data);
      }
      setLoadingInfluencers(false);
    }

    loadInfluencers();
  }, [profile?.id]);

  // ✅ NUEVO: precargar para editar
  React.useEffect(() => {
    if (!initialData) return;
    setValues(dbToForm(initialData));
  }, [initialData]);

  // ✅ Cargar fotos existentes en modo edit
  React.useEffect(() => {
    if (type !== "edit" || !promiiId) return;

    async function loadExistingPhotos() {
      try {
        const photos = await fetchPromiiPhotos(promiiId!);
        setExistingPhotoRows(photos);
        setExistingPhotos(
          photos.map((p) => ({
            id: p.id,
            public_url: p.public_url,
            sort_order: p.sort_order,
          }))
        );
      } catch (err) {
        console.error("[EditPromii] Error loading existing photos:", err);
      }
    }

    loadExistingPhotos();
  }, [type, promiiId]);

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

    // Validate photos considering existing ones
    const totalPhotos = existingPhotos.length + values.photos.length;
    if (totalPhotos < 1) {
      nextErrors.photos = "Debes subir al menos una foto.";
    }
    if (totalPhotos > 4) {
      nextErrors.photos = "Máximo 4 fotos.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      ToastService.showErrorToast(
        "Por favor corrige los errores en el formulario",
      );
      return;
    }
    if (submitting) return;

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
      // En edit: preservar el status original; en new: siempre draft
      status: (type === "edit" && initialData ? initialData.status : "draft") as PromiiStatus,

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

      // Delete removed existing photos
      if (removedPhotoIds.length > 0) {
        for (const photoId of removedPhotoIds) {
          const photoRow = existingPhotoRows.find((p) => p.id === photoId);
          if (photoRow) {
            try {
              await deletePromiiPhoto(photoRow);
            } catch (err) {
              console.warn("[EditPromii] Error deleting photo:", err);
            }
          }
        }
      }

      // Upload new photos (only if there are new files)
      if (values.photos.length > 0) {
        await uploadPromiiPhotos({
          promiiId: data.id,
          merchantId: payload.merchant_id,
          files: values.photos,
        });
      }

      // Create influencer assignment if selected
      if (values.assignToInfluencer && values.default_influencer_id) {
        console.log("[CreatePromiiForm] Creating influencer assignment...");

        // Preparar descuento extra si está definido
        let extraDiscount;
        if (values.extraDiscountType && values.extraDiscountValue) {
          const discountValue = toNumberOrNull(values.extraDiscountValue);
          if (discountValue && discountValue > 0) {
            extraDiscount = {
              type: values.extraDiscountType as "percentage" | "fixed",
              value: discountValue,
            };
          }
        }

        const assignmentResponse = await assignInfluencerToPromii({
          promii_id: data.id,
          influencer_id: values.default_influencer_id,
          merchant_id: payload.merchant_id,
          referral_code: values.useAutoCode ? undefined : values.manualReferralCode.trim(),
          extra_discount: extraDiscount,
        });

        if (assignmentResponse.status === "success") {
          console.log("[CreatePromiiForm] Assignment created successfully");
        } else {
          console.warn("[CreatePromiiForm] Failed to create assignment:", assignmentResponse.error);
          ToastService.showErrorToast(assignmentResponse.error || "Error al asignar influencer");
          // Don't block the flow, but show the error
        }
      }

      ToastService.showSuccessToast(
        type === "edit" ? "Promii actualizado correctamente" : "Promii guardado como borrador"
      );
      router.push("/business/dashboard/my-promiis");
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
      {/* Error global con diseño mejorado */}
      {globalError && (
        <div
          className="rounded-xl border p-4 shadow-sm"
          style={{
            backgroundColor: COLORS.error.lighter,
            borderColor: COLORS.error.light,
          }}
        >
          <div className="flex items-start gap-3">
            <svg className="size-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: COLORS.error.main }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <div className="font-semibold text-sm" style={{ color: COLORS.error.dark }}>
                Error al guardar
              </div>
              <div className="mt-1 text-sm" style={{ color: COLORS.error.dark }}>
                {globalError}
              </div>
            </div>
          </div>
        </div>
      )}

      {isMerchantPending && (
        <div
          className="rounded-xl border p-4 shadow-sm"
          style={{
            backgroundColor: COLORS.warning.lighter,
            borderColor: COLORS.warning.light,
          }}
        >
          <div className="flex items-start gap-3">
            <svg className="size-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: COLORS.warning.main }}>
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <div className="font-semibold text-sm" style={{ color: COLORS.warning.dark }}>
                Tu cuenta está en revisión
              </div>
              <div className="mt-1 text-sm" style={{ color: COLORS.warning.dark }}>
                Puedes crear Promiis como borrador, pero no aparecerán en Promii hasta que tu empresa sea verificada.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left: form */}
        <div className="space-y-6">
          {/* Sección: Información Básica */}
          <div
            className="rounded-xl border p-6 shadow-sm"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <SectionHeader
              icon={
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: COLORS.primary.main }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
              title="Información Básica"
              description="Título, descripción y categoría de tu Promii"
            />

            <div className="mt-6 grid gap-5">
            <Field
              label="Título"
              error={errors.title}
              hint="Ej: 2x1 en hamburguesas"
              required
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
              required
            >
              <textarea
                value={values.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe la promo en pocas líneas..."
                className="min-h-[96px] w-full rounded-lg border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2"
                style={{
                  borderColor: errors.description ? COLORS.error.main : COLORS.border.main,
                  backgroundColor: COLORS.background.tertiary,
                  color: COLORS.text.primary,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = COLORS.primary.main;
                  e.target.style.boxShadow = `0 0 0 3px ${COLORS.primary.lighter}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.description ? COLORS.error.main : COLORS.border.main;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </Field>

            <Field
              label="Términos y condiciones"
              error={errors.terms}
              hint="Restricciones y condiciones de uso"
              required
            >
              <textarea
                value={values.terms}
                onChange={(e) => update("terms", e.target.value)}
                placeholder="Ej: No acumulable, válido de lunes a jueves..."
                className="min-h-[120px] w-full rounded-lg border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2"
                style={{
                  borderColor: errors.terms ? COLORS.error.main : COLORS.border.main,
                  backgroundColor: COLORS.background.tertiary,
                  color: COLORS.text.primary,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = COLORS.primary.main;
                  e.target.style.boxShadow = `0 0 0 3px ${COLORS.primary.lighter}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.terms ? COLORS.error.main : COLORS.border.main;
                  e.target.style.boxShadow = 'none';
                }}
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
          </div>

          {/* Sección: Precios y Descuentos */}
          <div
            className="rounded-xl border p-6 shadow-sm"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <SectionHeader
              icon={
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: COLORS.primary.main }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Precios y Descuentos"
              description="Define el precio del Promii y su descuento"
            />

            <div className="mt-6 grid gap-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Precio" error={errors.price_amount} required>
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

                {/* Discount label NO editable */}
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
              </div>
            </div>
          </div>

          {/* Sección: Fechas y Disponibilidad */}
          <div
            className="rounded-xl border p-6 shadow-sm"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <SectionHeader
              icon={
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: COLORS.primary.main }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              title="Fechas y Disponibilidad"
              description="Vigencia del Promii y límites de uso"
            />

            <div className="mt-6 grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Inicio" error={errors.start_at} required>
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
          </div>

          {/* Sección: Ubicación */}
          <div
            className="rounded-xl border p-6 shadow-sm"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <SectionHeader
              icon={
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: COLORS.primary.main }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              title="Ubicación"
              description="Dónde se puede canjear este Promii"
            />

            <div className="mt-6 grid gap-5">
              {/* Estado / Ciudad: select + "otra" */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Estado" error={errors.stateId} required>
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
            </div>
          </div>

          {/* Sección: Fotos */}
          <div
            className="rounded-xl border p-6 shadow-sm"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <SectionHeader
              icon={
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: COLORS.primary.main }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              title="Fotos del Promii"
              description="Sube entre 1 y 4 imágenes atractivas (obligatorio)"
            />

            <div className="mt-6">
              <Field label="Fotos" error={errors.photos} required>
                <PhotosField
                  files={values.photos}
                  onChange={(photos) => update("photos", photos)}
                  existingPhotos={existingPhotos}
                  onRemoveExisting={handleRemoveExistingPhoto}
                  error={errors.photos}
                />
                {existingPhotos.length + values.photos.length < 1 && (
                  <div
                    className="mt-2 flex items-center gap-1.5 text-xs font-medium"
                    style={{ color: COLORS.error.dark }}
                  >
                    <svg className="size-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Debes subir al menos 1 foto
                  </div>
                )}
              </Field>
            </div>
          </div>

          {/* Sección: Influencers (opcional) */}
          <div
            className="rounded-xl border p-6 shadow-sm"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <SectionHeader
              icon={
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: COLORS.primary.main }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              title="Influencers"
              description="Asigna este Promii a influencers afiliados (opcional)"
            />

            <div className="mt-6 grid gap-5">
              {/* Influencers: "Asignar a Influencer" + select vacío */}
              <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Asignar a Influencer">
                <select
                  value={values.assignToInfluencer ? "yes" : "no"}
                  onChange={(e) => {
                    const on = e.target.value === "yes";
                    update("assignToInfluencer", on);
                    if (!on) {
                      update("default_influencer_id", "");
                      update("manualReferralCode", "");
                    }
                  }}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="no">No</option>
                  <option value="yes">Sí</option>
                </select>
              </Field>

              <Field label="Influencer" hint={loadingInfluencers ? "Cargando..." : "Selecciona un influencer afiliado"}>
                <select
                  value={values.default_influencer_id}
                  onChange={(e) =>
                    update("default_influencer_id", e.target.value)
                  }
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm disabled:opacity-50"
                  disabled={!values.assignToInfluencer || loadingInfluencers}
                >
                  <option value="">
                    {loadingInfluencers
                      ? "Cargando..."
                      : approvedInfluencers.length === 0
                      ? "No tienes influencers afiliados"
                      : "Selecciona un influencer"}
                  </option>
                  {approvedInfluencers.map((partnership) => (
                    <option key={partnership.influencer_id} value={partnership.influencer_id}>
                      {partnership.influencer?.display_name || "Sin nombre"} - @{partnership.influencer?.instagram_handle || ""}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Código de referido: automático o manual */}
            {values.assignToInfluencer && values.default_influencer_id && (
              <>
                <div
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: COLORS.primary.lighter,
                    borderColor: COLORS.primary.light,
                  }}
                >
                  <Field label="Tipo de código de referido">
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          update("useAutoCode", true);
                          update("manualReferralCode", "");
                        }}
                        className={cn(
                          "px-4 py-3 rounded-lg border-2 text-sm font-semibold transition-all",
                          values.useAutoCode
                            ? "shadow-sm"
                            : "opacity-60 hover:opacity-80"
                        )}
                        style={{
                          backgroundColor: values.useAutoCode ? COLORS.primary.main : COLORS.background.secondary,
                          borderColor: values.useAutoCode ? COLORS.primary.dark : COLORS.border.main,
                          color: values.useAutoCode ? "white" : COLORS.text.primary,
                        }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Automático</span>
                        </div>
                        <p className="text-xs mt-1 opacity-90">
                          Se genera al guardar
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => update("useAutoCode", false)}
                        className={cn(
                          "px-4 py-3 rounded-lg border-2 text-sm font-semibold transition-all",
                          !values.useAutoCode
                            ? "shadow-sm"
                            : "opacity-60 hover:opacity-80"
                        )}
                        style={{
                          backgroundColor: !values.useAutoCode ? COLORS.primary.main : COLORS.background.secondary,
                          borderColor: !values.useAutoCode ? COLORS.primary.dark : COLORS.border.main,
                          color: !values.useAutoCode ? "white" : COLORS.text.primary,
                        }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Manual</span>
                        </div>
                        <p className="text-xs mt-1 opacity-90">
                          Tú decides el código
                        </p>
                      </button>
                    </div>
                  </Field>
                </div>

                {/* Input de código manual */}
                {!values.useAutoCode && (
                  <Field
                    label="Código de referido personalizado"
                    error={errors.manualReferralCode}
                    hint="8-17 caracteres: letras, números, guiones (-) y guiones bajos (_)"
                    required
                  >
                    <Input
                      value={values.manualReferralCode}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "");
                        update("manualReferralCode", val);
                      }}
                      placeholder="Ej: CAFE_MARIA_2026"
                      className="h-10 font-mono"
                      maxLength={17}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs" style={{ color: COLORS.text.tertiary }}>
                        {values.manualReferralCode.length}/17 caracteres
                      </span>
                      {values.manualReferralCode.length >= 8 && values.manualReferralCode.length <= 17 && (
                        <span className="text-xs font-semibold flex items-center gap-1" style={{ color: COLORS.success.main }}>
                          <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Longitud válida
                        </span>
                      )}
                    </div>
                  </Field>
                )}

                {/* Descuento extra */}
                <div
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: COLORS.success.lighter,
                    borderColor: COLORS.success.light,
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: COLORS.success.main }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-bold" style={{ color: COLORS.success.dark }}>
                      Descuento extra con código (opcional)
                    </span>
                  </div>

                  <p className="text-xs mb-4" style={{ color: COLORS.success.dark }}>
                    Define un descuento adicional que se aplicará cuando usen el código de este influencer
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Tipo de descuento">
                      <select
                        value={values.extraDiscountType}
                        onChange={(e) => update("extraDiscountType", e.target.value as any)}
                        className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                      >
                        <option value="">Sin descuento extra</option>
                        <option value="percentage">Porcentaje (%)</option>
                        <option value="fixed">Monto fijo ({values.price_currency})</option>
                      </select>
                    </Field>

                    <Field
                      label={
                        values.extraDiscountType === "percentage"
                          ? "Porcentaje de descuento"
                          : values.extraDiscountType === "fixed"
                          ? `Descuento en ${values.price_currency}`
                          : "Valor"
                      }
                      hint={
                        values.extraDiscountType === "percentage"
                          ? "Ej: 10 (para 10% OFF adicional)"
                          : values.extraDiscountType === "fixed"
                          ? "Ej: 5.00"
                          : undefined
                      }
                    >
                      <Input
                        value={values.extraDiscountValue}
                        onChange={(e) => update("extraDiscountValue", e.target.value)}
                        placeholder={values.extraDiscountType ? (values.extraDiscountType === "percentage" ? "Ej: 10" : "Ej: 5.00") : "Primero elige tipo"}
                        inputMode="decimal"
                        className="h-10"
                        disabled={!values.extraDiscountType}
                      />
                    </Field>
                  </div>

                  {/* Preview del descuento */}
                  {values.extraDiscountType && values.extraDiscountValue && toNumberOrNull(values.extraDiscountValue) && (
                    <div
                      className="mt-3 rounded-lg border p-3"
                      style={{
                        backgroundColor: "white",
                        borderColor: COLORS.success.main,
                      }}
                    >
                      <div className="text-xs font-semibold mb-1" style={{ color: COLORS.success.dark }}>
                        Vista previa del beneficio:
                      </div>
                      <div className="text-sm font-bold" style={{ color: COLORS.success.main }}>
                        {values.extraDiscountType === "percentage"
                          ? `+${values.extraDiscountValue}% OFF adicional`
                          : `${values.price_currency} ${values.extraDiscountValue} menos`
                        } con código de influencer
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            </div>
          </div>

          {/* Footer: Botones de acción */}
          <div
            className="sticky bottom-0 -mx-6 -mb-6 rounded-b-xl border-t p-4 backdrop-blur-sm lg:bottom-auto lg:mx-0 lg:mb-0 lg:rounded-none lg:border-0 lg:p-0 lg:backdrop-blur-none"
            style={{
              backgroundColor: COLORS.background.primary + 'f5',
              borderColor: COLORS.border.light,
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 font-semibold transition-all hover:scale-105"
                onClick={() => router.back()}
                disabled={submitting}
                style={{
                  borderColor: COLORS.border.main,
                  color: COLORS.text.secondary,
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="h-11 font-semibold shadow-sm transition-all hover:scale-105 hover:shadow-md"
                disabled={submitting}
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
                  color: 'white',
                }}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
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
                  <span className="flex items-center gap-2">
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {type === "edit" ? "Guardar cambios" : "Guardar como borrador"}
                  </span>
                )}
              </Button>
            </div>
          </div>
          </div>
        </div>

        {/* Right: helper panel */}
        <div className="hidden lg:block space-y-4 sticky top-6">
          {/* Card: Checklist */}
          <div
            className="rounded-xl border p-5 shadow-sm"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: COLORS.success.main }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-bold" style={{ color: COLORS.text.primary }}>
                Checklist de un buen Promii
              </h3>
            </div>
            <div className="space-y-2.5 text-sm" style={{ color: COLORS.text.secondary }}>
              <div className="flex items-start gap-2">
                <svg className="size-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: COLORS.success.main }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Título claro y atractivo</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="size-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: COLORS.success.main }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Descuento real (30-60% OFF)</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="size-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: COLORS.success.main }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Condiciones simples</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="size-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: COLORS.success.main }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Vigencia y cupos definidos</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="size-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: COLORS.success.main }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Fotos de calidad</span>
              </div>
            </div>
          </div>

          {/* Card: Tip */}
          <div
            className="rounded-xl border p-5 shadow-sm"
            style={{
              backgroundColor: COLORS.primary.lighter,
              borderColor: COLORS.primary.light,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <svg className="size-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: COLORS.primary.main }}>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h3 className="text-sm font-bold" style={{ color: COLORS.primary.dark }}>
                Tip: Dinero del futuro
              </h3>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: COLORS.primary.dark }}>
              Los Promiis con más vigencia te permiten que la gente compre a futuro, y tú puedas traer{" "}
              <span className="font-bold">dinero del futuro</span> hoy.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
