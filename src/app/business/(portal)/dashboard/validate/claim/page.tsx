"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { COLORS } from "@/config/colors";
import {
  Ticket,
  Search,
  Gift,
} from "lucide-react";
import { fetchMerchantPurchases } from "@/lib/services/orders/orders.service";
import { PurchaseWithDetails } from "@/config/types/orders";
import { Input } from "@/components/ui/input";
import { ClaimOrderCard } from "@/components/orders/claim-order-card";

export default function ClaimPage() {
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
        status: "approved",
        page: 1,
        pageSize: 100,
      });

      if (response.status === "success") {
        setOrders(response.data?.purchases || []);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Ticket className="size-5" style={{ color: COLORS.primary.main }} />
          <span className="text-sm font-semibold" style={{ color: COLORS.primary.main }}>
            Cupones Generados
          </span>
        </div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: COLORS.text.primary }}
        >
          Por Reclamar
        </h1>
        <p
          className="mt-2 text-base"
          style={{ color: COLORS.text.secondary }}
        >
          Cupones aprobados listos para canjear. Marca como canjeados cuando los clientes los usen.
        </p>
      </div>

      {/* Stats */}
      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: COLORS.background.primary,
          borderColor: COLORS.border.light,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center size-12 rounded-xl"
            style={{
              backgroundColor: COLORS.primary.lighter,
              color: COLORS.primary.main,
            }}
          >
            <Gift className="size-6" />
          </div>
          <div>
            <div className="text-3xl font-bold mb-1" style={{ color: COLORS.text.primary }}>
              {orders.length}
            </div>
            <div className="text-sm" style={{ color: COLORS.text.secondary }}>
              Cupones activos por canjear
            </div>
          </div>
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
            placeholder="Buscar por cliente, promii o código de cupón..."
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
              Cargando cupones...
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
            <Ticket className="size-12 mx-auto mb-4" style={{ color: COLORS.text.tertiary }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
              {searchQuery ? "No se encontraron cupones" : "No hay cupones por canjear"}
            </h3>
            <p className="text-sm" style={{ color: COLORS.text.secondary }}>
              {searchQuery
                ? "Intenta con otro criterio de búsqueda"
                : "Todos los cupones han sido canjeados o aún no hay órdenes aprobadas"}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <ClaimOrderCard key={order.id} order={order} onUpdate={loadOrders} />
          ))
        )}
      </div>
    </div>
  );
}
