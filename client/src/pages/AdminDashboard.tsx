import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import {
  Leaf, Clock, ChefHat, CheckCircle2, Truck, XCircle,
  ShoppingCart, DollarSign, TrendingUp, ArrowRight, LogOut,
  RefreshCw, Loader2, QrCode, Bell, BellOff, Trophy, Volume2,
} from "lucide-react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const statusFlow: Record<string, { next: string; label: string; icon: React.ReactNode; color: string }> = {
  pending: { next: "preparing", label: "Start Preparing", icon: <ChefHat className="w-4 h-4" />, color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  preparing: { next: "ready", label: "Mark as Ready", icon: <CheckCircle2 className="w-4 h-4" />, color: "bg-blue-100 text-blue-800 border-blue-200" },
  ready: { next: "delivered", label: "Mark Delivered", icon: <Truck className="w-4 h-4" />, color: "bg-green-100 text-green-800 border-green-200" },
  delivered: { next: "", label: "Completed", icon: <CheckCircle2 className="w-4 h-4" />, color: "bg-primary/10 text-primary border-primary/20" },
  cancelled: { next: "", label: "Cancelled", icon: <XCircle className="w-4 h-4" />, color: "bg-red-100 text-red-800 border-red-200" },
};

function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem("organic-sound") !== "off"; } catch { return true; }
  });

  useEffect(() => {
    // Create a simple notification beep using AudioContext
    try {
      localStorage.setItem("organic-sound", enabled ? "on" : "off");
    } catch {}
  }, [enabled]);

  const playSound = useCallback(() => {
    if (!enabled) return;
    try {
      const ctx = new AudioContext();
      // First beep
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.value = 880;
      osc1.type = "sine";
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.3);
      // Second beep
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 1100;
      osc2.type = "sine";
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.35);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.65);
      osc2.start(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.65);
    } catch {}
  }, [enabled]);

  return { playSound, enabled, setEnabled };
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");
  const [statusFilter, setStatusFilter] = useState("all");
  const { playSound, enabled: soundEnabled, setEnabled: setSoundEnabled } = useNotificationSound();
  const prevOrderCountRef = useRef<number | null>(null);

  const { data: orders, refetch: refetchOrders, isLoading: ordersLoading } = trpc.admin.orders.useQuery(
    { status: statusFilter === "all" ? undefined : statusFilter },
    { refetchInterval: 5000, enabled: isAuthenticated && user?.role === "admin" }
  );

  const { data: leaderboard } = trpc.game.leaderboard.useQuery(
    { language: "en" },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  // Sound notification for new orders
  useEffect(() => {
    if (!orders) return;
    const pendingCount = orders.filter((o: any) => o.status === "pending").length;
    if (prevOrderCountRef.current !== null && pendingCount > prevOrderCountRef.current) {
      playSound();
      toast.success(`New order received! (${pendingCount} pending)`, {
        duration: 5000,
        icon: "🔔",
      });
    }
    prevOrderCountRef.current = pendingCount;
  }, [orders, playSound]);

  const { data: stats, refetch: refetchStats } = trpc.admin.stats.useQuery(undefined, {
    refetchInterval: 10000,
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: allMenuItems, refetch: refetchMenu } = trpc.admin.allMenuItems.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: allCategories } = trpc.admin.allCategories.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const updateStatusMutation = trpc.admin.updateOrderStatus.useMutation({
    onSuccess: () => {
      refetchOrders();
      refetchStats();
      toast.success("Order status updated!");
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleItemMutation = trpc.admin.toggleItemAvailability.useMutation({
    onSuccess: () => {
      refetchMenu();
      toast.success("Item availability updated!");
    },
    onError: (err) => toast.error(err.message),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Leaf className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Kitchen Dashboard
            </h1>
            <p className="text-muted-foreground mb-6">
              Sign in to manage orders and menu
            </p>
            <Button size="lg" className="w-full" onClick={() => { window.location.href = getLoginUrl(); }}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You need admin privileges to access this dashboard.
            </p>
            <Button variant="outline" onClick={logout}>Sign Out</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <div>
              <h1 className="font-bold text-foreground text-sm">Organic Kitchen</h1>
              <p className="text-xs text-muted-foreground">Order Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute notifications" : "Enable notifications"}
            >
              {soundEnabled ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/qrcodes")}>
              <QrCode className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { refetchOrders(); refetchStats(); }}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total Orders", value: stats?.total || 0, icon: <ShoppingCart className="w-4 h-4" />, color: "text-foreground" },
            { label: "Pending", value: stats?.pending || 0, icon: <Clock className="w-4 h-4" />, color: "text-yellow-600" },
            { label: "Preparing", value: stats?.preparing || 0, icon: <ChefHat className="w-4 h-4" />, color: "text-blue-600" },
            { label: "Ready", value: stats?.ready || 0, icon: <CheckCircle2 className="w-4 h-4" />, color: "text-green-600" },
            { label: "Revenue", value: `R$ ${(stats?.revenue || 0).toFixed(0)}`, icon: <DollarSign className="w-4 h-4" />, color: "text-primary" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={stat.color}>{stat.icon}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
          </TabsList>

          {/* ORDERS TAB */}
          <TabsContent value="orders">
            {/* Status Filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {["all", "pending", "preparing", "ready", "delivered"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                    statusFilter === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {s === "all" ? "All Orders" : s}
                </button>
              ))}
            </div>

            {/* Orders List */}
            {ordersLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              </div>
            ) : orders?.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {orders?.map((order: any) => {
                    const config = statusFlow[order.status] || statusFlow.pending;
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <Card className={`border-l-4 ${
                          order.status === "pending" ? "border-l-yellow-400" :
                          order.status === "preparing" ? "border-l-blue-400" :
                          order.status === "ready" ? "border-l-green-400" :
                          order.status === "delivered" ? "border-l-primary" :
                          "border-l-red-400"
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-foreground">
                                    #{order.id}
                                  </span>
                                  <Badge className={`text-xs ${config.color}`}>
                                    {config.icon}
                                    <span className="ml-1 capitalize">{order.status}</span>
                                  </Badge>
                                </div>
                                <p className="text-sm text-foreground font-medium">
                                  {order.studentName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Table {order.table?.number} · {new Date(order.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                              <span className="font-bold text-primary">
                                R$ {parseFloat(order.totalAmount).toFixed(2)}
                              </span>
                            </div>

                            {/* Items */}
                            <div className="bg-muted/50 rounded-lg p-3 mb-3">
                              {order.items.map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between text-sm py-0.5">
                                  <span className="text-foreground">
                                    {item.quantity}x {item.nameEn}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    {item.namePt}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              {config.next && (
                                <Button
                                  size="sm"
                                  className="flex-1"
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      orderId: order.id,
                                      status: config.next as any,
                                    })
                                  }
                                  disabled={updateStatusMutation.isPending}
                                >
                                  {config.icon}
                                  <span className="ml-1">{config.label}</span>
                                  <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                              )}
                              {order.status !== "cancelled" && order.status !== "delivered" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      orderId: order.id,
                                      status: "cancelled",
                                    })
                                  }
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* LEADERBOARD TAB */}
          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Student Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!leaderboard || leaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No game scores yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry: any, index: number) => (
                      <div
                        key={`${entry.studentName}-${index}`}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          index === 0 ? "bg-amber-50 border-amber-200" :
                          index === 1 ? "bg-gray-50 border-gray-200" :
                          index === 2 ? "bg-orange-50 border-orange-200" :
                          "border-border"
                        }`}
                      >
                        <span className={`w-6 text-center font-bold text-sm ${
                          index === 0 ? "text-amber-600" : index === 1 ? "text-gray-500" : index === 2 ? "text-orange-600" : "text-muted-foreground"
                        }`}>
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">{entry.studentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.gamesPlayed} games · Best: {entry.bestPercentage}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-primary">{entry.totalScore}/{entry.totalQuestions}</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round((entry.totalScore / Math.max(entry.totalQuestions, 1)) * 100)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MENU TAB */}
          <TabsContent value="menu">
            <div className="space-y-6">
              {allCategories?.map((cat: any) => {
                const catItems = allMenuItems?.filter((i: any) => i.categoryId === cat.id) || [];
                if (catItems.length === 0) return null;
                return (
                  <div key={cat.id}>
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${cat.active ? "bg-primary" : "bg-muted-foreground"}`} />
                      {cat.nameEn}
                      <span className="text-xs text-muted-foreground font-normal">
                        ({cat.namePt})
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {catItems.map((item: any) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            item.available ? "border-border" : "border-destructive/20 bg-destructive/5"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${item.available ? "text-foreground" : "text-muted-foreground line-through"}`}>
                              {item.nameEn}
                            </p>
                            <p className="text-xs text-muted-foreground">{item.namePt}</p>
                          </div>
                          <div className="flex items-center gap-3 ml-3">
                            <span className="text-sm font-medium text-primary">
                              R$ {parseFloat(item.price).toFixed(2)}
                            </span>
                            <Switch
                              checked={item.available}
                              onCheckedChange={(checked) =>
                                toggleItemMutation.mutate({ itemId: item.id, available: checked })
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
