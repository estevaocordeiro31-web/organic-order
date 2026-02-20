import { useState, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useLocation, useSearch } from "wouter";
import {
  Leaf, ShoppingCart, Plus, Minus, Trash2, ArrowLeft,
  Coffee, CupSoda, Sandwich, Beef, Salad, UtensilsCrossed,
  IceCreamCone, GlassWater, Croissant, ChevronRight, Send, X, Citrus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Icon mapping for categories
const iconMap: Record<string, React.ReactNode> = {
  Coffee: <Coffee className="w-5 h-5" />,
  CupSoda: <CupSoda className="w-5 h-5" />,
  Leaf: <Leaf className="w-5 h-5" />,
  Citrus: <Citrus className="w-5 h-5" />,
  Sandwich: <Sandwich className="w-5 h-5" />,
  Croissant: <Croissant className="w-5 h-5" />,
  Beef: <Beef className="w-5 h-5" />,
  Salad: <Salad className="w-5 h-5" />,
  UtensilsCrossed: <UtensilsCrossed className="w-5 h-5" />,
  IceCreamCone: <IceCreamCone className="w-5 h-5" />,
  GlassWater: <GlassWater className="w-5 h-5" />,
};

type CartItem = {
  menuItemId: number;
  nameEn: string;
  namePt: string;
  price: string;
  quantity: number;
};

type Step = "setup" | "menu" | "cart" | "confirm" | "done";

export default function OrderPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const preselectedTable = params.get("table");

  const [step, setStep] = useState<Step>("setup");
  const [studentName, setStudentName] = useState("");
  const [tableId, setTableId] = useState<number | null>(
    preselectedTable ? parseInt(preselectedTable) : null
  );
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState<number | null>(null);

  const { data: categories } = trpc.menu.categories.useQuery();
  const { data: allItems } = trpc.menu.items.useQuery();
  const { data: tables } = trpc.menu.tables.useQuery();

  const createOrderMutation = trpc.order.create.useMutation({
    onSuccess: (data) => {
      setOrderId(data.orderId);
      setStep("done");
      toast.success("Order placed successfully!");
    },
    onError: (err) => {
      toast.error("Failed to place order: " + err.message);
    },
  });

  const filteredItems = useMemo(() => {
    if (!allItems) return [];
    if (!selectedCategory) return allItems;
    return allItems.filter((item) => item.categoryId === selectedCategory);
  }, [allItems, selectedCategory]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const addToCart = useCallback((item: { id: number; nameEn: string; namePt: string; price: string }) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItemId: item.id, nameEn: item.nameEn, namePt: item.namePt, price: item.price, quantity: 1 }];
    });
    toast.success(`Added "${item.nameEn}" to your order!`);
  }, []);

  const updateQuantity = useCallback((menuItemId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.menuItemId === menuItemId ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((menuItemId: number) => {
    setCart((prev) => prev.filter((c) => c.menuItemId !== menuItemId));
  }, []);

  const handlePlaceOrder = () => {
    if (!tableId || !studentName.trim() || cart.length === 0) return;
    createOrderMutation.mutate({
      tableId,
      studentName: studentName.trim(),
      items: cart.map((c) => ({
        menuItemId: c.menuItemId,
        quantity: c.quantity,
        unitPrice: c.price,
      })),
    });
  };

  // ===== STEP: SETUP =====
  if (step === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--organic-light)] via-background to-background">
        <div className="container mx-auto px-4 py-8 max-w-lg">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="text-center mb-8">
            <Leaf className="w-8 h-8 text-primary mx-auto mb-2" />
            <h1
              className="text-3xl font-bold text-foreground mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Welcome!
            </h1>
            <p className="text-muted-foreground">
              Let's get you started. What's your name?
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Your name
              </label>
              <Input
                placeholder="e.g. Maria, João, Pedro..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="text-lg py-5"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Which table are you at?
              </label>
              <div className="grid grid-cols-5 gap-2">
                {tables?.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => setTableId(table.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      tableId === table.id
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border hover:border-primary/50 text-muted-foreground"
                    }`}
                  >
                    <div className="text-lg font-bold">{table.number}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              className="w-full text-lg py-6 rounded-xl"
              disabled={!studentName.trim() || !tableId}
              onClick={() => setStep("menu")}
            >
              View Menu <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ===== STEP: MENU =====
  if (step === "menu") {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep("setup")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="text-center">
                <h1 className="font-semibold text-foreground text-sm">
                  Organic In The Box
                </h1>
                <p className="text-xs text-muted-foreground">
                  Table {tables?.find((t) => t.id === tableId)?.number} · {studentName}
                </p>
              </div>
              <button
                onClick={() => setStep("cart")}
                className="relative p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <ScrollArea className="w-full">
            <div className="flex gap-1 px-4 pb-3 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !selectedCategory
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                All
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {cat.icon && iconMap[cat.icon]}
                  {cat.nameEn}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Menu Items */}
        <div className="container mx-auto px-4 py-4">
          {selectedCategory === null ? (
            // Show grouped by category
            categories?.map((cat) => {
              const catItems = allItems?.filter((i) => i.categoryId === cat.id) || [];
              if (catItems.length === 0) return null;
              return (
                <div key={cat.id} className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-primary">
                      {cat.icon && iconMap[cat.icon]}
                    </span>
                    <h2
                      className="text-xl font-bold text-foreground"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {cat.nameEn}
                    </h2>
                  </div>
                  <div className="grid gap-3">
                    {catItems.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onAdd={addToCart}
                        cartQty={cart.find((c) => c.menuItemId === item.id)?.quantity || 0}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid gap-3">
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onAdd={addToCart}
                  cartQty={cart.find((c) => c.menuItemId === item.id)?.quantity || 0}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating Cart Button */}
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border z-30"
          >
            <Button
              size="lg"
              className="w-full text-base py-5 rounded-xl"
              onClick={() => setStep("cart")}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              View Order ({cartCount} {cartCount === 1 ? "item" : "items"}) · R$ {cartTotal.toFixed(2)}
            </Button>
          </motion.div>
        )}
      </div>
    );
  }

  // ===== STEP: CART =====
  if (step === "cart") {
    return (
      <div className="min-h-screen bg-background pb-32">
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setStep("menu")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Menu
            </button>
            <h1 className="font-semibold text-foreground">Your Order</h1>
            <div className="w-20" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-lg">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Your cart is empty.</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Go back to the menu and add some items!
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setStep("menu")}
              >
                Browse Menu
              </Button>
            </div>
          ) : (
            <>
              {/* Waiter Dialogue */}
              <Card className="mb-6 border-primary/20 bg-[var(--organic-cream)]">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-lg">👨‍🍳</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Server</p>
                      <p className="text-sm text-muted-foreground italic">
                        "So, {studentName}, let me confirm your order. You'd like..."
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cart Items */}
              <div className="space-y-3 mb-6">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item.menuItemId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {item.nameEn}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.namePt}
                              </p>
                              <p className="text-sm font-semibold text-primary mt-1">
                                R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-3">
                              <button
                                onClick={() => updateQuantity(item.menuItemId, -1)}
                                className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center font-semibold text-sm">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.menuItemId, 1)}
                                className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => removeFromCart(item.menuItemId)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors ml-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Order Summary */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-lg text-primary">
                      R$ {cartTotal.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Confirm dialogue */}
              <Card className="mb-6 border-primary/20 bg-[var(--organic-cream)]">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-lg">👨‍🍳</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Server</p>
                      <p className="text-sm text-muted-foreground italic">
                        "That'll be R$ {cartTotal.toFixed(2)}. Would you like to confirm your order?"
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Fixed bottom buttons */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border z-30 space-y-2">
            <Button
              size="lg"
              className="w-full text-base py-5 rounded-xl"
              onClick={handlePlaceOrder}
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? (
                "Sending order..."
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  "Yes, please!" — Confirm Order
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full text-sm py-3 rounded-xl"
              onClick={() => setStep("menu")}
            >
              Add more items
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ===== STEP: DONE =====
  if (step === "done") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--organic-light)] via-background to-background flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
          </motion.div>

          <h1
            className="text-3xl font-bold text-foreground mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Order Confirmed!
          </h1>

          <p className="text-muted-foreground mb-2">
            Your order <strong className="text-foreground">#{orderId}</strong> has been sent to the kitchen.
          </p>

          <Card className="mb-6 border-primary/20 bg-[var(--organic-cream)]">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-lg">👨‍🍳</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground mb-1">Server</p>
                  <p className="text-sm text-muted-foreground italic">
                    "Thank you, {studentName}! Your order is being prepared. 
                    We'll bring it to Table {tables?.find((t) => t.id === tableId)?.number} shortly. 
                    Enjoy your meal!"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted rounded-xl p-4 mb-6 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">🎓 Great job practicing English!</p>
            <p>You just ordered food in English like a pro. Keep it up!</p>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-xl"
              onClick={() => {
                setCart([]);
                setStep("menu");
              }}
            >
              Order Something Else
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-muted-foreground"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ===== MENU ITEM CARD COMPONENT =====
function MenuItemCard({
  item,
  onAdd,
  cartQty,
}: {
  item: {
    id: number;
    nameEn: string;
    namePt: string;
    descriptionEn: string | null;
    price: string;
    tags: string | null;
  };
  onAdd: (item: { id: number; nameEn: string; namePt: string; price: string }) => void;
  cartQty: number;
}) {
  const tags = item.tags?.split(",") || [];

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground text-sm leading-tight">
                {item.nameEn}
              </h3>
              {cartQty > 0 && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  {cartQty}x
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground/70 mb-1">{item.namePt}</p>
            {item.descriptionEn && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {item.descriptionEn}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 border-primary/20 text-primary/70"
                >
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="font-bold text-primary text-sm">
              R$ {parseFloat(item.price).toFixed(2)}
            </span>
            <Button
              size="sm"
              className="rounded-full h-8 w-8 p-0"
              onClick={() => onAdd(item)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
