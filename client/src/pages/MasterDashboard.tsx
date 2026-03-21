import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RESTAURANT_THEMES: Record<string, { bg: string; accent: string; icon: string }> = {
  organic: { bg: "from-green-900/40 to-green-800/20", accent: "#4ade80", icon: "🌿" },
  topdog: { bg: "from-red-900/40 to-red-800/20", accent: "#ef4444", icon: "🌭" },
  laguapa: { bg: "from-amber-900/40 to-amber-800/20", accent: "#f59e0b", icon: "🥟" },
  elpatron: { bg: "from-orange-900/40 to-orange-800/20", accent: "#f97316", icon: "🌮" },
  cabana: { bg: "from-yellow-900/40 to-yellow-800/20", accent: "#eab308", icon: "🍔" },
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

// ===== LEADS TAB =====
function LeadsTab({ token, restaurants }: { token: string; restaurants: any[] }) {
  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [langFilter, setLangFilter] = useState("all");
  const [interestedFilter, setInterestedFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  const dateFrom = useMemo(() => {
    const now = new Date();
    if (periodFilter === "today") { const d = new Date(now); d.setHours(0,0,0,0); return d.toISOString(); }
    if (periodFilter === "week") { const d = new Date(now); d.setDate(d.getDate()-7); return d.toISOString(); }
    if (periodFilter === "month") { const d = new Date(now); d.setMonth(d.getMonth()-1); return d.toISOString(); }
    return undefined;
  }, [periodFilter]);

  const leadsQuery = trpc.master.leads.useQuery(
    {
      restaurantId: restaurantFilter !== "all" ? parseInt(restaurantFilter) : undefined,
      language: langFilter !== "all" ? (langFilter as "en" | "es") : undefined,
      interested: interestedFilter !== "all" ? interestedFilter === "yes" : undefined,
      dateFrom,
    },
    { enabled: !!token, meta: { headers: token ? { Authorization: `Bearer ${token}` } : {} } }
  );

  const leads = leadsQuery.data || [];

  const exportCSV = () => {
    const headers = ["ID", "Nome", "Telefone", "Restaurante", "Idioma", "Nota", "Consultor", "Interessado", "Data"];
    const rows = leads.map((l: any) => [
      l.id, l.name || "", l.phone || "", l.restaurantName || l.restaurantId,
      l.language === "en" ? "Inglês" : "Espanhol",
      l.rating || "", l.consultant || "",
      l.interested ? "Sim" : "Não",
      new Date(l.createdAt).toLocaleString("pt-BR"),
    ]);
    const csv = [headers, ...rows].map(r => r.map(String).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `leads-imaind-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const interestedCount = leads.filter((l: any) => l.interested).length;

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <Select value={restaurantFilter} onValueChange={setRestaurantFilter}>
          <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white text-xs h-7">
            <SelectValue placeholder="Restaurante" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-white/20">
            <SelectItem value="all" className="text-white text-xs">Todos</SelectItem>
            {restaurants.map((r: any) => (
              <SelectItem key={r.id} value={String(r.id)} className="text-white text-xs">{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={langFilter} onValueChange={setLangFilter}>
          <SelectTrigger className="w-28 bg-white/10 border-white/20 text-white text-xs h-7">
            <SelectValue placeholder="Idioma" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-white/20">
            <SelectItem value="all" className="text-white text-xs">Todos</SelectItem>
            <SelectItem value="en" className="text-white text-xs">🇺🇸 Inglês</SelectItem>
            <SelectItem value="es" className="text-white text-xs">🇪🇸 Espanhol</SelectItem>
          </SelectContent>
        </Select>
        <Select value={interestedFilter} onValueChange={setInterestedFilter}>
          <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white text-xs h-7">
            <SelectValue placeholder="Interesse" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-white/20">
            <SelectItem value="all" className="text-white text-xs">Todos</SelectItem>
            <SelectItem value="yes" className="text-white text-xs">🎯 Interessados</SelectItem>
            <SelectItem value="no" className="text-white text-xs">Sem interesse</SelectItem>
          </SelectContent>
        </Select>
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-28 bg-white/10 border-white/20 text-white text-xs h-7">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-white/20">
            <SelectItem value="all" className="text-white text-xs">Sempre</SelectItem>
            <SelectItem value="today" className="text-white text-xs">Hoje</SelectItem>
            <SelectItem value="week" className="text-white text-xs">7 dias</SelectItem>
            <SelectItem value="month" className="text-white text-xs">30 dias</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 font-bold">{interestedCount} interessados</span>
          <span className="text-xs text-gray-400">/ {leads.length} total</span>
          <Button size="sm" onClick={exportCSV} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-7 px-3 border-0">
            ⬇ CSV
          </Button>
        </div>
      </div>

      {leadsQuery.isLoading ? (
        <div className="text-center py-12 text-gray-400">Carregando leads...</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-gray-400 text-sm">Nenhum lead encontrado</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {["#", "Nome", "Telefone", "Restaurante", "Idioma", "Nota", "Consultor", "Interesse", "Data"].map(h => (
                  <th key={h} className="text-left px-3 py-3 text-gray-400 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead: any) => (
                <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-3 py-2.5 text-gray-400 text-xs">#{lead.id}</td>
                  <td className="px-3 py-2.5 text-white text-xs font-medium">{lead.name || <span className="text-gray-500 italic">Anônimo</span>}</td>
                  <td className="px-3 py-2.5 text-xs">
                    {lead.phone ? (
                      <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                        className="text-green-400 hover:text-green-300 underline">{lead.phone}</a>
                    ) : <span className="text-gray-500">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-gray-300 text-xs">{lead.restaurantName || `R${lead.restaurantId}`}</td>
                  <td className="px-3 py-2.5 text-xs">{lead.language === "en" ? "🇺🇸 EN" : "🇪🇸 ES"}</td>
                  <td className="px-3 py-2.5 text-xs">
                    {lead.rating ? (
                      <span className="text-yellow-400">{"⭐".repeat(lead.rating)}</span>
                    ) : <span className="text-gray-500">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-gray-300 text-xs capitalize">{lead.consultant || "—"}</td>
                  <td className="px-3 py-2.5 text-xs">
                    {lead.interested
                      ? <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-xs">🎯 Sim</span>
                      : <span className="text-gray-500 text-xs">Não</span>}
                  </td>
                  <td className="px-3 py-2.5 text-gray-400 text-xs">
                    {new Date(lead.createdAt).toLocaleDateString("pt-BR")} {new Date(lead.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ===== PROGRESS TAB =====
function ProgressTab({ token, restaurants }: { token: string; restaurants: any[] }) {
  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [langFilter, setLangFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const progressQuery = trpc.master.studentProgress.useQuery(
    {
      restaurantId: restaurantFilter !== "all" ? parseInt(restaurantFilter) : undefined,
      language: langFilter !== "all" ? langFilter : undefined,
    },
    { enabled: !!token, meta: { headers: token ? { Authorization: `Bearer ${token}` } : {} } }
  );

  const detailQuery = trpc.master.studentDetail.useQuery(
    { studentName: selectedStudent || "", restaurantId: restaurantFilter !== "all" ? parseInt(restaurantFilter) : undefined },
    { enabled: !!token && !!selectedStudent, meta: { headers: token ? { Authorization: `Bearer ${token}` } : {} } }
  );

  const students = progressQuery.data || [];
  const detail = detailQuery.data;

  const GAME_LABELS: Record<string, string> = {
    voice_order: "🎙️ Voice Order",
    qa_simulation: "💬 Q&A Simulation",
    phrase_builder: "🧩 Phrase Builder",
  };

  if (selectedStudent && detail) {
    const xpDays = Object.entries(detail.xpByDay).sort(([a], [b]) => a.localeCompare(b));
    const maxXP = Math.max(...xpDays.map(([, v]) => v), 1);
    return (
      <div>
        <button onClick={() => setSelectedStudent(null)} className="text-blue-400 hover:text-blue-300 text-xs mb-4 flex items-center gap-1">
          ← Voltar para lista
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xl font-black text-white">
            {detail.studentName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{detail.studentName}</h3>
            <p className="text-gray-400 text-xs">{detail.totalGames} sessões · {detail.totalXP} XP total · {detail.avgAccuracy}% precisão média</p>
          </div>
        </div>

        {/* Activity breakdown */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {Object.entries(detail.byType).map(([type, sessions]: [string, any[]]) => {
            const xp = sessions.reduce((s: number, r: any) => s + r.score, 0);
            const acc = sessions.length > 0
              ? Math.round(sessions.reduce((s: number, r: any) => s + (r.totalQuestions > 0 ? r.score / r.totalQuestions : 0), 0) / sessions.length * 100)
              : 0;
            return (
              <Card key={type} className="bg-white/5 border-white/10">
                <CardContent className="p-3 text-center">
                  <p className="text-white text-sm font-bold">{GAME_LABELS[type]}</p>
                  <p className="text-blue-400 text-xl font-black mt-1">{xp} XP</p>
                  <p className="text-gray-400 text-xs">{sessions.length} sessões · {acc}% acerto</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* XP over time bar chart */}
        {xpDays.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
            <p className="text-gray-400 text-xs mb-3">XP por dia</p>
            <div className="flex items-end gap-1 h-24">
              {xpDays.map(([day, xp]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-blue-600 to-purple-500 min-h-[4px]"
                    style={{ height: `${Math.round((xp / maxXP) * 88)}px` }}
                    title={`${day}: ${xp} XP`}
                  />
                  <span className="text-gray-500 text-[9px] rotate-45 origin-left">{day.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent sessions */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-4 py-2 border-b border-white/10">
            <p className="text-gray-400 text-xs">Sessões recentes</p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                {["Atividade", "Dificuldade", "Acertos", "XP", "Idioma", "Data"].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...detail.sessions].reverse().slice(0, 20).map((s: any) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-3 py-2 text-white">{GAME_LABELS[s.gameType] || s.gameType}</td>
                  <td className="px-3 py-2 text-gray-400 capitalize">{s.difficulty}</td>
                  <td className="px-3 py-2 text-green-400">{s.score}/{s.totalQuestions}</td>
                  <td className="px-3 py-2 text-blue-400 font-bold">{s.score}</td>
                  <td className="px-3 py-2">{s.language === "en" ? "🇺🇸" : "🇪🇸"}</td>
                  <td className="px-3 py-2 text-gray-500">{new Date(s.createdAt).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <Select value={restaurantFilter} onValueChange={setRestaurantFilter}>
          <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white text-xs h-7">
            <SelectValue placeholder="Restaurante" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-white/20">
            <SelectItem value="all" className="text-white text-xs">Todos</SelectItem>
            {restaurants.map((r: any) => (
              <SelectItem key={r.id} value={String(r.id)} className="text-white text-xs">{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={langFilter} onValueChange={setLangFilter}>
          <SelectTrigger className="w-28 bg-white/10 border-white/20 text-white text-xs h-7">
            <SelectValue placeholder="Idioma" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-white/20">
            <SelectItem value="all" className="text-white text-xs">Todos</SelectItem>
            <SelectItem value="en" className="text-white text-xs">🇺🇸 Inglês</SelectItem>
            <SelectItem value="es" className="text-white text-xs">🇪🇸 Espanhol</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <span className="text-xs text-gray-400">{students.length} alunos</span>
      </div>

      {progressQuery.isLoading ? (
        <div className="text-center py-12 text-gray-400">Carregando progresso...</div>
      ) : students.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-2">🎮</div>
          <p className="text-gray-400 text-sm">Nenhuma atividade registrada ainda</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {["Posição", "Aluno", "Restaurante", "XP Total", "Sessões", "Voice", "Q&A", "Phrase", "Precisão", "Última Atividade"].map(h => (
                  <th key={h} className="text-left px-3 py-3 text-gray-400 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s: any, i: number) => {
                const restaurant = restaurants.find((r: any) => r.id === s.restaurantId);
                const theme = RESTAURANT_THEMES[restaurant?.slug || ""] || { accent: "#fff", icon: "🍽️" };
                return (
                  <tr key={`${s.studentName}:${s.restaurantId}`}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => setSelectedStudent(s.studentName)}>
                    <td className="px-3 py-2.5 text-xs">
                      <span className={`font-black ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-gray-500"}`}>
                        #{i + 1}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-white text-xs font-medium hover:text-blue-300">{s.studentName}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-300">{theme.icon} {restaurant?.name || `R${s.restaurantId}`}</td>
                    <td className="px-3 py-2.5 text-blue-400 text-xs font-bold">{s.totalXP} XP</td>
                    <td className="px-3 py-2.5 text-gray-300 text-xs">{s.gamesPlayed}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-400">{s.voiceOrderCount}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-400">{s.qaSimulationCount}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-400">{s.phraseBuilderCount}</td>
                    <td className="px-3 py-2.5 text-xs">
                      <span className={`font-bold ${s.avgAccuracy >= 80 ? "text-green-400" : s.avgAccuracy >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                        {s.avgAccuracy}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-400 text-xs">
                      {new Date(s.lastActivity).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ===== MAIN COMPONENT =====
export default function MasterDashboard() {
  const [, navigate] = useLocation();
  const { token, user } = useMasterAuth();
  const [activeTab, setActiveTab] = useState<"orders" | "leads" | "progress">("orders");
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
      enabled: !!token && activeTab === "orders",
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

  const TABS = [
    { id: "orders", label: "🍽️ Pedidos" },
    { id: "leads", label: "🎯 Leads" },
    { id: "progress", label: "📊 Progresso" },
  ] as const;

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
            <Button variant="ghost" size="sm" onClick={handleLogout}
              className="text-gray-400 hover:text-white hover:bg-white/10 text-xs">Sair</Button>
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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {restaurants.map((r: any) => {
            const theme = RESTAURANT_THEMES[r.slug] || { bg: "from-gray-900/40 to-gray-800/20", accent: "#fff", icon: "🍽️" };
            return (
              <Card key={r.id}
                className={`bg-gradient-to-br ${theme.bg} border-white/10 cursor-pointer hover:border-white/30 transition-all`}
                onClick={() => { setSelectedRestaurant(selectedRestaurant === String(r.id) ? "all" : String(r.id)); setActiveTab("orders"); }}
                style={{ borderColor: selectedRestaurant === String(r.id) ? theme.accent : undefined }}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{theme.icon}</span>
                    <p className="text-white text-xs font-semibold leading-tight">{r.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div><p className="text-gray-400">Pedidos</p><p className="text-white font-bold">{r.stats?.total || 0}</p></div>
                    <div><p className="text-gray-400">Receita</p><p style={{ color: theme.accent }} className="font-bold">R$ {(r.stats?.revenue || 0).toFixed(0)}</p></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-white/10 pb-0">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-all ${
                activeTab === tab.id
                  ? "bg-white/10 text-white border border-white/20 border-b-transparent -mb-px"
                  : "text-gray-400 hover:text-white"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "orders" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-white font-semibold text-sm">
                  Pedidos {selectedRestaurant !== "all" ? `— ${restaurants.find((r: any) => String(r.id) === selectedRestaurant)?.name || ""}` : "— Todos"}
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
              <Button variant="ghost" size="sm"
                onClick={() => { utils.master.overview.invalidate(); utils.master.allOrders.invalidate(); }}
                className="text-gray-400 hover:text-white text-xs">↻ Atualizar</Button>
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
                      {["#", "Restaurante", "Aluno", "Mesa", "Total", "Status", "Pagamento", "Horário"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-gray-400 font-medium text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order: any) => {
                      const restaurant = restaurants.find((r: any) => r.id === order.restaurantId);
                      const theme = RESTAURANT_THEMES[restaurant?.slug || ""] || { accent: "#fff", icon: "🍽️" };
                      return (
                        <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-gray-300 text-xs">#{order.id}</td>
                          <td className="px-4 py-3 text-xs">{theme.icon} {restaurant?.name || `R${order.restaurantId}`}</td>
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
                              order.paymentStatus === "pending_verification" ? "text-yellow-400" : "text-gray-500"
                            }`}>
                              {order.paymentStatus === "paid" ? "✅ Pago" :
                               order.paymentStatus === "pending_verification" ? "⏳ Aguardando" : "Não pago"}
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
        )}

        {activeTab === "leads" && <LeadsTab token={token!} restaurants={restaurants} />}
        {activeTab === "progress" && <ProgressTab token={token!} restaurants={restaurants} />}
      </div>
    </div>
  );
}
