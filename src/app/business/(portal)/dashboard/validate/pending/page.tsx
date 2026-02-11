"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { COLORS } from "@/config/colors";
import {
  ShoppingCart,
  Clock,
  AlertCircle,
  Search,
} from "lucide-react";
import { fetchMerchantPurchases } from "@/lib/services/orders/orders.service";
import { PurchaseWithDetails } from "@/config/types/orders";
import { OrderCard } from "@/components/orders/order-card";
import { Input } from "@/components/ui/input";

export default function PendingValidatePage() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<PurchaseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (profile?.id) {
      loadOrders();
    }
  }, [profile?.id]);

  const loadOrders = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const response = await fetchMerchantPurchases({
        merchantId: profile.id,
        status: ["pending_payment", "pending_validation"],
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

  const pendingPayment = orders.filter((o) => o.status === "pending_payment").length;
  const pendingValidation = orders.filter((o) => o.status === "pending_validation").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="size-5" style={{ color: COLORS.warning.main }} />
          <span className="text-sm font-semibold" style={{ color: COLORS.warning.main }}>
            Validación de Órdenes
          </span>
        </div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: COLORS.text.primary }}
        >
          Órdenes Pendientes
        </h1>
        <p
          className="mt-2 text-base"
          style={{ color: COLORS.text.secondary }}
        >
          Valida las órdenes de compra y genera cupones para tus clientes.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="flex items-center justify-center size-10 rounded-lg"
              style={{
                backgroundColor: COLORS.warning.lighter,
                color: COLORS.warning.main,
              }}
            >
              <Clock className="size-5" />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
                {pendingPayment}
              </div>
              <div className="text-sm" style={{ color: COLORS.text.secondary }}>
                Pago pendiente
              </div>
            </div>
          </div>
          <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
            Esperando comprobante del cliente
          </p>
        </div>

        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="flex items-center justify-center size-10 rounded-lg"
              style={{
                backgroundColor: COLORS.info.lighter,
                color: COLORS.info.main,
              }}
            >
              <AlertCircle className="size-5" />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
                {pendingValidation}
              </div>
              <div className="text-sm" style={{ color: COLORS.text.secondary }}>
                Por validar
              </div>
            </div>
          </div>
          <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
            Requieren tu aprobación
          </p>
        </div>
      </div>

      {/* Search */}
      <div
        className="rounded-xl border p-4"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
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
              {searchQuery ? "No se encontraron órdenes" : "No hay órdenes pendientes"}
            </h3>
            <p className="text-sm" style={{ color: COLORS.text.secondary }}>
              {searchQuery
                ? "Intenta con otro criterio de búsqueda"
                : "Todas las órdenes han sido procesadas"}
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
