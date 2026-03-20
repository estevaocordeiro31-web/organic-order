import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Mic, ShoppingCart, Plus, Minus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ExperienceFeedback } from "@/components/ExperienceFeedback";

const IMAIND_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/imaind-logo-main-Fx4X8HBTwPWV3N6Pfhh9r9.png";
const LAGUAPA_HERO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/laguapa-hero-empanadas-gmhHnbSCF8JM5DxBXEoXFA.webp";
const LAGUAPA_SALTENA = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/laguapa-empanada-saltena-K8wzS6WbjBnpk9BtJRPRzL.webp";
const LAGUAPA_COMBO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/laguapa-combo-6-8TBRqNFiGBKbRHCm7XBFXR.webp";
const LAGUAPA_ALFAJOR = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/laguapa-alfajor-8TBRqNFiGBKbRHCm7XBFXR.webp";

const RESTAURANT_ID = 3;

type CartItem = {
  id: number;
  nameEn: string;
  namePt: string;
  nameEs: string;
  price: string;
  quantity: number;
  imageUrl?: string | null;
};

type Step = "menu" | "cart" | "order" | "done" | "feedback";

// Image map for La Guapa items
const ITEM_IMAGES: Record<string, string> = {
  "Toscana Empanada": LAGUAPA_HERO,
  "Salteña Empanada": LAGUAPA_SALTENA,
  "Guapa Menu": LAGUAPA_COMBO,
  "6 Empanadas Combo": LAGUAPA_COMBO,
  "Artisan Alfajor": LAGUAPA_ALFAJOR,
};

export default function LaGuapaExperience() {
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
      <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "linear-gradient(180deg, #1a1205 0%, #0f0c05 100%)" }}>
        {/* Warm terracotta glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-3xl opacity-30"
            style={{ background: "radial-gradient(ellipse, #d97706 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{ background: "radial-gradient(ellipse, #92400e 0%, transparent 70%)" }} />
          {/* Subtle texture dots */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "radial-gradient(#f59e0b 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        </div>

        {/* Hero banner */}
        <div className="relative h-52 overflow-hidden">
          <img src={LAGUAPA_HERO} alt="La Guapa" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(26,18,5,0.4) 0%, transparent 40%, rgba(15,12,5,1) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(15,12,5,0.85) 0%, transparent 60%)" }} />

          <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-3">
            <button onClick={() => navigate(`/?lang=${lang}&voice=${voiceMode ? "1" : "0"}`)}
              className="w-9 h-9 rounded-full backdrop-blur flex items-center justify-center hover:bg-black/40 transition-colors border border-amber-900/30"
              style={{ background: "rgba(0,0,0,0.4)" }}>
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <img src={IMAIND_LOGO} alt="ImAInd" className="w-7 h-7 object-contain" />
            <div className="flex-1">
              <h1 className="text-white font-black text-base leading-tight" style={{ fontFamily: "Georgia, serif" }}>LA GUAPA</h1>
              <p className="text-amber-400 text-xs font-medium">🥟 Empanadas Artesanais · Jundiaí</p>
            </div>
            {voiceMode && <Mic className="w-4 h-4 text-blue-400" />}
          </div>

          <div className="absolute bottom-4 left-4">
            <p className="text-amber-200/80 text-sm font-medium italic" style={{ fontFamily: "Georgia, serif" }}>
              {lang === "en" ? '"Handcrafted with love from Argentina"' : '"Hecho con amor desde Argentina"'}
            </p>
          </div>
        </div>

        {/* Category tabs - rustic style */}
        <div className="relative px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {isLoading ? (
              <div className="flex gap-2">{[1,2,3].map(i => <div key={i} className="h-8 w-24 bg-amber-900/20 rounded-full animate-pulse" />)}</div>
            ) : categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeCategoryId === cat.id
                    ? "text-[#1a1205] shadow-lg"
                    : "text-amber-400/70 hover:text-amber-300"
                }`}
                style={activeCategoryId === cat.id ? { background: "linear-gradient(135deg, #f59e0b, #d97706)" } : { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
              >
                {cat.icon} {getItemName(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Menu items */}
        <div className="relative flex-1 px-4 pb-28 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "rgba(245,158,11,0.05)" }} />)}</div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item, i) => {
                const qty = getItemQty(item.id);
                const itemImage = item.imageUrl ?? ITEM_IMAGES[item.nameEn] ?? null;
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-2xl overflow-hidden flex"
                    style={{ background: "linear-gradient(135deg, rgba(26,18,5,0.9), rgba(15,12,5,0.95))", border: "1px solid rgba(245,158,11,0.15)" }}>
                    {itemImage && (
                      <div className="w-24 h-24 shrink-0 overflow-hidden">
                        <img src={itemImage} alt={item.nameEn} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <div>
                        <h3 className="text-amber-100 font-bold text-sm leading-tight">{getItemName(item)}</h3>
                        <p className="text-amber-100/40 text-xs mt-0.5 line-clamp-2">
                          {lang === "es" ? item.descriptionEs ?? item.descriptionEn : item.descriptionEn}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-amber-400 font-black text-sm">R$ {parseFloat(item.price).toFixed(2)}</span>
                        <div className="flex items-center gap-2">
                          {qty > 0 && (
                            <>
                              <button onClick={() => removeFromCart(item.id)}
                                className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                                style={{ background: "rgba(245,158,11,0.2)" }}>
                                <Minus className="w-3 h-3 text-amber-400" />
                              </button>
                              <span className="text-amber-100 font-bold text-sm w-4 text-center">{qty}</span>
                            </>
                          )}
                          <button onClick={() => addToCart(item)}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity shadow-lg"
                            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                            <Plus className="w-3 h-3 text-[#1a1205]" />
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
              className="w-full text-[#1a1205] rounded-2xl py-4 px-6 flex items-center justify-between shadow-2xl hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 8px 32px rgba(245,158,11,0.4)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(26,18,5,0.2)" }}>
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
      <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #1a1205 0%, #0f0c05 100%)" }}>
        <div className="relative flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep("menu")} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <h2 className="text-amber-100 font-black text-lg flex-1" style={{ fontFamily: "Georgia, serif" }}>
              {lang === "en" ? "Your Order" : "Tu Pedido"} 🥟
            </h2>
          </div>
          <div className="space-y-3 flex-1">
            {cart.map(item => (
              <div key={item.id} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}>
                {item.imageUrl && <img src={item.imageUrl} alt={item.nameEn} className="w-14 h-14 rounded-xl object-cover shrink-0" />}
                <div className="flex-1 min-w-0">
                  <h3 className="text-amber-100 font-bold text-sm truncate">{getItemName(item)}</h3>
                  <p className="text-amber-400 font-black text-sm">R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(245,158,11,0.15)" }}>
                    <Minus className="w-3 h-3 text-amber-400" />
                  </button>
                  <span className="text-amber-100 font-bold w-5 text-center">{item.quantity}</span>
                  <button onClick={() => addToCart({ ...item, categoryId: 0, restaurantId: RESTAURANT_ID, available: true, tags: null, sortOrder: 0, createdAt: new Date(), updatedAt: new Date(), descriptionEn: null, descriptionPt: null, descriptionEs: null } as any)}
                    className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                    <Plus className="w-3 h-3 text-[#1a1205]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl p-4" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <div className="flex justify-between text-amber-100/60 text-sm mb-1"><span>Subtotal</span><span>R$ {cartTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-amber-100 font-black text-lg"><span>Total</span><span className="text-amber-400">R$ {cartTotal.toFixed(2)}</span></div>
          </div>
          <Button className="mt-4 w-full py-6 font-black text-base rounded-2xl border-0 text-[#1a1205]"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 8px 24px rgba(245,158,11,0.3)" }}
            onClick={() => setStep("order")}>
            {lang === "en" ? "Place Order" : "Hacer Pedido"} →
          </Button>
        </div>
      </div>
    );
  }

  if (step === "order") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #1a1205 0%, #0f0c05 100%)" }}>
        <div className="relative flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep("cart")} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <h2 className="text-amber-100 font-black text-lg flex-1">{lang === "en" ? "Complete your order" : "Completa tu pedido"}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-amber-100/60 text-xs font-medium mb-2 block">{lang === "en" ? "Your name" : "Tu nombre"}</label>
              <input value={studentName} onChange={e => setStudentName(e.target.value)}
                placeholder={lang === "en" ? "Enter your name..." : "Ingresa tu nombre..."}
                className="w-full rounded-xl px-4 py-3 text-amber-100 placeholder-amber-100/30 focus:outline-none transition-colors"
                style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }} />
            </div>
            <div>
              <label className="text-amber-100/60 text-xs font-medium mb-2 block">{lang === "en" ? "Your table" : "Tu mesa"}</label>
              <div className="grid grid-cols-4 gap-2">
                {restaurantTables.map(table => (
                  <button key={table.id} onClick={() => setSelectedTable(table.id)}
                    className="py-3 rounded-xl font-bold text-sm transition-all"
                    style={selectedTable === table.id
                      ? { background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#1a1205" }
                      : { background: "rgba(245,158,11,0.08)", color: "rgba(245,158,11,0.6)", border: "1px solid rgba(245,158,11,0.15)" }}>
                    {table.number}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-2xl p-4" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <p className="text-amber-100/40 text-xs mb-2">{lang === "en" ? "Order summary" : "Resumen del pedido"}</p>
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm mb-1">
                <span className="text-amber-100/70">{item.quantity}x {getItemName(item)}</span>
                <span className="text-amber-400 font-bold">R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t mt-2 pt-2 flex justify-between font-black text-amber-100" style={{ borderColor: "rgba(245,158,11,0.2)" }}>
              <span>Total</span><span className="text-amber-400">R$ {cartTotal.toFixed(2)}</span>
            </div>
          </div>
          <Button className="mt-4 w-full py-6 font-black text-base rounded-2xl border-0 text-[#1a1205] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
            disabled={!studentName.trim() || !selectedTable || createOrderMutation.isPending}
            onClick={placeOrder}>
            {createOrderMutation.isPending ? "..." : (lang === "en" ? "🥟 Send Order!" : "🥟 ¡Enviar Pedido!")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "linear-gradient(180deg, #1a1205 0%, #0f0c05 100%)" }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="text-8xl mb-6">🥟</motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-2xl font-black text-amber-100 mb-2">{lang === "en" ? "Order placed!" : "¡Pedido enviado!"}</h2>
        <p className="text-amber-100/50 text-sm mb-6">{lang === "en" ? "Your empanadas are being prepared with love! 🇦🇷" : "¡Tus empanadas se están preparando con amor! 🇦🇷"}</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => setStep("feedback")}
            className="border-0 text-[#1a1205]" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
            {lang === "en" ? "Rate experience" : "Calificar experiencia"}
          </Button>
          <Button variant="outline" onClick={() => { setCart([]); setStep("menu"); setStudentName(""); setSelectedTable(null); }} className="border-amber-900/30 text-amber-100/60 hover:text-amber-100 bg-transparent rounded-xl">
            {lang === "en" ? "Order again" : "Pedir de nuevo"}
          </Button>
        </div>
      </motion.div>
    </div>
  );

  // ===== FEEDBACK =====
  if (step === "feedback") {
    return (
      <ExperienceFeedback
        restaurantName="La Guapa"
        restaurantId={RESTAURANT_ID}
        language={lang}
        onClose={() => navigate("/")}
      />
    );
  }
}
