"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { COLORS } from "@/config/colors";
import { Shield, Store, Users, Sparkles, Gift } from "lucide-react";

export default function AdminDashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.text.primary }}>
          Panel Administrativo
        </h1>
        <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
          Bienvenido, {profile?.first_name || "Administrador"}
        </p>
      </div>

      {/* Welcome Card */}
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
            <Shield className="size-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
              ¡Todo listo!
            </h2>
            <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
              El panel administrativo está configurado. Usa el menú lateral para navegar a las diferentes secciones.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Merchants",
            description: "Aprobar solicitudes",
            icon: Store,
            href: "/admin/merchants",
            color: COLORS.success.main,
            bgColor: COLORS.success.lighter,
          },
          {
            title: "Influencers",
            description: "Gestionar influencers",
            icon: Users,
            href: "/admin/influencers",
            color: COLORS.info.main,
            bgColor: COLORS.info.lighter,
          },
          {
            title: "Promiis",
            description: "Moderar contenido",
            icon: Sparkles,
            href: "/admin/promiis",
            color: COLORS.warning.main,
            bgColor: COLORS.warning.lighter,
          },
          {
            title: "Promii Red",
            description: "Gestionar referrals",
            icon: Gift,
            href: "/admin/promii-red",
            color: COLORS.accent.main,
            bgColor: COLORS.accent.lighter,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className="group rounded-xl border p-6 transition-all duration-200 hover:shadow-lg"
              style={{
                backgroundColor: COLORS.background.primary,
                borderColor: COLORS.border.light,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="flex size-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: item.bgColor }}
                >
                  <Icon className="size-5" style={{ color: item.color }} />
                </div>
              </div>
              <h3 className="font-semibold mb-1" style={{ color: COLORS.text.primary }}>
                {item.title}
              </h3>
              <p className="text-xs" style={{ color: COLORS.text.secondary }}>
                {item.description}
              </p>
              <div className="mt-4 text-xs font-semibold group-hover:underline" style={{ color: item.color }}>
                Ver sección →
              </div>
            </a>
          );
        })}
      </div>

      {/* Info Box */}
      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: COLORS.info.lighter + "30",
          borderColor: COLORS.info.light + "50",
        }}
      >
        <h3 className="text-sm font-bold mb-2" style={{ color: COLORS.text.primary }}>
          📋 Próximos pasos
        </h3>
        <ul className="text-sm space-y-1" style={{ color: COLORS.text.secondary }}>
          <li>• ETAPA 2: Gestión de Merchants (lista + aprobar/rechazar)</li>
          <li>• ETAPA 3: Gestión de Influencers</li>
          <li>• ETAPA 4: Moderación de Promiis</li>
          <li>• ETAPA 5: Promii Red (cambiar status + marcar pagos)</li>
          <li>• ETAPA 6: Sistema de documentación (comprobantes/docs)</li>
        </ul>
      </div>
    </div>
  );
}
