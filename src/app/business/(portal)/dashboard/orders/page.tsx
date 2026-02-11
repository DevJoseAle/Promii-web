"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { COLORS } from "@/config/colors";
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
} from "lucide-react";
import { fetchMerchantPurchases } from "@/lib/services/orders/orders.service";
import { PurchaseWithDetails, PurchaseStatus } from "@/config/types/orders";
import { OrderCard } from "@/components/orders/order-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STATUS_FILTERS = [
  { value: "all", label: "Todas", icon: ShoppingCart, color: COLORS.text.primary },
  { value: "pending_payment", label: "Pago pendiente", icon: Clock, color: COLORS.warning.main },
  { value: "pending_validation", label: "Por validar", icon: Clock, color: COLORS.info.main },
  { value: "approved", label: "Aprobadas", icon: CheckCircle, color: COLORS.success.main },
  { value: "rejected", label: "Rechazadas", icon: XCircle, color: COLORS.error.main },
];

export default function OrdersPage() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<PurchaseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (profile?.id) {
      loadOrders();
    }
  }, [profile?.id, selectedStatus]);

  const loadOrders = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const status = selectedStatus === "all" ? undefined : (selectedStatus as PurchaseStatus);
      const response = await fetchMerchantPurchases({
        merchantId: profile.id,
        status: status,
        page: 1,
        pageSize: 50,
      });

      if (response.status === "success") {
        setOrders(response.data?.purchases || []);
        setTotal(response.data?.total || 0);
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
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending_validation").length,
    approved: orders.filter((o) => o.status === "approved").length,
    rejected: orders.filter((o) => o.status === "rejected").length,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background.secondary }}>
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="size-5" style={{ color: COLORS.primary.main }} />
            <span className="text-sm font-semibold" style={{ color: COLORS.primary.main }}>
              Gestión de Órdenes
            </span>
          </div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: COLORS.text.primary }}
          >
            Órdenes de Compra
          </h1>
          <p
            className="mt-2 text-base"
            style={{ color: COLORS.text.secondary }}
          >
            Gestiona las órdenes de tus promiis. Valida pagos y genera cupones.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div
            className="rounded-xl border p-6"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <div className="text-2xl font-bold mb-1" style={{ color: COLORS.text.primary }}>
              {stats.total}
            </div>
            <div className="text-sm" style={{ color: COLORS.text.secondary }}>
              Total de órdenes
            </div>
          </div>

          <div
            className="rounded-xl border p-6"
            style={{
              backgroundColor: COLORS.background.primary,
              borderColor: COLORS.border.light,
            }}
          >
            <div className="text-2xl font-bold mb-1" style={{ color: COLORS.info.main }}>
              {stats.pending}
            </div>
            <div className="text-sm" style={{ color: COLORS.text.secondary }}>
              Por validar
            </div>
          </div>

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
          <div className="flex items-center gap-2 mb-4">
            <Filter className="size-5" style={{ color: COLORS.primary.main }} />
            <span className="font-semibold" style={{ color: COLORS.text.primary }}>
              Filtros
            </span>
          </div>

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
            <div className="text-center py-12">
              <div className="text-sm" style={{ color: COLORS.text.secondary }}>
                Cargando órdenes...
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
              <ShoppingCart className="size-12 mx-auto mb-4" style={{ color: COLORS.text.tertiary }} />
              <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
                No hay órdenes
              </h3>
              <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                {searchQuery ? "No se encontraron órdenes con ese criterio de búsqueda" : "Aún no tienes órdenes de compra"}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} onUpdate={loadOrders} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
