"use client";

import { useState, useEffect } from "react";
import { Link2, Copy, ExternalLink, QrCode, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COLORS } from "@/config/colors";
import { getInfluencerAssignments, type AssignmentWithDetails } from "@/lib/services/influencer";
import { ToastService } from "@/lib/toast/toast.service";

interface ToolsTabProps {
  influencerId: string;
}

export function ToolsTab({ influencerId }: ToolsTabProps) {
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromii, setSelectedPromii] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadAssignments();
  }, [influencerId]);

  async function loadAssignments() {
    setLoading(true);
    const response = await getInfluencerAssignments(influencerId);

    if (response.status === "success" && response.data) {
      const activeAssignments = response.data.filter((a) => a.is_active);
      setAssignments(activeAssignments);
      if (activeAssignments.length > 0 && !selectedPromii) {
        setSelectedPromii(activeAssignments[0].id);
      }
    }

    setLoading(false);
  }

  function handleCopyLink(promiiId: string, referralCode: string) {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/p/${promiiId}?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    ToastService.showSuccessToast("Link copiado al portapapeles");
  }

  function handleCopyCode(code: string) {
    navigator.clipboard.writeText(code);
    ToastService.showSuccessToast("Código copiado");
  }

  function openQRGenerator(promiiId: string, referralCode: string) {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/p/${promiiId}?ref=${referralCode}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
    window.open(qrUrl, "_blank");
  }

  const filteredAssignments = assignments.filter((a) =>
    a.promii?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedAssignment = assignments.find((a) => a.id === selectedPromii);

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
            Herramientas
          </h1>
          <p className="text-base" style={{ color: COLORS.text.secondary }}>
            Genera y comparte tus links de referido
          </p>
        </div>
        <div className="text-center py-8" style={{ color: COLORS.text.secondary }}>
          Cargando...
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
            Herramientas
          </h1>
          <p className="text-base" style={{ color: COLORS.text.secondary }}>
            Genera y comparte tus links de referido
          </p>
        </div>
        <div
          className="rounded-xl border p-12 text-center"
          style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
        >
          <Link2 className="size-16 mx-auto mb-4" style={{ color: COLORS.text.tertiary }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
            No tienes promiis asignados
          </h3>
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            Cuando tengas promiis asignados, podrás generar links de referido aquí
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
          Herramientas
        </h1>
        <p className="text-base" style={{ color: COLORS.text.secondary }}>
          Genera y comparte tus links de referido
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Promii List */}
        <div
          className="lg:col-span-1 rounded-xl border p-4 space-y-3"
          style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
        >
          <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: COLORS.border.light }}>
            <Sparkles className="size-5" style={{ color: COLORS.primary.main }} />
            <h3 className="font-semibold" style={{ color: COLORS.text.primary }}>
              Mis Promiis
            </h3>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
              style={{ color: COLORS.text.tertiary }}
            />
            <Input
              type="text"
              placeholder="Buscar promii..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
              style={{
                backgroundColor: COLORS.background.secondary,
                borderColor: COLORS.border.light,
              }}
            />
          </div>

          {/* List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredAssignments.map((assignment) => (
              <button
                key={assignment.id}
                onClick={() => setSelectedPromii(assignment.id)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedPromii === assignment.id ? "shadow-sm" : ""
                }`}
                style={{
                  backgroundColor:
                    selectedPromii === assignment.id ? COLORS.primary.lighter : COLORS.background.secondary,
                  borderWidth: selectedPromii === assignment.id ? "2px" : "1px",
                  borderStyle: "solid",
                  borderColor: selectedPromii === assignment.id ? COLORS.primary.main : COLORS.border.light,
                }}
              >
                <div className="font-medium text-sm line-clamp-2 mb-1" style={{ color: COLORS.text.primary }}>
                  {assignment.promii?.title}
                </div>
                <div
                  className="text-xs font-mono px-2 py-0.5 rounded inline-block"
                  style={{
                    backgroundColor: COLORS.primary.lighter,
                    color: COLORS.primary.main,
                  }}
                >
                  {assignment.referral_code}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Link Generator */}
        <div className="lg:col-span-2 space-y-4">
          {selectedAssignment && (
            <>
              {/* Promii Info Card */}
              <div
                className="rounded-xl border p-6"
                style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
                      {selectedAssignment.promii?.title}
                    </h3>
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: COLORS.primary.lighter,
                          color: COLORS.primary.main,
                        }}
                      >
                        Código: {selectedAssignment.referral_code}
                      </span>
                      <Button
                        onClick={() => handleCopyCode(selectedAssignment.referral_code)}
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                      >
                        <Copy className="size-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      window.open(`/p/${selectedAssignment.promii_id}?ref=${selectedAssignment.referral_code}`, "_blank")
                    }
                    variant="outline"
                    size="sm"
                    style={{
                      borderColor: COLORS.border.main,
                      color: COLORS.text.secondary,
                    }}
                  >
                    <ExternalLink className="size-4 mr-2" />
                    Ver Promii
                  </Button>
                </div>

                {/* Commission Info */}
                {selectedAssignment.commission_type && selectedAssignment.commission_value && (
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: COLORS.success.lighter }}
                  >
                    <span className="text-sm font-medium" style={{ color: COLORS.success.dark }}>
                      💰 Comisión:{" "}
                      {selectedAssignment.commission_type === "percentage"
                        ? `${selectedAssignment.commission_value}%`
                        : `$${selectedAssignment.commission_value} fijo`}
                    </span>
                  </div>
                )}
              </div>

              {/* Link Generator */}
              <div
                className="rounded-xl border p-6 space-y-4"
                style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
              >
                <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: COLORS.border.light }}>
                  <Link2 className="size-5" style={{ color: COLORS.primary.main }} />
                  <h3 className="font-semibold" style={{ color: COLORS.text.primary }}>
                    Link de Referido
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>
                    Tu link único
                  </label>
                  <div className="flex gap-2">
                    <div
                      className="flex-1 px-4 py-3 rounded-lg border font-mono text-sm overflow-x-auto"
                      style={{
                        backgroundColor: COLORS.background.secondary,
                        borderColor: COLORS.border.light,
                        color: COLORS.text.primary,
                      }}
                    >
                      {`${window.location.origin}/p/${selectedAssignment.promii_id}?ref=${selectedAssignment.referral_code}`}
                    </div>
                    <Button
                      onClick={() => handleCopyLink(selectedAssignment.promii_id, selectedAssignment.referral_code)}
                      className="px-6"
                      style={{
                        backgroundColor: COLORS.primary.main,
                        color: COLORS.text.inverse,
                      }}
                    >
                      <Copy className="size-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>
                    Preview del link
                  </label>
                  <div
                    className="p-4 rounded-lg border"
                    style={{ backgroundColor: COLORS.background.secondary, borderColor: COLORS.border.light }}
                  >
                    <p className="text-sm mb-1" style={{ color: COLORS.text.secondary }}>
                      Al compartir este link:
                    </p>
                    <ul className="text-sm space-y-1" style={{ color: COLORS.text.primary }}>
                      <li>✅ Se trackean las visitas automáticamente</li>
                      <li>✅ Las compras se atribuyen a tu código</li>
                      <li>✅ Ganas comisión por cada venta</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* QR Code Generator */}
              <div
                className="rounded-xl border p-6 space-y-4"
                style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.border.light }}
              >
                <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: COLORS.border.light }}>
                  <QrCode className="size-5" style={{ color: COLORS.primary.main }} />
                  <h3 className="font-semibold" style={{ color: COLORS.text.primary }}>
                    Código QR
                  </h3>
                </div>

                <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                  Genera un código QR para compartir tu link de forma física (pósters, tarjetas, etc.)
                </p>

                <Button
                  onClick={() => openQRGenerator(selectedAssignment.promii_id, selectedAssignment.referral_code)}
                  variant="outline"
                  className="w-full"
                  style={{
                    borderColor: COLORS.border.main,
                    color: COLORS.text.primary,
                  }}
                >
                  <QrCode className="size-4 mr-2" />
                  Generar Código QR
                </Button>
              </div>

              {/* Tips */}
              <div
                className="rounded-lg border p-4"
                style={{ backgroundColor: COLORS.info.lighter, borderColor: COLORS.info.light }}
              >
                <h4 className="font-semibold text-sm mb-2" style={{ color: COLORS.info.dark }}>
                  💡 Tips para compartir tu link:
                </h4>
                <ul className="text-sm space-y-1" style={{ color: COLORS.info.dark }}>
                  <li>• Comparte en tus stories de Instagram/TikTok</li>
                  <li>• Agrega el link en tu bio</li>
                  <li>• Crea contenido mostrando el promii</li>
                  <li>• Usa el código QR en materiales impresos</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
