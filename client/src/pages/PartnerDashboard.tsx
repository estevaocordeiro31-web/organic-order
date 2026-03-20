import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConsultantsManager } from "@/components/ConsultantsManager";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  preparing: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  ready: "bg-green-500/20 text-green-300 border-green-500/30",
  delivered: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando",
  preparing: "Preparando",
  ready: "Pronto",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const STATUS_NEXT: Record<string, string> = {
  pending: "preparing",
  preparing: "ready",
  ready: "delivered",
};

type Tab = "orders" | "consultants";

function usePartnerAuth() {
  const [, navigate] = useLocation();
  const token = localStorage.getItem("partner_token");
  const user = JSON.parse(localStorage.getItem("partner_user") || "null");
  const restaurant = JSON.parse(localStorage.getItem("partner_restaurant") || "null");

  useEffect(() => {
    if (!token || !user) navigate("/partner/login");
  }, [token, user]);

  return { token, user, restaurant };
}

export default function PartnerDashboard() {
  const [, navigate] = useLocation();
  const { token, user, restaurant } = usePartnerAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  const utils = trpc.useUtils();

  const ordersQuery = trpc.partner.orders.useQuery(
    { status: statusFilter === "all" ? undefined : statusFilter },
    {
      enabled: !!token,
      refetchInterval: 15000,
      meta: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    }
  );

  const statsQuery = trpc.partner.stats.useQuery(undefined, {
    enabled: !!token,
    refetchInterval: 30000,
    meta: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  });

  const updateStatusMutation = trpc.partner.updateOrderStatus.useMutation({
    onSuccess: () => {
      utils.partner.orders.invalidate();
      utils.partner.stats.invalidate();
    },
    meta: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  });

  const handleLogout = () => {
    localStorage.removeItem("partner_token");
    localStorage.removeItem("partner_user");
    localStorage.removeItem("partner_restaurant");
    navigate("/partner/login");
  };

  const stats = statsQuery.data;
  const orders = ordersQuery.data || [];
  const themeColor = restaurant?.themeColor || "#1a2e1a";
  const accentColor = restaurant?.accentColor || "#4ade80";

  if (!token || !user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: themeColor }}
            >
              {restaurant?.name?.[0] || "R"}
            </div>
            <div>
              <h1 className="font-bold text-white text-sm leading-tight">{restaurant?.name || "Dashboard"}</h1>
              <p className="text-xs text-gray-400">Painel de Gestão</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">
              {user?.displayName}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/partner/qrcodes")}
              className="text-gray-400 hover:text-white hover:bg-white/10 text-xs"
            >
              📱 QR Codes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-400 hover:text-white hover:bg-white/10 text-xs"
            >
              Sair
            </Button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 pb-0">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "orders"
                ? "border-blue-400 text-blue-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            🍽️ Pedidos
          </button>
          <button
            onClick={() => setActiveTab("consultants")}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "consultants"
                ? "border-blue-400 text-blue-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            👥 Consultores
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ===== TAB: ORDERS ===== */}
        {activeTab === "orders" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {[
                { label: "Total Hoje", value: stats?.total ?? 0, color: "text-white" },
                { label: "Aguardando", value: stats?.pending ?? 0, color: "text-yellow-400" },
                { label: "Preparando", value: stats?.preparing ?? 0, color: "text-blue-400" },
                { label: "Prontos", value: stats?.ready ?? 0, color: "text-green-400" },
                { label: "Receita", value: `R$ ${(stats?.revenue ?? 0).toFixed(2)}`, color: "text-emerald-400" },
              ].map((stat) => (
                <Card key={stat.label} className="bg-white/5 border-white/10">
                  <CardContent className="p-3 text-center">
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filter + Refresh */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-white font-semibold">Pedidos</h2>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/20">
                    <SelectItem value="all" className="text-white text-xs">Todos</SelectItem>
                    <SelectItem value="pending" className="text-white text-xs">Aguardando</SelectItem>
                    <SelectItem value="preparing" className="text-white text-xs">Preparando</SelectItem>
                    <SelectItem value="ready" className="text-white text-xs">Prontos</SelectItem>
                    <SelectItem value="delivered" className="text-white text-xs">Entregues</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => utils.partner.orders.invalidate()}
                className="text-gray-400 hover:text-white text-xs"
              >
                ↻ Atualizar
              </Button>
            </div>

            {/* Orders */}
            {ordersQuery.isLoading ? (
              <div className="text-center py-16 text-gray-400">Carregando pedidos...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">🍽️</div>
                <p className="text-gray-400">Nenhum pedido encontrado</p>
                <p className="text-gray-600 text-sm mt-1">Os pedidos aparecerão aqui em tempo real</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map((order: any) => (
                  <Card key={order.id} className="bg-white/5 border-white/10 hover:border-white/20 transition-all">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-semibold text-sm">#{order.id} — {order.studentName}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{order.table?.label || `Mesa ${order.tableId}`}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status] || ""}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      {/* Items */}
                      <div className="space-y-1 mb-3">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-xs text-gray-300">
                            <span>{item.quantity}x {item.namePt || item.nameEn}</span>
                            <span className="text-gray-400">R$ {(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Total + Payment */}
                      <div className="flex items-center justify-between border-t border-white/10 pt-2 mb-3">
                        <span className="text-xs text-gray-400">Total</span>
                        <span className="text-white font-bold text-sm">R$ {parseFloat(order.totalAmount).toFixed(2)}</span>
                      </div>

                      {/* Payment status */}
                      {order.paymentStatus !== "unpaid" && (
                        <div className="mb-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            order.paymentStatus === "paid" ? "bg-green-500/20 text-green-300 border-green-500/30" :
                            order.paymentStatus === "pending_verification" ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" :
                            "bg-gray-500/20 text-gray-300 border-gray-500/30"
                          }`}>
                            {order.paymentStatus === "paid" ? "✅ Pago" :
                             order.paymentStatus === "pending_verification" ? "⏳ Comprovante enviado" :
                             order.paymentStatus}
                          </span>
                          {order.paymentProofUrl && (
                            <a
                              href={order.paymentProofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-xs text-blue-400 hover:text-blue-300 underline"
                            >
                              Ver comprovante
                            </a>
                          )}
                        </div>
                      )}

                      {/* Action button */}
                      {STATUS_NEXT[order.status] && (
                        <Button
                          size="sm"
                          className="w-full text-xs font-semibold"
                          style={{ backgroundColor: accentColor, color: "#000" }}
                          onClick={() => updateStatusMutation.mutate({
                            orderId: order.id,
                            status: STATUS_NEXT[order.status] as any,
                          })}
                          disabled={updateStatusMutation.isPending}
                        >
                          {order.status === "pending" ? "▶ Iniciar preparo" :
                           order.status === "preparing" ? "✓ Marcar como pronto" :
                           order.status === "ready" ? "🚀 Marcar como entregue" : ""}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== TAB: CONSULTANTS ===== */}
        {activeTab === "consultants" && token && (
          <ConsultantsManager token={token} />
        )}
      </div>
    </div>
  );
}
