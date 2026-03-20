import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight, Mic, Construction, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const IMAIND_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/imaind-logo-main-Fx4X8HBTwPWV3N6Pfhh9r9.png";

const RESTAURANT_CONFIG: Record<string, {
  name: string;
  tagline: string;
  emoji: string;
  flag: string;
  cuisine: string;
  address: string;
  gradient: string;
  accent: string;
  accentText: string;
  border: string;
  comingSoon: boolean;
}> = {
  topdog: {
    name: "Top Dog Brasil",
    tagline: "O simples bem feito",
    emoji: "🌭",
    flag: "🇺🇸",
    cuisine: "Cachorreria Prensada",
    address: "Rua do Retiro, 1276 · Jundiaí",
    gradient: "from-[#1a0505] via-[#2a0a0a] to-[#1a0505]",
    accent: "#ef4444",
    accentText: "text-red-400",
    border: "border-red-600/40",
    comingSoon: true,
  },
  laguapa: {
    name: "La Guapa",
    tagline: "Empanadas Artesanais · Café",
    emoji: "🥟",
    flag: "🇦🇷",
    cuisine: "Argentina · Artesanal",
    address: "Rua do Retiro, 848 · Jundiaí",
    gradient: "from-[#1a1505] via-[#2a2005] to-[#1a1505]",
    accent: "#f59e0b",
    accentText: "text-amber-400",
    border: "border-amber-500/40",
    comingSoon: true,
  },
  elpatron: {
    name: "El Patron",
    tagline: "Mexican Food · The Taste is Right Here",
    emoji: "🌮",
    flag: "🇲🇽",
    cuisine: "Comida Mexicana",
    address: "Rua do Retiro, 1222 · Jundiaí",
    gradient: "from-[#1a0a05] via-[#2a1005] to-[#1a0a05]",
    accent: "#f97316",
    accentText: "text-orange-400",
    border: "border-orange-500/40",
    comingSoon: true,
  },
};

export default function RestaurantExperience() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/restaurant/:slug");
  const slug = params?.slug ?? "";
  const config = RESTAURANT_CONFIG[slug];

  // Read URL params
  const urlParams = new URLSearchParams(window.location.search);
  const lang = (urlParams.get("lang") ?? "en") as "en" | "es";
  const voiceMode = urlParams.get("voice") === "1";

  if (!config) {
    return (
      <div className="min-h-screen bg-[#050d1a] flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-2xl mb-4">🍽️</p>
          <p className="text-lg font-bold">Restaurante não encontrado</p>
          <Button className="mt-4" onClick={() => navigate("/")}>Voltar ao início</Button>
        </div>
      </div>
    );
  }

  const activities = [
    {
      emoji: "🍽️",
      title: lang === "en" ? "Order from the Menu" : "Pedir del Menú",
      desc: lang === "en" ? "Browse the menu and place a real order" : "Explora el menú y haz un pedido real",
    },
    {
      emoji: "🧩",
      title: lang === "en" ? "Phrase Builder" : "Constructor de Frases",
      desc: lang === "en" ? "Put ordering phrases in the right order" : "Ordena las frases para hacer pedidos",
    },
    {
      emoji: "🎤",
      title: lang === "en" ? "Voice Order" : "Pedido por Voz",
      desc: lang === "en" ? "Practice speaking — read, remember, or freestyle!" : "Practica hablando — lee, recuerda o improvisa!",
    },
    {
      emoji: "💬",
      title: lang === "en" ? "Waiter Q&A" : "Preguntas del Mesero",
      desc: lang === "en" ? "Answer the waiter's questions like in a real café" : "Responde las preguntas del mesero como en un café real",
    },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b ${config.gradient} flex flex-col relative overflow-hidden`}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: config.accent }}
        />
      </div>

      <div className="relative flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <img src={IMAIND_LOGO} alt="ImAInd" className="w-8 h-8 object-contain" />
          <div className="flex-1">
            <h1 className="text-white font-bold text-sm leading-tight">{config.name}</h1>
            <p className={`text-xs ${config.accentText}`}>{config.cuisine}</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg">{lang === "en" ? "🇺🇸" : "🇪🇸"}</span>
            {voiceMode && <Mic className="w-3.5 h-3.5 text-blue-400" />}
          </div>
        </motion.div>

        {/* Restaurant hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl border ${config.border} bg-white/5 p-6 text-center mb-6`}
        >
          <div className="text-5xl mb-3">{config.emoji}</div>
          <h2 className="text-2xl font-bold text-white mb-1">{config.name}</h2>
          <p className={`text-sm ${config.accentText} font-medium`}>{config.tagline}</p>
          <p className="text-white/30 text-xs mt-2">{config.address}</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-xl">{config.flag}</span>
          </div>
        </motion.div>

        {/* Coming soon overlay */}
        {config.comingSoon && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 mb-6 text-center"
          >
            <Construction className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <h3 className="text-white font-bold text-base mb-1">
              {lang === "en" ? "Coming Soon!" : "¡Próximamente!"}
            </h3>
            <p className="text-white/50 text-sm">
              {lang === "en"
                ? "We're building the full experience for this restaurant. Check back soon!"
                : "Estamos construyendo la experiencia completa para este restaurante. ¡Vuelve pronto!"}
            </p>
          </motion.div>
        )}

        {/* Activity preview cards (disabled for now) */}
        <div className="space-y-3 opacity-50">
          {activities.map((activity, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className={`w-full text-left rounded-xl border ${config.border} bg-white/5 p-4 flex items-center gap-4`}
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">
                {activity.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm">{activity.title}</h3>
                <p className="text-xs text-white/40 mt-0.5">{activity.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
            </motion.div>
          ))}
        </div>

        {/* Back to Organic */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center space-y-2"
        >
          <Button
            variant="outline"
            className="border-white/20 text-white/60 hover:text-white hover:bg-white/10 bg-transparent"
            onClick={() => navigate(`/organic?lang=${lang}&voice=${voiceMode ? "1" : "0"}`)}
          >
            🥑 Try Organic In The Box
          </Button>
          <p className="text-white/25 text-xs">
            {lang === "en" ? "Organic is fully available now!" : "¡Organic está disponible ahora!"}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
