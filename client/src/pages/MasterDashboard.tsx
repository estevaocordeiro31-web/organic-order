import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RESTAURANT_THEMES: Record<string, { bg: string; accent: string; icon: string }> = {
  organic: { bg: "from-green-900/40 to-green-800/20", accent: "#4ade80", icon: "🌿" },
  topdog: { bg: "from-red-900/40 to-red-800/20", accent: "#ef4444", icon: "🌭" },
  laguapa: { bg: "from-amber-900/40 to-amber-800/20", accent: "#f59e0b", icon: "🥟" },
  elpatron: { bg: "from-orange-900/40 to-orange-800/20", accent: "#f97316", icon: "🌮" },
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  preparing: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  ready: "bg-green-500/20 text-green-300 border-green-500/30",
  delivered: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando", preparing: "Preparando", ready: "Pronto",
  delivered: "Entregue", cancelled: "Cancelado",
};

function useMasterAuth() {
  const [, navigate] = useLocation();
  const token = localStorage.getItem("partner_token");
  const user = JSON.parse(localStorage.getItem("partner_user") || "null");

  useEffect(() => {
    if (!token || !user) navigate("/partner/login");
    else if (user?.role !== "master") navigate("/partner/dashboard");
  }, [token, user]);

  return { token, user };
}

export default function MasterDashboard() {
  const [, navigate] = useLocation();
  const { token, user } = useMasterAuth();
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const utils = trpc.useUtils();

  const overviewQuery = trpc.master.overview.useQuery(undefined, {
    enabled: !!token,
    refetchInterval: 30000,
    meta: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  });

  const allOrdersQuery = trpc.master.allOrders.useQuery(
    {
      restaurantId: selectedRestaurant !== "all" ? parseInt(selectedRestaurant) : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
    },
    {
      enabled: !!token,
      refetchInterval: 15000,
      meta: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    }
  );

  const handleLogout = () => {
    localStorage.removeItem("partner_token");
    localStorage.removeItem("partner_user");
    localStorage.removeItem("partner_restaurant");
    navigate("/partner/login");
  };

  const restaurants = overviewQuery.data || [];
  const orders = allOrdersQuery.data || [];

  const totalStats = restaurants.reduce(
    (acc: any, r: any) => ({
      total: acc.total + (r.stats?.total || 0),
      pending: acc.pending + (r.stats?.pending || 0),
      preparing: acc.preparing + (r.stats?.preparing || 0),
      ready: acc.ready + (r.stats?.ready || 0),
      revenue: acc.revenue + (r.stats?.revenue || 0),
    }),
    { total: 0, pending: 0, preparing: 0, ready: 0, revenue: 0 }
  );

  if (!token || !user) return null;

  return (
    <div className="min-h-screen bg-[#080812] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-xs font-bold">M</span>
            </div>
            <div>
              <h1 className="font-bold text-white text-sm">ImAInd Master</h1>
              <p className="text-xs text-gray-400">Visão geral de todos os parceiros</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">👋 {user?.displayName}</span>
            <Button
              variant="ghost" size="sm" onClick={handleLogout}
              className="text-gray-400 hover:text-white hover:bg-white/10 text-xs"
            >Sair</Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Global stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total Hoje", value: totalStats.total, color: "text-white" },
            { label: "Aguardando", value: totalStats.pending, color: "text-yellow-400" },
            { label: "Preparando", value: totalStats.preparing, color: "text-blue-400" },
            { label: "Prontos", value: totalStats.ready, color: "text-green-400" },
            { label: "Receita Total", value: `R$ ${totalStats.revenue.toFixed(2)}`, color: "text-emerald-400" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-white/5 border-white/10">
              <CardContent className="p-3 text-center">
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Restaurant cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {restaurants.map((r: any) => {
            const theme = RESTAURANT_THEMES[r.slug] || { bg: "from-gray-900/40 to-gray-800/20", accent: "#fff", icon: "🍽️" };
            return (
              <Card
                key={r.id}
                className={`bg-gradient-to-br ${theme.bg} border-white/10 cursor-pointer hover:border-white/30 transition-all`}
                onClick={() => setSelectedRestaurant(selectedRestaurant === String(r.id) ? "all" : String(r.id))}
                style={{ borderColor: selectedRestaurant === String(r.id) ? theme.accent : undefined }}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{theme.icon}</span>
                    <p className="text-white text-xs font-semibold leading-tight">{r.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div>
                      <p className="text-gray-400">Pedidos</p>
                      <p className="text-white font-bold">{r.stats?.total || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Receita</p>
                      <p style={{ color: theme.accent }} className="font-bold">R$ {(r.stats?.revenue || 0).toFixed(0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Orders table */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-white font-semibold text-sm">
              Pedidos {selectedRestaurant !== "all" ? `— ${restaurants.find((r: any) => String(r.id) === selectedRestaurant)?.name || ""}` : "— Todos os restaurantes"}
            </h2>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white text-xs h-7">
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
            variant="ghost" size="sm"
            onClick={() => { utils.master.overview.invalidate(); utils.master.allOrders.invalidate(); }}
            className="text-gray-400 hover:text-white text-xs"
          >↻ Atualizar</Button>
        </div>

        {allOrdersQuery.isLoading ? (
          <div className="text-center py-12 text-gray-400">Carregando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">🍽️</div>
            <p className="text-gray-400 text-sm">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">#</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Restaurante</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Aluno</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Mesa</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Total</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Status</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Pagamento</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Horário</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => {
                  const restaurant = restaurants.find((r: any) => r.id === order.restaurantId);
                  const theme = RESTAURANT_THEMES[restaurant?.slug || ""] || { accent: "#fff", icon: "🍽️" };
                  return (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-gray-300 text-xs">#{order.id}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs">{theme.icon} {restaurant?.name || `R${order.restaurantId}`}</span>
                      </td>
                      <td className="px-4 py-3 text-white text-xs font-medium">{order.studentName}</td>
                      <td className="px-4 py-3 text-gray-300 text-xs">{order.table?.label || `Mesa ${order.tableId}`}</td>
                      <td className="px-4 py-3 text-white text-xs font-bold">R$ {parseFloat(order.totalAmount).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status] || ""}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs ${
                          order.paymentStatus === "paid" ? "text-green-400" :
                          order.paymentStatus === "pending_verification" ? "text-yellow-400" :
                          "text-gray-500"
                        }`}>
                          {order.paymentStatus === "paid" ? "✅ Pago" :
                           order.paymentStatus === "pending_verification" ? "⏳ Aguardando" :
                           "Não pago"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(order.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
