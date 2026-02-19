"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { COLORS } from "@/config/colors";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Filter, Loader2, Send, XCircle } from "lucide-react";
import {
  getFeedbacks,
  respondFeedback,
  type FeedbackItem,
  type FeedbackRole,
  type FeedbackStatus,
} from "@/lib/services/admin/feedback.admin.service";
import { ToastService } from "@/lib/toast/toast.service";

const STATUS_CONFIG: Record<FeedbackStatus, { label: string; color: string; bg: string }> = {
  open: { label: "Abierto", color: COLORS.warning.dark, bg: COLORS.warning.lighter },
  answered: { label: "Respondido", color: COLORS.info.dark, bg: COLORS.info.lighter },
  closed: { label: "Cerrado", color: COLORS.text.tertiary, bg: COLORS.neutral[100] },
};

const ROLE_LABELS: Record<FeedbackRole, string> = {
  merchant: "Business",
  influencer: "Influencer",
};

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | "all">("all");
  const [filterRole, setFilterRole] = useState<FeedbackRole | "all">("all");
  const [selected, setSelected] = useState<FeedbackItem | null>(null);
  const [responseText, setResponseText] = useState("");

  const loadFeedbacks = useCallback(async () => {
    setLoading(true);
    const response = await getFeedbacks({
      status: filterStatus === "all" ? undefined : filterStatus,
      role: filterRole === "all" ? undefined : filterRole,
    });

    if (response.status === "success") {
      setFeedbacks(response.data);
      const stillExists = selected && response.data.some((item) => item.id === selected.id);
      if (response.data.length > 0 && !stillExists) {
        setSelected(response.data[0]);
        setResponseText(response.data[0].admin_response ?? "");
      }
      if (response.data.length === 0) {
        setSelected(null);
        setResponseText("");
      }
    } else {
      ToastService.showErrorToast(response.error || "Error al cargar feedbacks");
    }
    setLoading(false);
  }, [filterRole, filterStatus, selected]);

  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  const stats = useMemo(() => {
    return {
      total: feedbacks.length,
      open: feedbacks.filter((item) => item.status === "open").length,
      answered: feedbacks.filter((item) => item.status === "answered").length,
      closed: feedbacks.filter((item) => item.status === "closed").length,
    };
  }, [feedbacks]);

  function handleSelect(item: FeedbackItem) {
    setSelected(item);
    setResponseText(item.admin_response ?? "");
  }

  async function handleRespond(nextStatus: FeedbackStatus) {
    if (!selected) return;
    setActionLoading(true);
    const response = await respondFeedback({
      id: selected.id,
      response: responseText.trim() ? responseText.trim() : null,
      status: nextStatus,
    });

    if (response.status === "success") {
      const updated = response.data;
      setFeedbacks((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setSelected(updated);
      ToastService.showSuccessToast("Feedback actualizado");
    } else {
      ToastService.showErrorToast(response.error || "No se pudo actualizar el feedback");
    }
    setActionLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.text.primary }}>
          Feedbacks
        </h1>
        <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
          Revisa comentarios de negocios e influencers y responde directamente.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="size-4" style={{ color: COLORS.text.secondary }} />
          <span className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
            Filtros
          </span>
        </div>
        {(["all", "open", "answered", "closed"] as const).map((status) => (
          <Button
            key={status}
            size="sm"
            variant={filterStatus === status ? "default" : "outline"}
            onClick={() => setFilterStatus(status)}
            style={
              filterStatus === status
                ? { backgroundColor: COLORS.primary.main, color: "white", borderColor: COLORS.primary.main }
                : { color: COLORS.text.secondary, borderColor: COLORS.border.main }
            }
          >
            {status === "all" ? "Todos" : STATUS_CONFIG[status].label}
          </Button>
        ))}
        {(["all", "merchant", "influencer"] as const).map((role) => (
          <Button
            key={role}
            size="sm"
            variant={filterRole === role ? "default" : "outline"}
            onClick={() => setFilterRole(role)}
            style={
              filterRole === role
                ? { backgroundColor: COLORS.primary.main, color: "white", borderColor: COLORS.primary.main }
                : { color: COLORS.text.secondary, borderColor: COLORS.border.main }
            }
          >
            {role === "all" ? "Todos" : ROLE_LABELS[role]}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {([
          { label: "Total", value: stats.total, color: COLORS.primary.main, bg: COLORS.primary.lighter },
          { label: "Abiertos", value: stats.open, color: COLORS.warning.dark, bg: COLORS.warning.lighter },
          { label: "Respondidos", value: stats.answered, color: COLORS.info.dark, bg: COLORS.info.lighter },
          { label: "Cerrados", value: stats.closed, color: COLORS.text.tertiary, bg: COLORS.neutral[100] },
        ]).map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border p-5"
            style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: stat.bg }}>
                <MessageSquarePlus className="size-5" style={{ color: stat.color }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
                  {stat.value}
                </div>
                <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                  {stat.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin" style={{ color: COLORS.primary.main }} />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquarePlus className="size-12 mx-auto mb-3" style={{ color: COLORS.text.tertiary }} />
              <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                No hay feedbacks para estos filtros.
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: COLORS.border.light }}>
              {feedbacks.map((item) => {
                const statusConfig = STATUS_CONFIG[item.status];
                const profile = item.profiles?.[0] ?? null;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-4 py-4 transition-colors hover:bg-gray-50"
                    style={{
                      borderColor: COLORS.border.light,
                      backgroundColor: selected?.id === item.id ? COLORS.primary.lighter : "transparent",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                          {item.subject}
                        </h3>
                        <p className="text-xs mt-1" style={{ color: COLORS.text.secondary }}>
                          {ROLE_LABELS[item.role]} · {profile?.email ?? "Sin email"}
                        </p>
                        <p className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
                          {new Date(item.created_at).toLocaleDateString("es-VE")}
                        </p>
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
                      {item.message}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div
          className="rounded-xl border p-5 space-y-4"
          style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
        >
          {!selected ? (
            <div className="text-sm" style={{ color: COLORS.text.secondary }}>
              Selecciona un feedback para ver detalles.
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-lg font-bold" style={{ color: COLORS.text.primary }}>
                  Responder feedback
                </h2>
                <p className="text-xs mt-1" style={{ color: COLORS.text.secondary }}>
                  {selected.subject}
                </p>
              </div>

              <div className="space-y-2 text-sm" style={{ color: COLORS.text.secondary }}>
                <div>
                  <span className="font-semibold">Usuario:</span>{" "}
                  {(() => {
                    const profile = selected.profiles?.[0] ?? null;
                    return profile?.first_name || profile?.last_name
                      ? `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim()
                      : profile?.email ?? selected.user_id;
                  })()}
                </div>
                <div>
                  <span className="font-semibold">Rol:</span> {ROLE_LABELS[selected.role]}
                </div>
                <div>
                  <span className="font-semibold">Estado:</span> {STATUS_CONFIG[selected.status].label}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.text.tertiary }}>
                  Respuesta
                </label>
                <textarea
                  value={responseText}
                  onChange={(event) => setResponseText(event.target.value)}
                  placeholder="Escribe una respuesta para el usuario..."
                  className="mt-2 min-h-[140px] w-full rounded-xl border border-border bg-surface p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleRespond("answered")}
                  disabled={actionLoading}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  {actionLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 mr-2" />}
                  Responder
                </Button>
                <Button
                  onClick={() => handleRespond("closed")}
                  disabled={actionLoading}
                  variant="outline"
                  style={{ borderColor: COLORS.border.main, color: COLORS.text.secondary }}
                >
                  <XCircle className="size-4 mr-2" />
                  Cerrar
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
