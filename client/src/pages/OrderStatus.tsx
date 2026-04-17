import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Leaf, Clock, ChefHat, CheckCircle2, Truck } from "lucide-react";

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: "Order Received", icon: <Clock className="w-5 h-5" />, color: "bg-yellow-500/15 text-yellow-300" },
  preparing: { label: "Being Prepared", icon: <ChefHat className="w-5 h-5" />, color: "bg-blue-500/15 text-blue-300" },
  ready: { label: "Ready for Pickup", icon: <CheckCircle2 className="w-5 h-5" />, color: "bg-green-500/15 text-green-300" },
  delivered: { label: "Delivered", icon: <Truck className="w-5 h-5" />, color: "bg-primary/10 text-primary" },
  cancelled: { label: "Cancelled", icon: <Clock className="w-5 h-5" />, color: "bg-red-500/15 text-red-300" },
};

export default function OrderStatus() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const orderId = parseInt(params.id || "0");

  const { data: order, isLoading } = trpc.order.status.useQuery(
    { orderId },
    { refetchInterval: 5000 }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Leaf className="w-8 h-8 text-primary animate-pulse mx-auto mb-3" />
          <p className="text-muted-foreground">Loading order status...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Order not found</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Home
        </button>

        <div className="text-center mb-6">
          <h1
            className="text-2xl font-bold text-foreground mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Order #{order.id}
          </h1>
          <p className="text-sm text-muted-foreground">
            {order.studentName} · Table {order.table?.number}
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.color}`}>
            {status.icon}
            <span className="font-semibold">{status.label}</span>
          </div>
        </div>

        {/* Items */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {item.quantity}x {item.nameEn}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({item.namePt})
                    </span>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    R$ {(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-3 pt-3 flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-primary">
                R$ {parseFloat(order.totalAmount).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={() => navigate("/order")}
        >
          Place Another Order
        </Button>
      </div>
    </div>
  );
}
