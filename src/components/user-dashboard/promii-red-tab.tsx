"use client";

import { useEffect, useState } from "react";
import { COLORS } from "@/config/colors";
import {
  Gift,
  Copy,
  Check,
  DollarSign,
  Users,
  TrendingUp,
  Store,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  getOrCreateReferralCode,
  getUserReferralStats,
  getMyReferrals,
  type ReferralStats,
  type ReferralWithMerchant,
} from "@/lib/services/referral/promii-red.service";
import { WhatsAppShareButton } from "@/components/ui/whatsapp-share-button";

interface PromiiRedTabProps {
  userId: string;
}

export function PromiiRedTab({ userId }: PromiiRedTabProps) {
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<ReferralWithMerchant[]>([]);

  useEffect(() => {
    loadData();
  }, [userId]);

  async function loadData() {
    setLoading(true);

    // 1. Obtener o crear código de referido
    const codeResponse = await getOrCreateReferralCode(userId);
    if (codeResponse.status === "success") {
      setReferralCode(codeResponse.data);
    }

    // 2. Obtener estadísticas
    const statsResponse = await getUserReferralStats(userId);
    if (statsResponse.status === "success") {
      setStats(statsResponse.data);
    }

    // 3. Obtener lista de referidos
    const referralsResponse = await getMyReferrals(userId);
    if (referralsResponse.status === "success") {
      setReferrals(referralsResponse.data);
    }

    setLoading(false);
  }

  async function handleCopy() {
    if (!referralCode) return;

    const baseUrl = window.location.origin;
    const referralLink = `${baseUrl}/business/apply?ref=${referralCode}`;

    await navigator.clipboard.writeText(referralLink);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  }

  const referralLink = referralCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/business/apply?ref=${referralCode}`
    : "";

  const whatsappMessage = `¡Hola! 👋\n\nTe invito a registrar tu negocio en Promii, la plataforma de promociones locales más grande de Venezuela.\n\nUsa mi código de referido: *${referralCode}*\nO regístrate directo aquí: ${referralLink}\n\n¡Atrae más clientes con promociones verificadas! 🚀`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin" style={{ color: COLORS.primary.main }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-2xl border p-8"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary.lighter} 0%, ${COLORS.background.primary} 100%)`,
          borderColor: COLORS.border.light,
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex size-14 items-center justify-center rounded-xl shrink-0"
            style={{ backgroundColor: COLORS.primary.main }}
          >
            <Gift className="size-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
              Promii Red
            </h2>
            <p className="mt-1 text-sm" style={{ color: COLORS.text.secondary }}>
              Refiere comercios y gana $5 por cada uno que se active + $5 de bono al 3er mes
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          className="rounded-xl border p-5"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS.info.lighter }}
            >
              <Users className="size-5" style={{ color: COLORS.info.main }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
                {stats?.total_referrals || 0}
              </div>
              <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                Total referidos
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl border p-5"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS.success.lighter }}
            >
              <CheckCircle className="size-5" style={{ color: COLORS.success.main }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
                {stats?.activated || 0}
              </div>
              <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                Activados (30d)
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl border p-5"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS.warning.lighter }}
            >
              <DollarSign className="size-5" style={{ color: COLORS.warning.main }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
                ${stats?.total_base_earned.toFixed(0) || 0}
              </div>
              <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                Ganado (base)
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl border p-5"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS.accent.lighter }}
            >
              <TrendingUp className="size-5" style={{ color: COLORS.accent.main }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
                ${stats?.total_earned.toFixed(0) || 0}
              </div>
              <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                Total ganado
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link Section */}
      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.text.primary }}>
          Tu código de referido
        </h3>

        <div className="space-y-4">
          {/* Código */}
          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: COLORS.text.secondary }}>
              Código
            </label>
            <div className="flex gap-2">
              <div
                className="flex-1 rounded-lg border px-4 py-3 font-mono text-lg font-bold text-center"
                style={{
                  backgroundColor: COLORS.primary.lighter,
                  borderColor: COLORS.primary.light,
                  color: COLORS.primary.main,
                }}
              >
                {referralCode || "Cargando..."}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 rounded-lg border px-4 py-3 font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: copied ? COLORS.success.lighter : COLORS.background.primary,
                  borderColor: copied ? COLORS.success.main : COLORS.border.main,
                  color: copied ? COLORS.success.main : COLORS.text.primary,
                }}
              >
                {copied ? (
                  <>
                    <Check className="size-5" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="size-5" />
                    Copiar link
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Link completo */}
          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: COLORS.text.secondary }}>
              Link de referido
            </label>
            <div
              className="rounded-lg border px-4 py-3 text-sm font-mono overflow-x-auto"
              style={{
                backgroundColor: COLORS.background.secondary,
                borderColor: COLORS.border.light,
                color: COLORS.text.secondary,
              }}
            >
              {referralLink}
            </div>
          </div>

          {/* Compartir por WhatsApp */}
          <div className="flex justify-center pt-2">
            <WhatsAppShareButton
              message={whatsappMessage}
              variant="hero"
            />
          </div>
        </div>
      </div>

      {/* Referrals List */}
      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.text.primary }}>
          Tus referidos ({referrals.length})
        </h3>

        {referrals.length === 0 ? (
          <div className="text-center py-8">
            <Store className="size-12 mx-auto mb-3" style={{ color: COLORS.text.tertiary }} />
            <p className="text-sm" style={{ color: COLORS.text.secondary }}>
              Aún no has referido ningún comercio
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
              Comparte tu código con negocios locales
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((referral) => {
              const statusConfig = {
                registered: { label: "Registrado", color: COLORS.info.main, bg: COLORS.info.lighter },
                approved: { label: "Aprobado", color: COLORS.primary.main, bg: COLORS.primary.lighter },
                activated: { label: "Activado (30d)", color: COLORS.success.main, bg: COLORS.success.lighter },
                bonus_eligible: { label: "Bono elegible (90d)", color: COLORS.warning.main, bg: COLORS.warning.lighter },
                paid: { label: "Pagado", color: COLORS.accent.main, bg: COLORS.accent.lighter },
              };

              const config = statusConfig[referral.status] || statusConfig.registered;

              return (
                <div
                  key={referral.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                  style={{ borderColor: COLORS.border.light }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-10 items-center justify-center rounded-lg shrink-0"
                      style={{ backgroundColor: config.bg }}
                    >
                      <Store className="size-5" style={{ color: config.color }} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: COLORS.text.primary }}>
                        {referral.merchant?.business_name || "Comercio"}
                      </div>
                      <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                        Referido el {new Date(referral.registered_at).toLocaleDateString("es-VE")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status badge */}
                    <div
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ backgroundColor: config.bg, color: config.color }}
                    >
                      {config.label}
                    </div>

                    {/* Earnings */}
                    {referral.base_paid_at && (
                      <div className="text-right">
                        <div className="text-sm font-bold" style={{ color: COLORS.success.main }}>
                          +${referral.base_reward.toFixed(0)}
                        </div>
                        {referral.bonus_paid_at && (
                          <div className="text-xs" style={{ color: COLORS.accent.main }}>
                            +${referral.bonus_reward.toFixed(0)} bono
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* How it works */}
      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: COLORS.primary.lighter + "30",
          borderColor: COLORS.primary.light + "50",
        }}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.text.primary }}>
          ¿Cómo funciona?
        </h3>
        <div className="space-y-3">
          {[
            { icon: Gift, text: "Comparte tu código con comercios locales que quieras invitar" },
            { icon: Store, text: "El comercio se registra con tu código en Promii" },
            { icon: CheckCircle, text: "Cuando el comercio esté activo 30 días, ganas $5" },
            { icon: TrendingUp, text: "Si el comercio sigue activo 90 días, ganas $5 adicionales de bono" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div
                className="flex size-8 items-center justify-center rounded-lg shrink-0"
                style={{ backgroundColor: COLORS.primary.lighter }}
              >
                <item.icon className="size-4" style={{ color: COLORS.primary.main }} />
              </div>
              <p className="text-sm pt-1" style={{ color: COLORS.text.secondary }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
