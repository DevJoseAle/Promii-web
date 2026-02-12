"use client";

import { useState, useEffect } from "react";
import { Sparkles, Copy, Eye, ShoppingCart, TrendingUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/config/colors";
import { getInfluencerAssignmentPerformance, type AssignmentPerformance } from "@/lib/services/influencer";
import { ToastService } from "@/lib/services/toast.service";

interface MyPromiisTabProps {
  influencerId: string;
}

export function MyPromiisTab({ influencerId }: MyPromiisTabProps) {
  const [assignments, setAssignments] = useState<AssignmentPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, [influencerId]);

  async function loadAssignments() {
    setLoading(true);
    const response = await getInfluencerAssignmentPerformance(influencerId);

    if (response.status === "success") {
      setAssignments(response.data || []);
    }

    setLoading(false);
  }

  function handleCopyCode(code: string) {
    navigator.clipboard.writeText(code);
    ToastService.showSuccessToast("Código copiado");
  }

  function handleCopyLink(promiiId: string, referralCode: string) {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/p/${promiiId}?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    ToastService.showSuccessToast("Link copiado al portapapeles");
  }

  if (loading) {
    return <div className="text-center py-8" style={{ color: COLORS.text.secondary }}>Cargando...</div>;
  }

  if (assignments.length === 0) {
    return (
      <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}>
        <Sparkles className="size-16 mx-auto mb-4" style={{ color: COLORS.text.tertiary }} />
        <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
          No tienes promiis asignados
        </h3>
        <p className="text-sm" style={{ color: COLORS.text.secondary }}>
          Cuando una marca te asigne un promii para promocionar, aparecerá aquí con tu código único
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: COLORS.text.secondary }}>
          {assignments.length} promii{assignments.length !== 1 ? "s" : ""} asignado{assignments.length !== 1 ? "s" : ""}
        </p>
        <div
          className="text-xs px-3 py-1.5 rounded-full font-medium"
          style={{
            backgroundColor: COLORS.info.lighter,
            color: COLORS.info.dark,
          }}
        >
          💡 Tip: Comparte el link con tu código en redes sociales
        </div>
      </div>

      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div
            key={assignment.assignment_id}
            className="rounded-lg border p-5"
            style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-base mb-2" style={{ color: COLORS.text.primary }}>
                  {assignment.promii_title}
                </h3>

                {/* Referral Code */}
                <div className="flex items-center gap-2 mb-3">
                  <code
                    className="px-3 py-1.5 rounded font-mono text-sm font-bold"
                    style={{
                      backgroundColor: COLORS.primary.lighter,
                      color: COLORS.primary.main,
                    }}
                  >
                    {assignment.referral_code}
                  </code>
                  <Button
                    onClick={() => handleCopyCode(assignment.referral_code)}
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    style={{
                      borderColor: COLORS.border.main,
                      color: COLORS.text.secondary,
                    }}
                  >
                    <Copy className="size-3" />
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCopyLink(assignment.promii_id, assignment.referral_code)}
                    size="sm"
                    className="h-8"
                    style={{
                      backgroundColor: COLORS.primary.main,
                      color: COLORS.text.inverse,
                    }}
                  >
                    <Copy className="size-3 mr-1.5" />
                    Copiar link
                  </Button>

                  <Button
                    onClick={() => window.open(`/p/${assignment.promii_id}?ref=${assignment.referral_code}`, "_blank")}
                    variant="outline"
                    size="sm"
                    className="h-8"
                    style={{
                      borderColor: COLORS.border.main,
                      color: COLORS.text.primary,
                    }}
                  >
                    <ExternalLink className="size-3 mr-1.5" />
                    Ver promii
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t" style={{ borderColor: COLORS.border.light }}>
              {/* Visits */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Eye className="size-4" style={{ color: COLORS.warning.main }} />
                  <span className="text-xs font-medium" style={{ color: COLORS.text.secondary }}>
                    Visitas
                  </span>
                </div>
                <div className="text-xl font-bold" style={{ color: COLORS.text.primary }}>
                  {assignment.total_visits}
                </div>
              </div>

              {/* Conversions */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <ShoppingCart className="size-4" style={{ color: COLORS.success.main }} />
                  <span className="text-xs font-medium" style={{ color: COLORS.text.secondary }}>
                    Ventas
                  </span>
                </div>
                <div className="text-xl font-bold" style={{ color: COLORS.text.primary }}>
                  {assignment.total_conversions}
                </div>
              </div>

              {/* Conversion Rate */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="size-4" style={{ color: COLORS.primary.main }} />
                  <span className="text-xs font-medium" style={{ color: COLORS.text.secondary }}>
                    Conversión
                  </span>
                </div>
                <div className="text-xl font-bold" style={{ color: COLORS.text.primary }}>
                  {assignment.conversion_rate.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Revenue */}
            {assignment.total_revenue > 0 && (
              <div
                className="mt-3 p-3 rounded-lg"
                style={{
                  backgroundColor: COLORS.success.lighter,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: COLORS.success.dark }}>
                    Revenue generado
                  </span>
                  <span className="text-lg font-bold" style={{ color: COLORS.success.dark }}>
                    ${assignment.total_revenue.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
