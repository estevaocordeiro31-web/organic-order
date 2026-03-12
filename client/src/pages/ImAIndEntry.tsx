import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, ChevronRight, Globe, Utensils, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const IMAIND_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/imaind-logo-main-Fx4X8HBTwPWV3N6Pfhh9r9.png";

// Restaurant partner data
const PARTNERS = [
  {
    id: "organic",
    slug: "organic",
    name: "Organic In The Box",
    tagline: "100% Healthy · Coffee · Brunch",
    cuisine: "Healthy Café",
    address: "Rua do Retiro, Jundiaí",
    color: "#1a2e1a",
    accent: "#4ade80",
    accentDark: "#16a34a",
    gradient: "from-[#0d1f0d] via-[#1a2e1a] to-[#0d1f0d]",
    cardBg: "from-[#1a2e1a] to-[#0d1f0d]",
    borderColor: "border-emerald-500/40",
    hoverBorder: "hover:border-emerald-400",
    textAccent: "text-emerald-400",
    emoji: "🥑",
    flag: "🇧🇷",
    available: true,
    route: "/",
  },
  {
    id: "topdog",
    slug: "topdog",
    name: "Top Dog Brasil",
    tagline: "O simples bem feito · Hot Dogs",
    cuisine: "Cachorreria Prensada",
    address: "Rua do Retiro, 1276 · Jundiaí",
    color: "#1a0505",
    accent: "#ef4444",
    accentDark: "#dc2626",
    gradient: "from-[#1a0505] via-[#2a0a0a] to-[#1a0505]",
    cardBg: "from-[#2a0a0a] to-[#1a0505]",
    borderColor: "border-red-600/40",
    hoverBorder: "hover:border-red-500",
    textAccent: "text-red-400",
    emoji: "🌭",
    flag: "🇺🇸",
    available: true,
    route: "/restaurant/topdog",
  },
  {
    id: "laguapa",
    slug: "laguapa",
    name: "La Guapa",
    tagline: "Empanadas Artesanais · Café",
    cuisine: "Argentina · Artesanal",
    address: "Rua do Retiro, 848 · Jundiaí",
    color: "#1a1505",
    accent: "#f59e0b",
    accentDark: "#d97706",
    gradient: "from-[#1a1505] via-[#2a2005] to-[#1a1505]",
    cardBg: "from-[#2a2005] to-[#1a1505]",
    borderColor: "border-amber-500/40",
    hoverBorder: "hover:border-amber-400",
    textAccent: "text-amber-400",
    emoji: "🥟",
    flag: "🇦🇷",
    available: true,
    route: "/restaurant/laguapa",
  },
  {
    id: "elpatron",
    slug: "elpatron",
    name: "El Patron",
    tagline: "Mexican Food · The Taste is Right Here",
    cuisine: "Comida Mexicana",
    address: "Rua do Retiro, 1222 · Jundiaí",
    color: "#1a0a05",
    accent: "#f97316",
    accentDark: "#ea580c",
    gradient: "from-[#1a0a05] via-[#2a1005] to-[#1a0a05]",
    cardBg: "from-[#2a1005] to-[#1a0a05]",
    borderColor: "border-orange-500/40",
    hoverBorder: "hover:border-orange-400",
    textAccent: "text-orange-400",
    emoji: "🌮",
    flag: "🇲🇽",
    available: true,
    route: "/restaurant/elpatron",
  },
];

type EntryStep = "splash" | "welcome" | "voice" | "language" | "partners";

export default function ImAIndEntry() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<EntryStep>("splash");
  const [voiceMode, setVoiceMode] = useState(false);
  const [selectedLang, setSelectedLang] = useState<"en" | "es">("en");
  const [particles, setParticles] = useState<{ x: number; y: number; delay: number }[]>([]);

  // Auto-advance splash after 2.5s
  useEffect(() => {
    if (step === "splash") {
      const timer = setTimeout(() => setStep("welcome"), 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Generate floating particles for background
  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: i * 0.3,
      }))
    );
  }, []);

  // ===== SPLASH SCREEN =====
  if (step === "splash") {
    return (
      <div className="min-h-screen bg-[#050d1a] flex items-center justify-center overflow-hidden relative">
        {/* Animated background glow */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative flex flex-col items-center"
        >
          <motion.img
            src={IMAIND_LOGO}
            alt="ImAInd"
            className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-2"
          >
            <p className="text-blue-300/60 text-sm tracking-[0.3em] uppercase font-light">
              Restaurant Experience
            </p>
          </motion.div>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex gap-2 mt-8"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-400/60 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ===== WELCOME SCREEN =====
  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-[#050d1a] flex flex-col relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-700/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-700/15 rounded-full blur-3xl" />
          {/* Floating particles */}
          {particles.map((p, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              animate={{ y: [-10, 10, -10], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 4 + p.delay, repeat: Infinity, delay: p.delay }}
            />
          ))}
        </div>

        <div className="relative flex-1 flex flex-col items-center justify-between px-6 py-8 md:py-12 max-w-lg mx-auto w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <img src={IMAIND_LOGO} alt="ImAInd" className="w-20 h-20 object-contain" />
            <p className="text-blue-300/40 text-xs tracking-[0.25em] uppercase mt-1">Restaurant Experience</p>
          </motion.div>

          {/* Main message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-center space-y-6"
          >
            {/* World icons */}
            <div className="flex justify-center gap-4 text-3xl">
              {["🍔", "🌮", "🥟", "🥑", "🍜", "🍕"].map((emoji, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="text-2xl"
                >
                  {emoji}
                </motion.span>
              ))}
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                Você está pronto para se{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  divertir
                </span>{" "}
                enquanto simula estar em um restaurante em{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                  outra parte do mundo?
                </span>
              </h1>
            </div>

            <p className="text-white/50 text-sm leading-relaxed">
              Aqui o segredo é você agir como faria na vida real —{" "}
              <span className="text-blue-300/80">peça sua comida, converse com o garçom</span>{" "}
              e pratique inglês ou espanhol de verdade.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { icon: "🎤", label: "Voz real" },
                { icon: "🎮", label: "Games" },
                { icon: "🌍", label: "2 idiomas" },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="bg-white/5 rounded-xl p-3 text-center border border-white/10"
                >
                  <div className="text-xl mb-1">{f.icon}</div>
                  <p className="text-white/60 text-xs">{f.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="w-full space-y-3"
          >
            <Button
              size="lg"
              className="w-full py-6 text-base rounded-2xl font-bold shadow-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 gap-3"
              onClick={() => {
                setVoiceMode(true);
                setStep("language");
              }}
            >
              <Mic className="w-5 h-5" />
              Assumir controle de voz
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full py-6 text-base rounded-2xl font-medium border-white/20 text-white/80 hover:bg-white/5 hover:text-white bg-transparent gap-3"
              onClick={() => {
                setVoiceMode(false);
                setStep("language");
              }}
            >
              <ChevronRight className="w-5 h-5" />
              Continuar sem voz
            </Button>
            <p className="text-center text-white/30 text-xs">
              Você pode mudar isso a qualquer momento
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ===== LANGUAGE SELECTION =====
  if (step === "language") {
    return (
      <div className="min-h-screen bg-[#050d1a] flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-blue-700/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-700/10 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-sm space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <img src={IMAIND_LOGO} alt="ImAInd" className="w-16 h-16 object-contain mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white">Escolha o idioma</h2>
            <p className="text-white/40 text-sm mt-1">Em qual idioma você quer praticar hoje?</p>
            {voiceMode && (
              <div className="mt-3 inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs px-3 py-1.5 rounded-full border border-blue-500/30">
                <Mic className="w-3 h-3" />
                Modo voz ativado
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {/* English */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => {
                setSelectedLang("en");
                setStep("partners");
              }}
              className={`group relative overflow-hidden rounded-2xl border-2 p-6 text-center transition-all duration-300 ${
                selectedLang === "en"
                  ? "border-blue-400 bg-blue-500/20"
                  : "border-white/10 bg-white/5 hover:border-blue-400/50 hover:bg-blue-500/10"
              }`}
            >
              <div className="text-4xl mb-3">🇺🇸</div>
              <h3 className="font-bold text-white text-lg">English</h3>
              <p className="text-white/40 text-xs mt-1">American English</p>
            </motion.button>

            {/* Spanish */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => {
                setSelectedLang("es");
                setStep("partners");
              }}
              className={`group relative overflow-hidden rounded-2xl border-2 p-6 text-center transition-all duration-300 ${
                selectedLang === "es"
                  ? "border-red-400 bg-red-500/20"
                  : "border-white/10 bg-white/5 hover:border-red-400/50 hover:bg-red-500/10"
              }`}
            >
              <div className="text-4xl mb-3">🇪🇸</div>
              <h3 className="font-bold text-white text-lg">Español</h3>
              <p className="text-white/40 text-xs mt-1">Español Latino</p>
            </motion.button>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => setStep("welcome")}
            className="w-full text-center text-white/30 hover:text-white/60 text-sm transition-colors"
          >
            ← Voltar
          </motion.button>
        </div>
      </div>
    );
  }

  // ===== PARTNER SELECTION =====
  if (step === "partners") {
    return (
      <div className="min-h-screen bg-[#050d1a] flex flex-col relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl" />
        </div>

        <div className="relative flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <img src={IMAIND_LOGO} alt="ImAInd" className="w-12 h-12 object-contain mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white">
              {selectedLang === "en" ? "Choose your restaurant" : "Elige tu restaurante"}
            </h2>
            <p className="text-white/40 text-sm mt-1">
              {selectedLang === "en"
                ? "All located in Rua do Retiro, Jundiaí"
                : "Todos en Rua do Retiro, Jundiaí"}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-xs text-white/30">
                {selectedLang === "en" ? "🇺🇸 English" : "🇪🇸 Español"}
              </span>
              {voiceMode && (
                <span className="text-xs text-blue-400/60 flex items-center gap-1">
                  <Mic className="w-3 h-3" /> Voice mode
                </span>
              )}
            </div>
          </motion.div>

          {/* Partner cards */}
          <div className="space-y-3 flex-1">
            {PARTNERS.map((partner, i) => (
              <motion.button
                key={partner.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                onClick={() => {
                  // Store selection in sessionStorage for the restaurant to use
                  sessionStorage.setItem("imaind_lang", selectedLang);
                  sessionStorage.setItem("imaind_voice", voiceMode ? "1" : "0");
                  sessionStorage.setItem("imaind_restaurant", partner.id);
                  navigate(`${partner.route}?lang=${selectedLang}&voice=${voiceMode ? "1" : "0"}`);
                }}
                className={`w-full text-left rounded-2xl border ${partner.borderColor} ${partner.hoverBorder} bg-gradient-to-r ${partner.cardBg} hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 p-4 flex items-center gap-4 group shadow-lg`}
              >
                {/* Emoji icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-inner"
                  style={{ backgroundColor: `${partner.accent}20` }}
                >
                  {partner.emoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-white text-sm truncate">{partner.name}</h3>
                    <span className="text-base">{partner.flag}</span>
                  </div>
                  <p className={`text-xs font-medium ${partner.textAccent} truncate`}>
                    {partner.cuisine}
                  </p>
                  <p className="text-white/30 text-xs mt-0.5 truncate">{partner.tagline}</p>
                </div>

                {/* Arrow */}
                <ChevronRight
                  className={`w-5 h-5 ${partner.textAccent} opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0`}
                />
              </motion.button>
            ))}
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 text-center"
          >
            <button
              onClick={() => setStep("language")}
              className="text-sm text-white/25 hover:text-white/50 transition-colors"
            >
              ← {selectedLang === "en" ? "Change language" : "Cambiar idioma"}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}
