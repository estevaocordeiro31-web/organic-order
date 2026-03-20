import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Mic, ShoppingCart, Plus, Minus, ChevronRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

const IMAIND_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/imaind-logo-main-Fx4X8HBTwPWV3N6Pfhh9r9.png";
const EP_HERO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/elpatron-hero-tacos-NZjSGhLqAKFr2Nt6x5xArR.png";
const EP_BURRITO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/elpatron-burrito-barbacoa-oS4E6rJ5uTBwKatireMU4e.png";
const EP_CHURROS = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/elpatron-churros-RrTDam2x8bCRv3iKxCaJX3.png";
const EP_CHILLI_FRIES = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/elpatron-chilli-fries-bvc8FGQHtw22C8aVeWR4DB.png";

const RESTAURANT_ID = 4;

type CartItem = {
  id: number;
  nameEn: string;
  namePt: string;
  nameEs: string;
  price: string;
  quantity: number;
  imageUrl?: string | null;
};

type Step = "menu" | "cart" | "order" | "done";

const ITEM_IMAGES: Record<string, string> = {
  "Barbacoa Burrito": EP_BURRITO,
  "Double Tacos Barbacoa": EP_HERO,
  "Dulce de Leche Churros": EP_CHURROS,
  "Nutella Churros": EP_CHURROS,
  "Chilli Fries": EP_CHILLI_FRIES,
};

export default function ElPatronExperience() {
  const [, navigate] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const lang = (urlParams.get("lang") ?? "en") as "en" | "es";
  const voiceMode = urlParams.get("voice") === "1";

  const [step, setStep] = useState<Step>("menu");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [studentName, setStudentName] = useState("");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  const { data: menuData, isLoading } = trpc.restaurant.menu.useQuery({ restaurantId: RESTAURANT_ID });

  const categories = menuData?.categories ?? [];
  const items = menuData?.items ?? [];
  const restaurantTables = menuData?.tables ?? [];

  const activeCategoryId = selectedCategory ?? categories[0]?.id ?? null;
  const filteredItems = items.filter(item => item.categoryId === activeCategoryId);

  const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const createOrderMutation = trpc.order.create.useMutation();

  function addToCart(item: typeof items[0]) {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { id: item.id, nameEn: item.nameEn, namePt: item.namePt, nameEs: item.nameEs ?? item.nameEn, price: item.price, quantity: 1, imageUrl: item.imageUrl ?? ITEM_IMAGES[item.nameEn] ?? null }];
    });
  }

  function removeFromCart(id: number) {
    setCart(prev => {
      const existing = prev.find(c => c.id === id);
      if (existing && existing.quantity > 1) return prev.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c);
      return prev.filter(c => c.id !== id);
    });
  }

  function getItemQty(id: number) { return cart.find(c => c.id === id)?.quantity ?? 0; }
  function getItemName(item: { nameEn: string; namePt: string; nameEs?: string | null }) {
    if (lang === "es") return item.nameEs ?? item.nameEn;
    return item.nameEn;
  }

  async function placeOrder() {
    if (!selectedTable || !studentName.trim()) return;
    try {
      await createOrderMutation.mutateAsync({
        tableId: selectedTable,
        studentName: studentName.trim(),
        items: cart.map(item => ({ menuItemId: item.id, quantity: item.quantity, unitPrice: item.price })),
      });
      setStep("done");
    } catch (e) { console.error(e); }
  }

  if (step === "menu") {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0f0500 0%, #0a0300 100%)" }}>
        {/* Fiery Mexican glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full blur-3xl opacity-25"
            style={{ background: "radial-gradient(ellipse, #dc2626 0%, #ea580c 50%, transparent 70%)" }} />
          <div className="absolute bottom-1/4 right-0 w-48 h-48 rounded-full blur-3xl opacity-15"
            style={{ background: "radial-gradient(ellipse, #fbbf24 0%, transparent 70%)" }} />
          {/* Diagonal stripe texture */}
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #f97316 0px, #f97316 1px, transparent 1px, transparent 20px)" }} />
        </div>

        {/* Hero banner */}
        <div className="relative h-52 overflow-hidden">
          <img src={EP_HERO} alt="El Patron" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(15,5,0,0.5) 0%, transparent 40%, rgba(10,3,0,1) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(10,3,0,0.9) 0%, transparent 60%)" }} />

          <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-3">
            <button onClick={() => navigate(`/?lang=${lang}&voice=${voiceMode ? "1" : "0"}`)}
              className="w-9 h-9 rounded-full backdrop-blur flex items-center justify-center border transition-colors"
              style={{ background: "rgba(0,0,0,0.5)", borderColor: "rgba(220,38,38,0.3)" }}>
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <img src={IMAIND_LOGO} alt="ImAInd" className="w-7 h-7 object-contain" />
            <div className="flex-1">
              <h1 className="text-white font-black text-base leading-tight tracking-widest">EL PATRÓN</h1>
              <p className="text-orange-400 text-xs font-medium">🌮 Comida Mexicana · Jundiaí</p>
            </div>
            {voiceMode && <Mic className="w-4 h-4 text-blue-400" />}
          </div>

          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <p className="text-orange-200/80 text-sm font-bold">
              {lang === "en" ? '"Authentic Mexican flavors"' : '"Sabores mexicanos auténticos"'}
            </p>
          </div>
        </div>

        {/* Category tabs */}
        <div className="relative px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {isLoading ? (
              <div className="flex gap-2">{[1,2,3].map(i => <div key={i} className="h-8 w-20 rounded-full animate-pulse" style={{ background: "rgba(220,38,38,0.15)" }} />)}</div>
            ) : categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all`}
                style={activeCategoryId === cat.id
                  ? { background: "linear-gradient(135deg, #dc2626, #ea580c)", color: "white", boxShadow: "0 4px 12px rgba(220,38,38,0.4)" }
                  : { background: "rgba(220,38,38,0.1)", color: "rgba(251,146,60,0.7)", border: "1px solid rgba(220,38,38,0.2)" }}>
                {cat.icon} {getItemName(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Menu items */}
        <div className="relative flex-1 px-4 pb-28 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "rgba(220,38,38,0.05)" }} />)}</div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item, i) => {
                const qty = getItemQty(item.id);
                const itemImage = item.imageUrl ?? ITEM_IMAGES[item.nameEn] ?? null;
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-2xl overflow-hidden flex"
                    style={{ background: "linear-gradient(135deg, rgba(15,5,0,0.95), rgba(10,3,0,0.98))", border: "1px solid rgba(220,38,38,0.15)" }}>
                    {itemImage && (
                      <div className="w-24 h-24 shrink-0 overflow-hidden">
                        <img src={itemImage} alt={item.nameEn} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <div>
                        <h3 className="text-orange-100 font-bold text-sm leading-tight">{getItemName(item)}</h3>
                        <p className="text-orange-100/40 text-xs mt-0.5 line-clamp-2">
                          {lang === "es" ? item.descriptionEs ?? item.descriptionEn : item.descriptionEn}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-orange-400 font-black text-sm">R$ {parseFloat(item.price).toFixed(2)}</span>
                        <div className="flex items-center gap-2">
                          {qty > 0 && (
                            <>
                              <button onClick={() => removeFromCart(item.id)}
                                className="w-7 h-7 rounded-full flex items-center justify-center"
                                style={{ background: "rgba(220,38,38,0.2)" }}>
                                <Minus className="w-3 h-3 text-orange-400" />
                              </button>
                              <span className="text-orange-100 font-bold text-sm w-4 text-center">{qty}</span>
                            </>
                          )}
                          <button onClick={() => addToCart(item)}
                            className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                            style={{ background: "linear-gradient(135deg, #dc2626, #ea580c)", boxShadow: "0 4px 8px rgba(220,38,38,0.3)" }}>
                            <Plus className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {cartCount > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto z-50">
            <button onClick={() => setStep("cart")}
              className="w-full text-white rounded-2xl py-4 px-6 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, #dc2626, #ea580c)", boxShadow: "0 8px 32px rgba(220,38,38,0.5)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <span className="font-bold">{cartCount} {lang === "en" ? "item(s)" : "artículo(s)"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg">R$ {cartTotal.toFixed(2)}</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  if (step === "cart") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #0f0500 0%, #0a0300 100%)" }}>
        <div className="relative flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep("menu")} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)" }}>
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <h2 className="text-orange-100 font-black text-lg flex-1">
              {lang === "en" ? "Your Order" : "Tu Pedido"} 🌮
            </h2>
          </div>
          <div className="space-y-3 flex-1">
            {cart.map(item => (
              <div key={item.id} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.15)" }}>
                {item.imageUrl && <img src={item.imageUrl} alt={item.nameEn} className="w-14 h-14 rounded-xl object-cover shrink-0" />}
                <div className="flex-1 min-w-0">
                  <h3 className="text-orange-100 font-bold text-sm truncate">{getItemName(item)}</h3>
                  <p className="text-orange-400 font-black text-sm">R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(220,38,38,0.15)" }}>
                    <Minus className="w-3 h-3 text-orange-400" />
                  </button>
                  <span className="text-orange-100 font-bold w-5 text-center">{item.quantity}</span>
                  <button onClick={() => addToCart({ ...item, categoryId: 0, restaurantId: RESTAURANT_ID, available: true, tags: null, sortOrder: 0, createdAt: new Date(), updatedAt: new Date(), descriptionEn: null, descriptionPt: null, descriptionEs: null } as any)}
                    className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #dc2626, #ea580c)" }}>
                    <Plus className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl p-4" style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.15)" }}>
            <div className="flex justify-between text-orange-100/60 text-sm mb-1"><span>Subtotal</span><span>R$ {cartTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-orange-100 font-black text-lg"><span>Total</span><span className="text-orange-400">R$ {cartTotal.toFixed(2)}</span></div>
          </div>
          <Button className="mt-4 w-full py-6 font-black text-base rounded-2xl border-0 text-white"
            style={{ background: "linear-gradient(135deg, #dc2626, #ea580c)", boxShadow: "0 8px 24px rgba(220,38,38,0.4)" }}
            onClick={() => setStep("order")}>
            {lang === "en" ? "Place Order" : "Hacer Pedido"} →
          </Button>
        </div>
      </div>
    );
  }

  if (step === "order") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #0f0500 0%, #0a0300 100%)" }}>
        <div className="relative flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep("cart")} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)" }}>
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <h2 className="text-orange-100 font-black text-lg flex-1">{lang === "en" ? "Complete your order" : "Completa tu pedido"}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-orange-100/60 text-xs font-medium mb-2 block">{lang === "en" ? "Your name" : "Tu nombre"}</label>
              <input value={studentName} onChange={e => setStudentName(e.target.value)}
                placeholder={lang === "en" ? "Enter your name..." : "Ingresa tu nombre..."}
                className="w-full rounded-xl px-4 py-3 text-orange-100 placeholder-orange-100/30 focus:outline-none transition-colors"
                style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }} />
            </div>
            <div>
              <label className="text-orange-100/60 text-xs font-medium mb-2 block">{lang === "en" ? "Your table" : "Tu mesa"}</label>
              <div className="grid grid-cols-4 gap-2">
                {restaurantTables.map(table => (
                  <button key={table.id} onClick={() => setSelectedTable(table.id)}
                    className="py-3 rounded-xl font-bold text-sm transition-all"
                    style={selectedTable === table.id
                      ? { background: "linear-gradient(135deg, #dc2626, #ea580c)", color: "white" }
                      : { background: "rgba(220,38,38,0.08)", color: "rgba(251,146,60,0.6)", border: "1px solid rgba(220,38,38,0.15)" }}>
                    {table.number}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-2xl p-4" style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.15)" }}>
            <p className="text-orange-100/40 text-xs mb-2">{lang === "en" ? "Order summary" : "Resumen del pedido"}</p>
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm mb-1">
                <span className="text-orange-100/70">{item.quantity}x {getItemName(item)}</span>
                <span className="text-orange-400 font-bold">R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t mt-2 pt-2 flex justify-between font-black text-orange-100" style={{ borderColor: "rgba(220,38,38,0.2)" }}>
              <span>Total</span><span className="text-orange-400">R$ {cartTotal.toFixed(2)}</span>
            </div>
          </div>
          <Button className="mt-4 w-full py-6 font-black text-base rounded-2xl border-0 text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #dc2626, #ea580c)" }}
            disabled={!studentName.trim() || !selectedTable || createOrderMutation.isPending}
            onClick={placeOrder}>
            {createOrderMutation.isPending ? "..." : (lang === "en" ? "🌮 Send Order!" : "🌮 ¡Enviar Pedido!")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "linear-gradient(180deg, #0f0500 0%, #0a0300 100%)" }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="text-8xl mb-6">🌮</motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-2xl font-black text-orange-100 mb-2">{lang === "en" ? "Order placed!" : "¡Pedido enviado!"}</h2>
        <p className="text-orange-100/50 text-sm mb-6">{lang === "en" ? "Your Mexican feast is being prepared! 🇲🇽🔥" : "¡Tu festín mexicano está siendo preparado! 🇲🇽🔥"}</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => { setCart([]); setStep("menu"); setStudentName(""); setSelectedTable(null); }}
            className="border-0 text-white" style={{ background: "linear-gradient(135deg, #dc2626, #ea580c)" }}>
            {lang === "en" ? "Order again" : "Pedir de nuevo"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/")} className="border-orange-900/30 text-orange-100/60 hover:text-orange-100 bg-transparent rounded-xl">
            {lang === "en" ? "Back to home" : "Volver al inicio"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
