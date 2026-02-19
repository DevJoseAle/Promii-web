"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquarePlus, Star } from "lucide-react";
import { COLORS } from "@/config/colors";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/supabase.client";
import { cn } from "@/lib/utils";

type FeedbackRole = "merchant" | "influencer";

type FeedbackItem = {
  id: string;
  subject: string;
  message: string;
  category: "general" | "bug" | "idea" | "support";
  rating: number | null;
  status: "open" | "answered" | "closed";
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
};

type Props = {
  role: FeedbackRole;
  userId: string;
  title?: string;
  subtitle?: string;
};

const CATEGORY_OPTIONS: Array<{ value: FeedbackItem["category"]; label: string }> = [
  { value: "general", label: "General" },
  { value: "bug", label: "Reporte de bug" },
  { value: "idea", label: "Nueva idea" },
  { value: "support", label: "Soporte" },
];

const STATUS_LABELS: Record<FeedbackItem["status"], string> = {
  open: "Abierto",
  answered: "Respondido",
  closed: "Cerrado",
};

const STATUS_STYLES: Record<FeedbackItem["status"], { bg: string; color: string }> = {
  open: { bg: COLORS.warning.lighter, color: COLORS.warning.dark },
  answered: { bg: COLORS.info.lighter, color: COLORS.info.dark },
  closed: { bg: COLORS.neutral[100], color: COLORS.text.tertiary },
};

export function FeedbackPanel({ role, userId, title, subtitle }: Props) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<FeedbackItem["category"]>("general");
  const [rating, setRating] = useState<number | null>(null);
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return subject.trim().length >= 4 && message.trim().length >= 10;
  }, [subject, message]);

  async function loadFeedbacks() {
    if (!userId) return;
    setLoading(true);
    setError(null);

    const { data, error: loadError } = await supabase
      .from("feedbacks")
      .select("id,subject,message,category,rating,status,admin_response,responded_at,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (loadError) {
      setError("No se pudo cargar el feedback. Intenta de nuevo.");
    } else {
      setItems((data ?? []) as FeedbackItem[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadFeedbacks();
  }, [userId]);

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      user_id: userId,
      role,
      subject: subject.trim(),
      message: message.trim(),
      category,
      rating,
    };

    const { data, error: insertError } = await supabase
      .from("feedbacks")
      .insert(payload)
      .select("id,subject,message,category,rating,status,admin_response,responded_at,created_at")
      .single();

    if (insertError) {
      setError("No se pudo enviar el feedback. Intenta de nuevo.");
      setSubmitting(false);
      return;
    }

    setItems((current) => [data as FeedbackItem, ...current]);
    setSubject("");
    setMessage("");
    setCategory("general");
    setRating(null);
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div
          className="flex size-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: COLORS.primary.lighter, color: COLORS.primary.main }}
        >
          <MessageSquarePlus className="size-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold" style={{ color: COLORS.text.primary }}>
            {title ?? "Feedback"}
          </h1>
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            {subtitle ?? "Tu feedback nos ayuda a mejorar Promii."}
          </p>
        </div>
      </div>

      <div
        className="rounded-2xl border p-5 space-y-4"
        style={{ borderColor: COLORS.border.light, backgroundColor: COLORS.background.primary }}
      >
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.text.tertiary }}>
              Asunto
            </label>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Ej: Sugerencia para el dashboard"
              className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.text.tertiary }}>
              Categoría
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as FeedbackItem["category"])}
              className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.text.tertiary }}>
            Mensaje
          </label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Cuéntanos el detalle, lo leemos todo."
            className="min-h-[140px] w-full rounded-xl border border-border bg-surface p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.text.tertiary }}>
              Satisfacción general (opcional)
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => {
                const active = rating != null && value <= rating;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full border transition-all",
                      active ? "border-transparent" : "border-border"
                    )}
                    style={{
                      backgroundColor: active ? COLORS.primary.main : COLORS.background.secondary,
                      color: active ? "white" : COLORS.text.tertiary,
                    }}
                    aria-label={`Calificación ${value}`}
                  >
                    <Star className="size-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? "Enviando..." : "Enviar feedback"}
          </Button>
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: COLORS.error.lighter, color: COLORS.error.dark }}>
            {error}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold" style={{ color: COLORS.text.primary }}>
          Mis feedbacks
        </h2>

        {loading ? (
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            Cargando feedbacks...
          </p>
        ) : items.length === 0 ? (
          <div
            className="rounded-xl border px-4 py-3 text-sm"
            style={{ borderColor: COLORS.border.light, color: COLORS.text.secondary }}
          >
            Aún no has enviado feedback.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const statusStyle = STATUS_STYLES[item.status];
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border p-4"
                  style={{ borderColor: COLORS.border.light, backgroundColor: COLORS.background.primary }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                      {item.subject}
                    </h3>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                    >
                      {STATUS_LABELS[item.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
                    {item.message}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs" style={{ color: COLORS.text.tertiary }}>
                    <span>Categoria: {CATEGORY_OPTIONS.find((c) => c.value === item.category)?.label}</span>
                    {item.rating ? <span>Rating: {item.rating}/5</span> : null}
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  {item.admin_response && (
                    <div
                      className="mt-4 rounded-xl border px-4 py-3 text-sm"
                      style={{ borderColor: COLORS.border.light, backgroundColor: COLORS.background.secondary }}
                    >
                      <p className="font-semibold" style={{ color: COLORS.text.primary }}>
                        Respuesta de Promii
                      </p>
                      <p className="mt-1" style={{ color: COLORS.text.secondary }}>
                        {item.admin_response}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
