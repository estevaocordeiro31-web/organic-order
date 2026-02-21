import { useState, useMemo, useCallback, useRef } from "react";
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
  IceCreamCone, GlassWater, Croissant, ChevronRight, Send, Citrus,
  CreditCard, Upload, CheckCircle2, Loader2, Camera,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GABI_ENGLISH = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/fSjaBTevqlMJYHae.png";
const CRIS_SPANISH = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/vTPizDjRBbaCIUNs.png";
const GABI_UNIFORM = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/DpukkKpvgfOJdjGU.png";
const CRIS_UNIFORM = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/ERTewrUOkIDhpEGI.png";

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
  name: string;
  namePt: string;
  price: string;
  quantity: number;
  imageUrl?: string | null;
};

type Step = "setup" | "menu" | "cart" | "done" | "payment";

// Pick a random waiter for the session
function pickWaiter(lang: "en" | "es") {
  const isGabi = Math.random() > 0.5;
  if (lang === "en") {
    return {
      name: isGabi ? "Gabi" : "Cris",
      img: isGabi ? GABI_ENGLISH : CRIS_UNIFORM,
      flag: "🇺🇸",
    };
  }
  return {
    name: isGabi ? "Gabi" : "Cris",
    img: isGabi ? GABI_UNIFORM : CRIS_SPANISH,
    flag: "🇪🇸",
  };
}

// i18n helper
const t = (lang: "en" | "es", en: string, es: string) => lang === "en" ? en : es;

export default function OrderPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const preselectedTable = params.get("table");
  const lang = (params.get("lang") as "en" | "es") || "en";

  const [step, setStep] = useState<Step>("setup");
  const [studentName, setStudentName] = useState("");
  const [tableId, setTableId] = useState<number | null>(
    preselectedTable ? parseInt(preselectedTable) : null
  );
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [waiter] = useState(() => pickWaiter(lang));

  const { data: categories } = trpc.menu.categories.useQuery();
  const { data: allItems } = trpc.menu.items.useQuery();
  const { data: tables } = trpc.menu.tables.useQuery();

  const [paymentProofSent, setPaymentProofSent] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: pixInfo } = trpc.order.pixInfo.useQuery();

  const createOrderMutation = trpc.order.create.useMutation({
    onSuccess: (data) => {
      setOrderId(data.orderId);
      setStep("payment");
      toast.success(t(lang, "Order placed successfully!", "¡Pedido realizado con éxito!"));
    },
    onError: (err) => {
      toast.error(t(lang, "Failed to place order: ", "Error al hacer el pedido: ") + err.message);
    },
  });

  const uploadProofMutation = trpc.order.uploadPaymentProof.useMutation({
    onSuccess: () => {
      setPaymentProofSent(true);
      toast.success(t(lang, "Payment proof sent! We'll verify it shortly.", "¡Comprobante enviado! Lo verificaremos pronto."));
    },
    onError: (err: any) => {
      toast.error(t(lang, "Failed to upload proof: ", "Error al enviar comprobante: ") + err.message);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orderId) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t(lang, "File too large. Max 5MB.", "Archivo muy grande. Máx 5MB."));
      return;
    }
    setUploadingProof(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        uploadProofMutation.mutate({
          orderId,
          imageBase64: base64,
          mimeType: file.type || "image/jpeg",
        });
        setUploadingProof(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingProof(false);
    }
  };

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

  // Get display name based on language
  const getItemName = useCallback((item: { nameEn: string; nameEs?: string | null }) => {
    if (lang === "es" && item.nameEs) return item.nameEs;
    return item.nameEn;
  }, [lang]);

  const getItemDesc = useCallback((item: { descriptionEn?: string | null; descriptionEs?: string | null }) => {
    if (lang === "es" && item.descriptionEs) return item.descriptionEs;
    return item.descriptionEn;
  }, [lang]);

  const getCatName = useCallback((cat: { nameEn: string; nameEs?: string | null }) => {
    if (lang === "es" && cat.nameEs) return cat.nameEs;
    return cat.nameEn;
  }, [lang]);

  const addToCart = useCallback((item: { id: number; nameEn: string; nameEs?: string | null; namePt: string; price: string; imageUrl?: string | null }) => {
    const displayName = lang === "es" && item.nameEs ? item.nameEs : item.nameEn;
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItemId: item.id, name: displayName, namePt: item.namePt, price: item.price, quantity: 1, imageUrl: item.imageUrl }];
    });
    const msg = lang === "en"
      ? `Added "${displayName}" to your order!`
      : `"${displayName}" añadido a tu pedido!`;
    toast.success(msg);
  }, [lang]);

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
            <ArrowLeft className="w-4 h-4" /> {t(lang, "Back", "Volver")}
          </button>

          {/* Waiter greeting */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-2 border-primary/30 shadow-lg">
              <img src={waiter.img} alt={waiter.name} className="w-full h-full object-cover" />
            </div>
            <h1
              className="text-2xl font-bold text-foreground mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {waiter.flag} {t(lang,
                `Hi! I'm ${waiter.name}, your server today!`,
                `¡Hola! Soy ${waiter.name}, tu mesero hoy!`
              )}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t(lang,
                "What's your name? And which table are you at?",
                "¿Cómo te llamas? ¿En qué mesa estás?"
              )}
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                {t(lang, "Your name", "Tu nombre")}
              </label>
              <Input
                placeholder={t(lang, "e.g. Maria, João, Pedro...", "ej. María, João, Pedro...")}
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="text-lg py-5"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                {t(lang, "Which table are you at?", "¿En qué mesa estás?")}
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
              {t(lang, "View Menu", "Ver Menú")} <ChevronRight className="w-5 h-5 ml-1" />
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
                  Organic In The Box {waiter.flag}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {t(lang, "Table", "Mesa")} {tables?.find((t) => t.id === tableId)?.number} · {studentName}
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
                {t(lang, "All", "Todo")}
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
                  {getCatName(cat)}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Waiter tip bubble */}
        <div className="container mx-auto px-4 pt-4 pb-2">
          <Card className="border-primary/20 bg-[var(--organic-cream)]">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-primary/20">
                <img src={waiter.img} alt={waiter.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-xs text-muted-foreground italic">
                {t(lang,
                  `"Take your time, ${studentName}! Just tap the + button to add items to your order."`,
                  `"¡Tómate tu tiempo, ${studentName}! Solo toca el botón + para agregar items a tu pedido."`
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items */}
        <div className="container mx-auto px-4 py-4">
          {selectedCategory === null ? (
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
                      {getCatName(cat)}
                    </h2>
                  </div>
                  <div className="grid gap-3">
                    {catItems.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        lang={lang}
                        getName={getItemName}
                        getDesc={getItemDesc}
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
                  lang={lang}
                  getName={getItemName}
                  getDesc={getItemDesc}
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
              {t(lang, "View Order", "Ver Pedido")} ({cartCount} {cartCount === 1 ? "item" : "items"}) · R$ {cartTotal.toFixed(2)}
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
              <ArrowLeft className="w-4 h-4" /> {t(lang, "Back to Menu", "Volver al Menú")}
            </button>
            <h1 className="font-semibold text-foreground">
              {t(lang, "Your Order", "Tu Pedido")}
            </h1>
            <div className="w-20" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-lg">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {t(lang, "Your cart is empty.", "Tu carrito está vacío.")}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setStep("menu")}
              >
                {t(lang, "Browse Menu", "Ver Menú")}
              </Button>
            </div>
          ) : (
            <>
              {/* Waiter Dialogue */}
              <Card className="mb-6 border-primary/20 bg-[var(--organic-cream)]">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-primary/20">
                      <img src={waiter.img} alt={waiter.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">{waiter.name}</p>
                      <p className="text-sm text-muted-foreground italic">
                        {t(lang,
                          `"So, ${studentName}, let me confirm your order. You'd like..."`,
                          `"Entonces, ${studentName}, déjame confirmar tu pedido. Quieres..."`
                        )}
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
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            {item.imageUrl && (
                              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-muted">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.namePt}
                              </p>
                              <p className="text-sm font-semibold text-primary mt-0.5">
                                R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => updateQuantity(item.menuItemId, -1)}
                                className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-5 text-center font-semibold text-xs">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.menuItemId, 1)}
                                className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => removeFromCart(item.menuItemId)}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors ml-1"
                              >
                                <Trash2 className="w-3 h-3" />
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
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-primary/20">
                      <img src={waiter.img} alt={waiter.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">{waiter.name}</p>
                      <p className="text-sm text-muted-foreground italic">
                        {t(lang,
                          `"That'll be R$ ${cartTotal.toFixed(2)}. Would you like to confirm your order?"`,
                          `"Serán R$ ${cartTotal.toFixed(2)}. ¿Deseas confirmar tu pedido?"`
                        )}
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
                t(lang, "Sending order...", "Enviando pedido...")
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  {t(lang, '"Yes, please!" — Confirm Order', '"¡Sí, por favor!" — Confirmar Pedido')}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full text-sm py-3 rounded-xl"
              onClick={() => setStep("menu")}
            >
              {t(lang, "Add more items", "Agregar más items")}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ===== STEP: PAYMENT (PIX) =====
  if (step === "payment") {
    const pixKeyDisplay = pixInfo?.pixKey || "(chave não configurada)";
    const totalFormatted = `R$ ${cartTotal.toFixed(2)}`;

    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--organic-light)] via-background to-background">
        <div className="container mx-auto px-4 py-8 max-w-lg">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
          </motion.div>

          <h1
            className="text-2xl font-bold text-foreground mb-2 text-center"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t(lang, "Payment via Pix", "Pago por Pix")}
          </h1>
          <p className="text-center text-muted-foreground mb-6 text-sm">
            {t(lang,
              `Order #${orderId} · Total: ${totalFormatted}`,
              `Pedido #${orderId} · Total: ${totalFormatted}`
            )}
          </p>

          {/* Pix Key Card */}
          <Card className="mb-4 border-primary/20">
            <CardContent className="p-5">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                  {t(lang, "Pix Key", "Chave Pix")}
                </p>
                <p className="text-lg font-mono font-bold text-foreground mb-3 break-all select-all">
                  {pixKeyDisplay}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    navigator.clipboard.writeText(pixKeyDisplay);
                    toast.success(t(lang, "Pix key copied!", "¡Clave Pix copiada!"));
                  }}
                >
                  {t(lang, "Copy Pix Key", "Copiar Chave Pix")}
                </Button>
              </div>
              <Separator className="my-4" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {t(lang, "Amount to pay", "Valor a pagar")}
                </p>
                <p className="text-3xl font-bold text-primary">{totalFormatted}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {pixInfo?.pixName || "Organic In The Box"} · {pixInfo?.pixCity || "Jundiaí"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="mb-4 bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-amber-800 mb-2">
                {t(lang, "How to pay:", "Cómo pagar:")}
              </p>
              <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
                <li>{t(lang, "Open your bank app", "Abre tu app del banco")}</li>
                <li>{t(lang, "Go to Pix → Pay with Pix Key", "Ve a Pix → Pagar con Chave Pix")}</li>
                <li>{t(lang, "Paste the key above and enter the amount", "Pega la chave y ingresa el valor")}</li>
                <li>{t(lang, "Take a screenshot of the receipt", "Toma una captura del comprobante")}</li>
                <li>{t(lang, "Upload the receipt below", "Sube el comprobante abajo")}</li>
              </ol>
            </CardContent>
          </Card>

          {/* Upload Proof */}
          {!paymentProofSent ? (
            <Card className="mb-4 border-primary/20">
              <CardContent className="p-5 text-center">
                <Upload className="w-10 h-10 text-primary/50 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-3">
                  {t(lang, "Upload your payment receipt", "Sube tu comprobante de pago")}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingProof || uploadProofMutation.isPending}
                    className="rounded-xl"
                  >
                    {uploadingProof || uploadProofMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {t(lang, "Uploading...", "Subiendo...")}</>
                    ) : (
                      <><Camera className="w-4 h-4 mr-2" /> {t(lang, "Choose Photo", "Elegir Foto")}</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-4 border-green-200 bg-green-50">
              <CardContent className="p-5 text-center">
                <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-800">
                  {t(lang, "Receipt sent! We'll verify it shortly.", "¡Comprobante enviado! Lo verificaremos pronto.")}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Continue without proof */}
          <div className="space-y-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-xl"
              onClick={() => setStep("done")}
            >
              {paymentProofSent
                ? t(lang, "Continue", "Continuar")
                : t(lang, "I'll pay at the counter", "Pagaré en el mostrador")
              }
            </Button>
          </div>
        </div>
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
            {t(lang, "Order Confirmed!", "¡Pedido Confirmado!")}
          </h1>

          <p className="text-muted-foreground mb-2">
            {lang === "en" ? (
              <>Your order <strong className="text-foreground">#{orderId}</strong> has been sent to the kitchen.</>
            ) : (
              <>Tu pedido <strong className="text-foreground">#{orderId}</strong> ha sido enviado a la cocina.</>
            )}
          </p>

          {paymentProofSent && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {t(lang, "Payment proof sent", "Comprobante enviado")}
              </Badge>
            </div>
          )}

          <Card className="mb-6 border-primary/20 bg-[var(--organic-cream)]">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-primary/20">
                  <img src={waiter.img} alt={waiter.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground mb-1">{waiter.name}</p>
                  <p className="text-sm text-muted-foreground italic">
                    {t(lang,
                      `"Thank you, ${studentName}! Your order is being prepared. We'll bring it to Table ${tables?.find((tb) => tb.id === tableId)?.number} shortly. Enjoy your meal!"`,
                      `"¡Gracias, ${studentName}! Tu pedido está siendo preparado. Lo llevaremos a la Mesa ${tables?.find((tb) => tb.id === tableId)?.number} pronto. ¡Buen provecho!"`
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted rounded-xl p-4 mb-6 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">
              {t(lang, "Great job practicing!", "¡Excelente práctica!")}
            </p>
            <p>
              {t(lang,
                `You just ordered food in English like a pro. Keep it up, ${studentName}!`,
                `Acabas de pedir comida en español como un profesional. ¡Sigue así, ${studentName}!`
              )}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-xl"
              onClick={() => {
                setCart([]);
                setPaymentProofSent(false);
                setStep("menu");
              }}
            >
              {t(lang, "Order Something Else", "Pedir Algo Más")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-muted-foreground"
            >
              {t(lang, "Back to Home", "Volver al Inicio")}
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
  lang,
  getName,
  getDesc,
  onAdd,
  cartQty,
}: {
  item: {
    id: number;
    nameEn: string;
    nameEs?: string | null;
    namePt: string;
    descriptionEn: string | null;
    descriptionEs?: string | null;
    price: string;
    tags: string | null;
    imageUrl?: string | null;
  };
  lang: "en" | "es";
  getName: (item: { nameEn: string; nameEs?: string | null }) => string;
  getDesc: (item: { descriptionEn?: string | null; descriptionEs?: string | null }) => string | null | undefined;
  onAdd: (item: { id: number; nameEn: string; nameEs?: string | null; namePt: string; price: string; imageUrl?: string | null }) => void;
  cartQty: number;
}) {
  const tags = item.tags?.split(",") || [];
  const displayName = getName(item);
  const displayDesc = getDesc(item);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex">
          {/* Image */}
          {item.imageUrl && (
            <div className="w-24 h-24 shrink-0 bg-muted">
              <img src={item.imageUrl} alt={displayName} className="w-full h-full object-cover" />
            </div>
          )}
          {/* Content */}
          <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
                  {displayName}
                </h3>
                {cartQty > 0 && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {cartQty}x
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground/60 mb-0.5">{item.namePt}</p>
              {displayDesc && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {displayDesc}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <div className="flex items-center gap-1 flex-wrap">
                {tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-[9px] px-1 py-0 border-primary/20 text-primary/70"
                  >
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-bold text-primary text-sm">
                  R$ {parseFloat(item.price).toFixed(2)}
                </span>
                <Button
                  size="sm"
                  className="rounded-full h-7 w-7 p-0"
                  onClick={() => onAdd(item)}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
