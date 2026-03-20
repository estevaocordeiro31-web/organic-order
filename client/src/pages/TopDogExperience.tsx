import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mic, ShoppingCart, Plus, Minus, ChevronRight, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ExperienceFeedback } from "@/components/ExperienceFeedback";
import PartnerVoiceGame from "@/components/PartnerVoiceGame";
import PartnerQASimulation from "@/components/PartnerQASimulation";
import { getRestaurantVoiceConfig } from "@/lib/restaurantVoiceData";

const IMAIND_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/imaind-logo-main-Fx4X8HBTwPWV3N6Pfhh9r9.png";
const TOPDOG_HERO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/topdog-hero-hotdog-TupycygunEJD2NAKgy66sf.webp";
const TOPDOG_FRIES = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/topdog-fries-6VdgJFBzFsAJBxHJUkxrUq.webp";
const TOPDOG_CHILLI = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/topdog-chilli-pepper-aMJHaVwfKhHkHXzLJFjVXN.webp";
const TOPDOG_MAX = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/topdog-max-topdog-bXHQJDDPuNmVBKCBNYHLHm.webp";

// Restaurant ID for Top Dog Brasil
const RESTAURANT_ID = 2;

type CartItem = {
  id: number;
  nameEn: string;
  namePt: string;
  nameEs: string;
  price: string;
  quantity: number;
  imageUrl?: string | null;
};

type Step = "menu" | "cart" | "order" | "done" | "feedback" | "voice" | "qa";

export default function TopDogExperience() {
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
  const voiceConfig = useMemo(() => getRestaurantVoiceConfig("topdog"), []);

  function addToCart(item: typeof items[0]) {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { id: item.id, nameEn: item.nameEn, namePt: item.namePt, nameEs: item.nameEs ?? item.nameEn, price: item.price, quantity: 1, imageUrl: item.imageUrl }];
    });
  }

  function removeFromCart(id: number) {
    setCart(prev => {
      const existing = prev.find(c => c.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c);
      }
      return prev.filter(c => c.id !== id);
    });
  }

  function getItemQty(id: number) {
    return cart.find(c => c.id === id)?.quantity ?? 0;
  }

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
        items: cart.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      });
      setStep("done");
    } catch (e) {
      console.error(e);
    }
  }

  // ===== VOICE ORDER =====
  if (step === "voice" && voiceConfig) {
    return (
      <PartnerVoiceGame
        lang={lang}
        phrases={lang === "en" ? voiceConfig.phrasesEn : voiceConfig.phrasesEs}
        accentColor={voiceConfig.accentColor}
        bgColor={voiceConfig.bgColor}
        restaurantName="Top Dog Brasil"
        waiterEmoji={voiceConfig.waiterEmoji}
        onBack={() => setStep("menu")}
      />
    );
  }

  // ===== QA SIMULATION =====
  if (step === "qa" && voiceConfig) {
    return (
      <PartnerQASimulation
        lang={lang}
        questions={lang === "en" ? voiceConfig.qaEn : voiceConfig.qaEs}
        accentColor={voiceConfig.accentColor}
        bgColor={voiceConfig.bgColor}
        restaurantName="Top Dog Brasil"
        waiterEmoji={voiceConfig.waiterEmoji}
        waiterName={lang === "en" ? voiceConfig.waiterNameEn : voiceConfig.waiterNameEs}
        welcomeMessage={lang === "en" ? voiceConfig.welcomeEn : voiceConfig.welcomeEs}
        onBack={() => setStep("menu")}
      />
    );
  }

  // ===== MENU SCREEN =====
  if (step === "menu") {
    return (
      <div className="min-h-screen bg-[#0d0505] flex flex-col relative overflow-hidden">
        {/* Neon red glow background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-700/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-900/15 rounded-full blur-3xl" />
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "linear-gradient(#ef4444 1px, transparent 1px), linear-gradient(90deg, #ef4444 1px, transparent 1px)", backgroundSize: "40px 40px" }}
          />
        </div>

        {/* Hero banner */}
        <div className="relative h-48 overflow-hidden">
          <img src={TOPDOG_HERO} alt="Top Dog" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#0d0505]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0505]/80 to-transparent" />

          {/* Header overlay */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-3">
            <button onClick={() => navigate(`/?lang=${lang}&voice=${voiceMode ? "1" : "0"}`)}
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:bg-black/70 transition-colors border border-white/10">
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <img src={IMAIND_LOGO} alt="ImAInd" className="w-7 h-7 object-contain" />
            <div className="flex-1">
              <h1 className="text-white font-black text-base leading-tight tracking-tight">TOP DOG BRASIL</h1>
              <p className="text-red-400 text-xs font-medium">🌭 Cachorreria Prensada · Jundiaí</p>
            </div>
            {voiceMode && (
              <div className="flex gap-1">
                <button onClick={() => setStep("voice")} className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center" title="Voice Order">
                  <Mic className="w-3.5 h-3.5 text-blue-400" />
                </button>
                <button onClick={() => setStep("qa")} className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center" title="Q&A Simulation">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                </button>
              </div>
            )}
          </div>

          {/* Tagline */}
          <div className="absolute bottom-4 left-4">
            <p className="text-white/80 text-sm font-bold italic">
              {lang === "en" ? '"The simple done right"' : '"Lo simple hecho bien"'}
            </p>
          </div>
        </div>

        {/* Category tabs */}
        <div className="relative px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {isLoading ? (
              <div className="flex gap-2">
                {[1,2,3].map(i => <div key={i} className="h-8 w-20 bg-white/10 rounded-full animate-pulse" />)}
              </div>
            ) : categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeCategoryId === cat.id
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                    : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                }`}
              >
                {cat.icon} {getItemName(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Menu items */}
        <div className="relative flex-1 px-4 pb-28 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item, i) => {
                const qty = getItemQty(item.id);
                const itemImage = item.imageUrl ?? (i === 0 ? TOPDOG_CHILLI : i === 1 ? TOPDOG_MAX : null);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl border border-red-900/30 bg-gradient-to-r from-[#1a0808] to-[#120505] overflow-hidden flex"
                  >
                    {itemImage && (
                      <div className="w-24 h-24 shrink-0 overflow-hidden">
                        <img src={itemImage} alt={item.nameEn} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <div>
                        <h3 className="text-white font-bold text-sm leading-tight">{getItemName(item)}</h3>
                        <p className="text-white/40 text-xs mt-0.5 line-clamp-2">
                          {lang === "es" ? item.descriptionEs ?? item.descriptionEn : item.descriptionEn}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-red-400 font-black text-sm">R$ {parseFloat(item.price).toFixed(2)}</span>
                        <div className="flex items-center gap-2">
                          {qty > 0 && (
                            <>
                              <button onClick={() => removeFromCart(item.id)}
                                className="w-7 h-7 rounded-full bg-red-900/50 flex items-center justify-center hover:bg-red-800 transition-colors">
                                <Minus className="w-3 h-3 text-white" />
                              </button>
                              <span className="text-white font-bold text-sm w-4 text-center">{qty}</span>
                            </>
                          )}
                          <button onClick={() => addToCart(item)}
                            className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg shadow-red-600/30">
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

        {/* Cart FAB */}
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto z-50"
          >
            <button
              onClick={() => setStep("cart")}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl py-4 px-6 flex items-center justify-between shadow-2xl shadow-red-600/40 hover:from-red-500 hover:to-red-600 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
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

  // ===== CART SCREEN =====
  if (step === "cart") {
    return (
      <div className="min-h-screen bg-[#0d0505] flex flex-col">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-700/10 rounded-full blur-3xl" />
        </div>

        <div className="relative flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep("menu")}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <h2 className="text-white font-black text-lg flex-1">
              {lang === "en" ? "Your Order" : "Tu Pedido"} 🌭
            </h2>
          </div>

          <div className="space-y-3 flex-1">
            {cart.map(item => (
              <div key={item.id} className="rounded-2xl border border-red-900/30 bg-[#1a0808] p-4 flex items-center gap-3">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.nameEn} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm truncate">{getItemName(item)}</h3>
                  <p className="text-red-400 font-black text-sm">R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => removeFromCart(item.id)}
                    className="w-8 h-8 rounded-full bg-red-900/50 flex items-center justify-center hover:bg-red-800 transition-colors">
                    <Minus className="w-3 h-3 text-white" />
                  </button>
                  <span className="text-white font-bold w-5 text-center">{item.quantity}</span>
                  <button onClick={() => addToCart({ ...item, categoryId: 0, restaurantId: RESTAURANT_ID, available: true, tags: null, sortOrder: 0, createdAt: new Date(), updatedAt: new Date(), descriptionEn: null, descriptionPt: null, descriptionEs: null } as any)}
                    className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-500 transition-colors">
                    <Plus className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-red-900/30 bg-[#1a0808] p-4">
            <div className="flex justify-between text-white/60 text-sm mb-1">
              <span>{lang === "en" ? "Subtotal" : "Subtotal"}</span>
              <span>R$ {cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-black text-lg">
              <span>Total</span>
              <span className="text-red-400">R$ {cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <Button
            className="mt-4 w-full py-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-base rounded-2xl shadow-2xl shadow-red-600/30 border-0"
            onClick={() => setStep("order")}
          >
            {lang === "en" ? "Place Order" : "Hacer Pedido"} →
          </Button>
        </div>
      </div>
    );
  }

  // ===== ORDER FORM =====
  if (step === "order") {
    return (
      <div className="min-h-screen bg-[#0d0505] flex flex-col">
        <div className="relative flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep("cart")}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <h2 className="text-white font-black text-lg flex-1">
              {lang === "en" ? "Complete your order" : "Completa tu pedido"}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-xs font-medium mb-2 block">
                {lang === "en" ? "Your name" : "Tu nombre"}
              </label>
              <input
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                placeholder={lang === "en" ? "Enter your name..." : "Ingresa tu nombre..."}
                className="w-full bg-white/5 border border-red-900/30 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-white/60 text-xs font-medium mb-2 block">
                {lang === "en" ? "Your table" : "Tu mesa"}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {restaurantTables.map(table => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table.id)}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${
                      selectedTable === table.id
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                        : "bg-white/5 text-white/60 border border-red-900/20 hover:bg-white/10"
                    }`}
                  >
                    {table.number}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-red-900/30 bg-[#1a0808] p-4">
            <p className="text-white/40 text-xs mb-2">{lang === "en" ? "Order summary" : "Resumen del pedido"}</p>
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm mb-1">
                <span className="text-white/70">{item.quantity}x {getItemName(item)}</span>
                <span className="text-red-400 font-bold">R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-red-900/30 mt-2 pt-2 flex justify-between font-black text-white">
              <span>Total</span>
              <span className="text-red-400">R$ {cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <Button
            className="mt-4 w-full py-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-base rounded-2xl shadow-2xl shadow-red-600/30 border-0 disabled:opacity-50"
            disabled={!studentName.trim() || !selectedTable || createOrderMutation.isPending}
            onClick={placeOrder}
          >
            {createOrderMutation.isPending
              ? (lang === "en" ? "Placing order..." : "Enviando pedido...")
              : (lang === "en" ? "🌭 Send Order!" : "🌭 ¡Enviar Pedido!")}
          </Button>
        </div>
      </div>
    );
  }

  // ===== DONE =====
  if (step === "done") {
    return (
      <div className="min-h-screen bg-[#0d0505] flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="text-8xl mb-6">
          🌭
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-black text-white mb-2">
            {lang === "en" ? "Order placed!" : "¡Pedido enviado!"}
          </h2>
          <p className="text-white/50 text-sm mb-6">
            {lang === "en"
              ? "Your hot dog is being prepared. The simple done right! 🔥"
              : "Tu hot dog está siendo preparado. ¡Lo simple hecho bien! 🔥"}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button onClick={() => setStep("feedback")} className="bg-red-600 hover:bg-red-500 text-white border-0 rounded-xl">
              {lang === "en" ? "Rate experience" : "Calificar experiencia"}
            </Button>
            {voiceMode && (
              <>
                <Button onClick={() => setStep("voice")} className="bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-xl">
                  🎙️ {lang === "en" ? "Voice Practice" : "Práctica de Voz"}
                </Button>
                <Button onClick={() => setStep("qa")} className="bg-purple-600 hover:bg-purple-500 text-white border-0 rounded-xl">
                  💬 {lang === "en" ? "Q&A Simulation" : "Simulación"}
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => { setCart([]); setStep("menu"); setStudentName(""); setSelectedTable(null); }} className="border-white/20 text-white/60 hover:text-white bg-transparent rounded-xl">
              {lang === "en" ? "Order again" : "Pedir de nuevo"}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ===== FEEDBACK =====
  return (
    <ExperienceFeedback
      restaurantName="Top Dog Brasil"
      restaurantId={RESTAURANT_ID}
      language={lang}
      onClose={() => navigate("/")}
    />
  );
}
