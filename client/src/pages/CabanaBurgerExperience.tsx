import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Flame, ChevronLeft, Plus, Minus, X, Zap } from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/cabana-hero-burger-iftcYRCSCCQwPF6cjbRChe.webp";
const WAGYU_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/cabana-wagyu-burger-Af6GrEr8odKcKUP3fmaCJP.webp";
const FRIES_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/cabana-truffle-fries-dfBXLhmXA8gFogSJVG47Fu.webp";
const SHAKE_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/cabana-biscoff-shake-2F3tGXBFqnKtcLDSTfpJCm.webp";

const RESTAURANT_ID = 30001; // Cabana Burger

interface CartItem {
  id: number;
  name: string | null;
  nameEn: string | null;
  nameEs: string | null;
  price: number;
  quantity: number;
}

const categoryImages: Record<string, string> = {
  "Signature": HERO_IMAGE,
  "Wagyu 200g": WAGYU_IMAGE,
  "Truffle Line": WAGYU_IMAGE,
  "Starters": FRIES_IMAGE,
  "Desserts": SHAKE_IMAGE,
  "Drinks": SHAKE_IMAGE,
  "Smash": HERO_IMAGE,
  "Ultrasmash": HERO_IMAGE,
};

export default function CabanaBurgerExperience() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const lang = (params.get("lang") || "en") as "en" | "es";
  const voiceMode = params.get("voice") === "true";
  const tableNumber = params.get("table") || "1";

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"menu" | "games" | "facts">("menu");

  const { data: restaurantMenu } = trpc.restaurant.menu.useQuery({ restaurantId: RESTAURANT_ID });
  const categories = restaurantMenu?.categories;
  const allMenuItems = restaurantMenu?.items;

  const createOrder = trpc.order.create.useMutation({
    onSuccess: (data) => {
      setOrderId(data.orderId);
      setOrderPlaced(true);
    },
  });

  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategory) {
      setSelectedCategory(String(categories[0].id));
    }
  }, [categories]);

  const getName = (item: { namePt?: string | null; name?: string | null; nameEn?: string | null; nameEs?: string | null }) => {
    if (lang === "en") return item.nameEn || item.namePt || item.name || "";
    if (lang === "es") return item.nameEs || item.namePt || item.name || "";
    return item.namePt || item.name || "";
  };

  const addToCart = (item: { id: number; name: string | null; nameEn?: string | null; nameEs?: string | null; price: number }) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, {
        id: item.id,
        name: item.name,
        nameEn: item.nameEn || item.name,
        nameEs: item.nameEs || item.name,
        price: item.price,
        quantity: 1,
      }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c);
      }
      return prev.filter(c => c.id !== id);
    });
  };

  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalPrice = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const handleOrder = () => {
    if (cart.length === 0) return;
    createOrder.mutate({
      tableId: parseInt(tableNumber),
      studentName: lang === "en" ? "Guest" : "Invitado",
      items: cart.map(c => ({ menuItemId: c.id, quantity: c.quantity, unitPrice: String(c.price) })),
    });
  };

  const burgerFacts = lang === "en" ? [
    { emoji: "🐄", title: "Wagyu Beef", fact: "Wagyu cattle are massaged daily and fed a special diet. Their beef has incredible marbling!" },
    { emoji: "🧀", title: "American Cheese", fact: "American cheese melts perfectly because of its emulsifying salts — that's the secret to the perfect cheeseburger!" },
    { emoji: "🍔", title: "Smash Burger", fact: "Smashing the patty on a hot griddle creates the Maillard reaction — that's the science behind the crispy, flavorful crust!" },
    { emoji: "🌶️", title: "Jalapeño", fact: "Jalapeños are named after Jalapa, Mexico. The heat comes from capsaicin, which triggers pain receptors!" },
    { emoji: "🍟", title: "Truffle Fries", fact: "Truffles are fungi that grow underground and are found by trained pigs or dogs. They're one of the world's most expensive foods!" },
  ] : [
    { emoji: "🐄", title: "Carne Wagyu", fact: "El ganado Wagyu recibe masajes diarios y una dieta especial. ¡Su carne tiene un marmoleado increíble!" },
    { emoji: "🧀", title: "Queso Americano", fact: "El queso americano se derrite perfectamente gracias a sus sales emulsificantes — ¡ese es el secreto de la hamburguesa perfecta!" },
    { emoji: "🍔", title: "Smash Burger", fact: "Aplastar la carne en una plancha caliente crea la reacción de Maillard — ¡esa es la ciencia detrás de la corteza crujiente y sabrosa!" },
    { emoji: "🌶️", title: "Jalapeño", fact: "Los jalapeños llevan el nombre de Jalapa, México. ¡El picante proviene de la capsaicina, que activa los receptores del dolor!" },
    { emoji: "🍟", title: "Papas Trufadas", fact: "Las trufas son hongos que crecen bajo tierra y son encontradas por cerdos o perros entrenados. ¡Son uno de los alimentos más caros del mundo!" },
  ];

  const orderGames = lang === "en" ? [
    { title: "How to order like a local 🇺🇸", phrases: [
      "I'd like the Cabana Burger, please.",
      "Can I get the Wagyu with extra cheese?",
      "I'll have the Truffle Fries on the side.",
      "Could I substitute the fries for onion rings?",
      "What do you recommend today?",
    ]},
  ] : [
    { title: "Cómo pedir como un local 🇪🇸", phrases: [
      "Quisiera la Cabana Burger, por favor.",
      "¿Me puede dar la Wagyu con queso extra?",
      "Voy a pedir las Papas Trufadas de acompañamiento.",
      "¿Puedo cambiar las papas por aros de cebolla?",
      "¿Qué me recomienda hoy?",
    ]},
  ];

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6 animate-bounce">🍔</div>
          <h1 className="text-4xl font-black text-yellow-400 mb-4">
            {lang === "en" ? "Order Placed!" : "¡Pedido Realizado!"}
          </h1>
          <p className="text-white/80 text-lg mb-2">
            {lang === "en"
              ? `Your order #${orderId} is being prepared!`
              : `¡Tu pedido #${orderId} está siendo preparado!`}
          </p>
          <p className="text-yellow-400/70 mb-8">
            {lang === "en" ? "Table" : "Mesa"} {tableNumber} • Cabana Burger Jundiaí
          </p>
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-6 mb-8">
            <p className="text-yellow-300 font-bold text-lg mb-2">
              {lang === "en" ? "🎯 Practice while you wait!" : "🎯 ¡Practica mientras esperas!"}
            </p>
            <p className="text-white/70 text-sm">
              {lang === "en"
                ? "Ask your waiter: \"How long will it take?\" or \"Could I get some water, please?\""
                : "Pregúntale al mesero: \"¿Cuánto tardará?\" o \"¿Me podría traer agua, por favor?\""}
            </p>
          </div>
          <Button
            onClick={() => setLocation("/")}
            className="bg-yellow-400 text-black hover:bg-yellow-300 font-black text-lg px-8 py-4 rounded-full"
          >
            {lang === "en" ? "Back to Home" : "Volver al Inicio"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-yellow-400/20">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-bold text-sm">ImAInd</span>
          </button>
          <div className="text-center">
            <div className="text-yellow-400 font-black text-lg tracking-tight">CABANA BURGER</div>
            <div className="text-white/50 text-xs">
              {lang === "en" ? "Table" : "Mesa"} {tableNumber} •{" "}
              {lang === "en" ? "🇺🇸 English" : "🇪🇸 Español"}
            </div>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative p-2 bg-yellow-400 rounded-full text-black"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-56 overflow-hidden">
        <img src={HERO_IMAGE} alt="Cabana Burger" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest">
              {lang === "en" ? "Premium Burgers · Jundiaí" : "Hamburguesas Premium · Jundiaí"}
            </span>
          </div>
          <h1 className="text-3xl font-black text-white leading-none">
            {lang === "en" ? "Top burgers for\ntop moments ✌️" : "Las mejores burguer\npara los mejores momentos ✌️"}
          </h1>
        </div>
        {voiceMode && (
          <div className="absolute top-4 right-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {lang === "en" ? "Voice Mode" : "Modo Voz"}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-black sticky top-[61px] z-40">
        {(["menu", "games", "facts"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {tab === "menu" ? (lang === "en" ? "🍔 Menu" : "🍔 Menú") :
             tab === "games" ? (lang === "en" ? "🎯 Practice" : "🎯 Practica") :
             (lang === "en" ? "💡 Fun Facts" : "💡 Curiosidades")}
          </button>
        ))}
      </div>

      {/* Menu Tab */}
      {activeTab === "menu" && (
        <div className="pb-24">
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(String(cat.id))}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === String(cat.id)
                    ? "bg-yellow-400 text-black"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {getName(cat)}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="px-4 space-y-3">
            {allMenuItems?.filter((item) =>
              !selectedCategory || item.categoryId === parseInt(selectedCategory)
            ).map((item) => (
              <div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-yellow-400/40 transition-all group"
              >
                <div className="flex gap-3 p-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-black text-white text-base leading-tight group-hover:text-yellow-400 transition-colors">
                        {getName(item)}
                      </h3>
                      {(item as any).isPopular && (
                        <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30 text-xs flex-shrink-0">
                          <Star className="w-3 h-3 mr-1" />
                          {lang === "en" ? "Popular" : "Popular"}
                        </Badge>
                      )}
                    </div>
                    {item.descriptionEn && (
                      <p className="text-white/50 text-xs mb-3 leading-relaxed line-clamp-2">
                        {lang === "en" ? item.descriptionEn : item.descriptionEs || item.descriptionPt}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-400 font-black text-lg">
                        R$ {parseFloat(String(item.price)).toFixed(2).replace(".", ",")}
                      </span>
                      <button
                        onClick={() => addToCart({ id: item.id, name: item.namePt, nameEn: item.nameEn, nameEs: item.nameEs, price: parseFloat(String(item.price)) })}
                        className="bg-yellow-400 hover:bg-yellow-300 text-black rounded-full p-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Practice Tab */}
      {activeTab === "games" && (
        <div className="p-4 pb-24 space-y-4">
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-4">
            <h2 className="text-yellow-400 font-black text-xl mb-1">
              {lang === "en" ? "🎯 Practice your English!" : "🎯 ¡Practica tu Español!"}
            </h2>
            <p className="text-white/60 text-sm">
              {lang === "en"
                ? "Use these phrases to order like a native speaker at Cabana Burger!"
                : "¡Usa estas frases para pedir como un nativo en Cabana Burger!"}
            </p>
          </div>
          {orderGames.map((game, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h3 className="font-black text-white mb-3">{game.title}</h3>
              <div className="space-y-2">
                {game.phrases.map((phrase, j) => (
                  <div key={j} className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3">
                    <p className="text-yellow-300 font-medium text-sm">"{phrase}"</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="font-black text-white mb-3">
              {lang === "en" ? "🍔 Burger Vocabulary" : "🍔 Vocabulario de Hamburguesas"}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {(lang === "en" ? [
                { word: "Patty", meaning: "The meat disc" },
                { word: "Bun", meaning: "The bread" },
                { word: "Smash", meaning: "To press flat" },
                { word: "Wagyu", meaning: "Premium Japanese beef" },
                { word: "Truffle", meaning: "Luxury underground fungus" },
                { word: "Medium rare", meaning: "Pink inside" },
              ] : [
                { word: "Medallón", meaning: "El disco de carne" },
                { word: "Pan", meaning: "El pan de hamburguesa" },
                { word: "Aplastar", meaning: "Presionar hasta aplanar" },
                { word: "Wagyu", meaning: "Carne japonesa premium" },
                { word: "Trufa", meaning: "Hongo subterráneo de lujo" },
                { word: "Término medio", meaning: "Rosado por dentro" },
              ]).map((v, j) => (
                <div key={j} className="bg-black/40 rounded-xl p-3">
                  <p className="text-yellow-400 font-black text-sm">{v.word}</p>
                  <p className="text-white/50 text-xs">{v.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fun Facts Tab */}
      {activeTab === "facts" && (
        <div className="p-4 pb-24 space-y-4">
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-4">
            <h2 className="text-yellow-400 font-black text-xl mb-1">
              {lang === "en" ? "💡 Did you know?" : "💡 ¿Sabías que?"}
            </h2>
            <p className="text-white/60 text-sm">
              {lang === "en"
                ? "Fascinating facts about the food you're about to enjoy!"
                : "¡Datos fascinantes sobre la comida que estás a punto de disfrutar!"}
            </p>
          </div>
          {burgerFacts.map((fact, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-yellow-400/30 transition-all">
              <div className="flex items-start gap-3">
                <span className="text-4xl">{fact.emoji}</span>
                <div>
                  <h3 className="font-black text-yellow-400 mb-1">{fact.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{fact.fact}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="bg-gradient-to-br from-yellow-400/20 to-black border border-yellow-400/30 rounded-2xl p-4">
            <h3 className="font-black text-yellow-400 text-lg mb-2">
              {lang === "en" ? "🌍 Burger Culture" : "🌍 Cultura de la Hamburguesa"}
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              {lang === "en"
                ? "The hamburger was named after Hamburg, Germany, where minced beef patties were popular in the 19th century. American immigrants brought the recipe to the US, where it became a cultural icon!"
                : "La hamburguesa lleva el nombre de Hamburgo, Alemania, donde las albóndigas de carne picada eran populares en el siglo XIX. ¡Los inmigrantes americanos llevaron la receta a EE.UU., donde se convirtió en un ícono cultural!"}
            </p>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowCart(false)} />
          <div className="relative w-full bg-zinc-900 border-t border-yellow-400/30 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-white">
                {lang === "en" ? "Your Order" : "Tu Pedido"}
              </h2>
              <button onClick={() => setShowCart(false)} className="text-white/50 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            {cart.length === 0 ? (
              <p className="text-white/50 text-center py-8">
                {lang === "en" ? "Your cart is empty" : "Tu carrito está vacío"}
              </p>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">
                          {lang === "en" ? item.nameEn : item.nameEs}
                        </p>
                        <p className="text-yellow-400 text-sm">
                          R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="bg-white/10 rounded-full p-1 hover:bg-white/20"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => addToCart({ id: item.id, name: item.name, nameEn: item.nameEn, nameEs: item.nameEs, price: parseFloat(String(item.price)) })}
                          className="bg-yellow-400/20 rounded-full p-1 hover:bg-yellow-400/30"
                        >
                          <Plus className="w-3 h-3 text-yellow-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-4 mb-4">
                  <div className="flex justify-between text-white font-black text-lg">
                    <span>{lang === "en" ? "Total" : "Total"}</span>
                    <span className="text-yellow-400">R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>
                <Button
                  onClick={handleOrder}
                  disabled={createOrder.isPending}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black text-lg py-6 rounded-2xl"
                >
                  {createOrder.isPending
                    ? (lang === "en" ? "Placing order..." : "Realizando pedido...")
                    : (lang === "en" ? "Place Order 🍔" : "Realizar Pedido 🍔")}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Cart Button */}
      {totalItems > 0 && !showCart && (
        <div className="fixed bottom-6 left-4 right-4 z-40">
          <button
            onClick={() => setShowCart(true)}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black text-lg py-4 rounded-2xl flex items-center justify-between px-6 shadow-2xl shadow-yellow-400/30"
          >
            <span className="bg-black/20 rounded-full px-3 py-1 text-sm">{totalItems}</span>
            <span>{lang === "en" ? "View Order" : "Ver Pedido"}</span>
            <span>R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
