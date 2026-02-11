"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { COLORS } from "@/config/colors";
import {
  CheckCircle,
  XCircle,
  Ticket,
  Search,
  ClipboardCheck,
} from "lucide-react";
import { fetchMerchantPurchases } from "@/lib/services/orders/orders.service";
import { PurchaseWithDetails, PurchaseStatus } from "@/config/types/orders";
import { OrderCard } from "@/components/orders/order-card";
import { Input } from "@/components/ui/input";

const STATUS_FILTERS = [
  { value: "all", label: "Todas", icon: ClipboardCheck, color: COLORS.text.primary },
  { value: "approved", label: "Aprobadas", icon: CheckCircle, color: COLORS.success.main },
  { value: "rejected", label: "Rechazadas", icon: XCircle, color: COLORS.error.main },
  { value: "redeemed", label: "Canjeadas", icon: Ticket, color: COLORS.primary.main },
];

export default function ValidatedPage() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<PurchaseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (profile?.id) {
      loadOrders();
    }
  }, [profile?.id, selectedStatus]);

  const loadOrders = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const statusFilter = selectedStatus === "all"
        ? ["approved", "rejected", "redeemed", "cancelled"] as PurchaseStatus[]
        : [selectedStatus as PurchaseStatus];

      const response = await fetchMerchantPurchases({
        merchantId: profile.id,
        status: statusFilter,
        page: 1,
        pageSize: 100,
      });

      if (response.status === "success") {
        setOrders(response.data?.purchases || []);
      } else {
        console.error("Error loading orders:", response.error);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.promii_snapshot_title.toLowerCase().includes(query) ||
      order.user_email?.toLowerCase().includes(query) ||
      order.user_name?.toLowerCase().includes(query) ||
      order.coupon_code?.toLowerCase().includes(query)
    );
  });

  const stats = {
    approved: orders.filter((o) => o.status === "approved").length,
    rejected: orders.filter((o) => o.status === "rejected").length,
    redeemed: orders.filter((o) => o.status === "redeemed").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <ClipboardCheck className="size-5" style={{ color: COLORS.success.main }} />
          <span className="text-sm font-semibold" style={{ color: COLORS.success.main }}>
            Historial
          </span>
        </div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: COLORS.text.primary }}
        >
          Órdenes Validadas
        </h1>
        <p
          className="mt-2 text-base"
          style={{ color: COLORS.text.secondary }}
        >
          Historial completo de órdenes aprobadas, rechazadas y canjeadas.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="text-2xl font-bold mb-1" style={{ color: COLORS.success.main }}>
            {stats.approved}
          </div>
          <div className="text-sm" style={{ color: COLORS.text.secondary }}>
            Aprobadas
          </div>
        </div>

        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="text-2xl font-bold mb-1" style={{ color: COLORS.primary.main }}>
            {stats.redeemed}
          </div>
          <div className="text-sm" style={{ color: COLORS.text.secondary }}>
            Canjeadas
          </div>
        </div>

        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="text-2xl font-bold mb-1" style={{ color: COLORS.error.main }}>
            {stats.rejected}
          </div>
          <div className="text-sm" style={{ color: COLORS.text.secondary }}>
            Rechazadas
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        <div className="space-y-4">
          {/* Status filters */}
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => {
              const Icon = filter.icon;
              const isSelected = selectedStatus === filter.value;

              return (
                <button
                  key={filter.value}
                  onClick={() => setSelectedStatus(filter.value)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: isSelected ? filter.color : COLORS.background.secondary,
                    color: isSelected ? COLORS.text.inverse : COLORS.text.secondary,
                    border: `1px solid ${isSelected ? filter.color : COLORS.border.light}`,
                  }}
                >
                  <Icon className="size-4" />
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
              style={{ color: COLORS.text.tertiary }}
            />
            <Input
              type="text"
              placeholder="Buscar por cliente, promii o cupón..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-11"
              style={{
                backgroundColor: COLORS.background.tertiary,
                borderColor: COLORS.border.main,
              }}
            />
          </div>
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        {loading ? (
          <div
            className="rounded-xl border p-12 text-center"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <div className="text-sm" style={{ color: COLORS.text.secondary }}>
              Cargando historial...
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div
            className="rounded-xl border p-12 text-center"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <ClipboardCheck className="size-12 mx-auto mb-4" style={{ color: COLORS.text.tertiary }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
              {searchQuery ? "No se encontraron órdenes" : "No hay órdenes validadas"}
            </h3>
            <p className="text-sm" style={{ color: COLORS.text.secondary }}>
              {searchQuery
                ? "Intenta con otro criterio de búsqueda"
                : "Las órdenes aprobadas o rechazadas aparecerán aquí"}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} onUpdate={loadOrders} />
          ))
        )}
      </div>
    </div>
  );
}
