import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Play, SkipForward, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Avatar URLs
const GABI_ENGLISH = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/fSjaBTevqlMJYHae.png";
const CRIS_SPANISH = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/vTPizDjRBbaCIUNs.png";
const GABI_UNIFORM = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/fApPdrSumRhOqSuq.png";
const CRIS_UNIFORM = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/AmBZAoHDZrrtPehm.png";
const WELCOME_VIDEO = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/xYahDjCvXYRRePwi.mp4";
const ORGANIC_EXTERIOR = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/uLeiiFbebxtxkwjH.png";

type HomeStep = "welcome" | "video" | "language" | "ready";

// Organic In The Box SVG Logo - styled like the real signage
function OrganicLogo({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { text: "text-2xl", sub: "text-[8px]", gap: "gap-0.5" },
    md: { text: "text-3xl", sub: "text-[10px]", gap: "gap-0.5" },
    lg: { text: "text-5xl md:text-6xl", sub: "text-xs", gap: "gap-1" },
  };
  const s = sizes[size];

  return (
    <div className={`flex flex-col items-center ${s.gap}`}>
      <div className="flex items-baseline gap-1">
        <span
          className={`${s.text} font-light tracking-tight text-white`}
          style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" }}
        >
          <span className="text-white/90">or</span>
          <span className="text-white">gan</span>
          <span className="text-emerald-300">ic</span>
        </span>
        <span className={`${s.sub} font-medium text-emerald-300/80 uppercase tracking-wider self-start mt-1`}>
          in the<br />box
        </span>
      </div>
      <span className={`${s.sub} font-light text-white/60 tracking-[0.25em] uppercase`}>
        Coffee · Brunch · Beer
      </span>
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  // Read lang/voice from URL if coming from ImAInd entry
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get("lang") as "en" | "es" | null;
  const urlVoice = urlParams.get("voice") === "1";
  // If lang is in URL, skip welcome/video and go straight to language selection or ready
  const initialStep: HomeStep = urlLang ? "ready" : "welcome";
  const [step, setStep] = useState<HomeStep>(initialStep);
  const [selectedLang, setSelectedLang] = useState<"en" | "es" | null>(urlLang);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ===== STEP 1: WELCOME =====
  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-[#1a2e1a] flex flex-col relative overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src={ORGANIC_EXTERIOR}
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a2e1a]/80 via-[#1a2e1a]/60 to-[#1a2e1a]/95" />
        </div>

        <div className="relative flex-1 flex flex-col items-center justify-between px-4 py-6 md:py-10">
          {/* Top: Logo */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center pt-4 md:pt-8"
          >
            <OrganicLogo size="lg" />
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-emerald-400/30" />
              <span className="text-[10px] text-emerald-400/60 tracking-widest uppercase font-medium">
                × InFlux Jundiaí
              </span>
              <div className="h-px w-8 bg-emerald-400/30" />
            </div>
          </motion.div>

          {/* Center: Owners with their quote */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col items-center -mt-4"
          >
            {/* Owner photos - large and prominent */}
            <div className="flex items-end justify-center -space-x-6 mb-5">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="relative z-10"
              >
                <div className="w-40 h-48 md:w-48 md:h-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-400/30 ring-4 ring-[#1a2e1a]">
                  <img src={GABI_UNIFORM} alt="Gabi" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                  Gabi
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="relative z-0"
              >
                <div className="w-40 h-48 md:w-48 md:h-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-400/30 ring-4 ring-[#1a2e1a]">
                  <img src={CRIS_UNIFORM} alt="Cris" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                  Cris
                </div>
              </motion.div>
            </div>

            {/* Quote / Frase-chave */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center max-w-sm mt-4"
            >
              <p className="text-white/90 text-base md:text-lg font-light italic leading-relaxed">
                "Sua cafeteria 100% saudável.<br />
                Aqui, cada pedido é uma experiência."
              </p>
              <p className="text-emerald-400/70 text-xs mt-2 font-medium">
                — Gabi & Cris, fundadores do Organic In The Box
              </p>
            </motion.div>
          </motion.div>

          {/* Bottom: Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="w-full max-w-sm space-y-3 pb-2"
          >
            <Button
              size="lg"
              className="w-full text-base py-6 rounded-xl shadow-xl bg-emerald-600 hover:bg-emerald-500 text-white border-0"
              onClick={() => setStep("video")}
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Our Story
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full text-base py-6 rounded-xl border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/10 hover:text-emerald-200 bg-transparent"
              onClick={() => setStep("language")}
            >
              <SkipForward className="w-5 h-5 mr-2" />
              Skip to Menu
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ===== STEP 2: VIDEO =====
  if (step === "video") {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex-1 flex items-center justify-center relative">
          <video
            ref={videoRef}
            src={WELCOME_VIDEO}
            className="w-full max-w-2xl max-h-[80vh] object-contain"
            controls
            autoPlay
            playsInline
            onEnded={() => setStep("language")}
          />
          <div className="absolute top-4 right-4">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full opacity-80 hover:opacity-100 bg-black/50 text-white border-white/20 hover:bg-black/70"
              onClick={() => {
                if (videoRef.current) videoRef.current.pause();
                setStep("language");
              }}
            >
              <SkipForward className="w-4 h-4 mr-1" />
              Skip
            </Button>
          </div>
        </div>
        <div className="p-4 text-center">
          <Button
            variant="ghost"
            className="text-white/70 hover:text-white"
            onClick={() => setStep("language")}
          >
            Continue to Menu →
          </Button>
        </div>
      </div>
    );
  }

  // ===== STEP 3: LANGUAGE SELECTION =====
  if (step === "language") {
    return (
      <div className="min-h-screen bg-[#1a2e1a] flex flex-col relative overflow-hidden">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2e1a] via-[#1f3520] to-[#1a2e1a]" />

        <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-8">
          {/* Logo at top */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <OrganicLogo size="md" />
            <p className="text-emerald-300/60 text-sm mt-4 font-light">
              Choose your language / Escolha seu idioma
            </p>
          </motion.div>

          {/* Language selection - large avatar cards */}
          <div className="flex items-stretch justify-center gap-5 md:gap-8 max-w-md w-full mb-8">
            {/* Gabi - English */}
            <motion.button
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onClick={() => {
                setSelectedLang("en");
                setStep("ready");
              }}
              className="flex-1 group"
            >
              <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-400/20 hover:border-blue-400/60 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:scale-[1.03] bg-gradient-to-b from-[#1f3a22] to-[#162a16]">
                {/* Flag badge */}
                <div className="absolute top-3 right-3 z-10 text-3xl drop-shadow-lg">
                  🇺🇸
                </div>
                {/* Avatar - large */}
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={GABI_ENGLISH}
                    alt="Gabi - English"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {/* Info */}
                <div className="p-4 text-center">
                  <h3 className="font-bold text-white text-lg mb-0.5">Gabi</h3>
                  <p className="text-blue-400 font-semibold text-sm uppercase tracking-wider">English</p>
                  <p className="text-white/50 text-xs mt-2 italic font-light">
                    "Hi! Ready to order?"
                  </p>
                </div>
              </div>
            </motion.button>

            {/* Cris - Español */}
            <motion.button
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              onClick={() => {
                setSelectedLang("es");
                setStep("ready");
              }}
              className="flex-1 group"
            >
              <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-400/20 hover:border-red-400/60 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10 hover:scale-[1.03] bg-gradient-to-b from-[#1f3a22] to-[#162a16]">
                {/* Flag badge */}
                <div className="absolute top-3 right-3 z-10 text-3xl drop-shadow-lg">
                  🇪🇸
                </div>
                {/* Avatar - large */}
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={CRIS_SPANISH}
                    alt="Cris - Español"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {/* Info */}
                <div className="p-4 text-center">
                  <h3 className="font-bold text-white text-lg mb-0.5">Cris</h3>
                  <p className="text-red-400 font-semibold text-sm uppercase tracking-wider">Español</p>
                  <p className="text-white/50 text-xs mt-2 italic font-light">
                    "¡Hola! ¿Listo para pedir?"
                  </p>
                </div>
              </div>
            </motion.button>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={() => setStep("welcome")}
            className="text-sm text-emerald-400/50 hover:text-emerald-300 transition-colors"
          >
            ← Voltar
          </motion.button>
        </div>
      </div>
    );
  }

  // ===== STEP 4: READY - Choose activity =====
  if (step === "ready") {
    const isEnglish = selectedLang === "en";
    const waiterName = isEnglish ? "Gabi" : "Cris";
    const waiterImg = isEnglish ? GABI_ENGLISH : CRIS_SPANISH;
    const flag = isEnglish ? "🇺🇸" : "🇪🇸";

    const activities = [
      {
        emoji: "🍽️",
        title: isEnglish ? "Order from the Menu" : "Pedir del Menú",
        desc: isEnglish ? "Browse the menu and place a real order" : "Explora el menú y haz un pedido real",
        color: "emerald",
        route: `/order?lang=${selectedLang}`,
      },
      {
        emoji: "🧩",
        title: isEnglish ? "Phrase Builder" : "Constructor de Frases",
        desc: isEnglish ? "Put ordering phrases in the right order" : "Ordena las frases para hacer pedidos",
        color: "amber",
        route: `/game/phrase-builder?lang=${selectedLang}`,
      },
      {
        emoji: "🎤",
        title: isEnglish ? "Voice Order" : "Pedido por Voz",
        desc: isEnglish ? "Practice speaking — read, remember, or freestyle!" : "Practica hablando — lee, recuerda o improvisa!",
        color: "blue",
        route: `/game/voice-order?lang=${selectedLang}`,
      },
      {
        emoji: "💬",
        title: isEnglish ? "Waiter Q&A" : "Preguntas del Mesero",
        desc: isEnglish ? "Answer the waiter's questions like in a real café" : "Responde las preguntas del mesero como en un café real",
        color: "purple",
        route: `/game/qa-simulation?lang=${selectedLang}`,
      },
    ];

    return (
      <div className="min-h-screen bg-[#1a2e1a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2e1a] via-[#1f3520] to-[#1a2e1a]" />

        <div className="relative container mx-auto px-4 py-6 max-w-lg">
          {/* Header with avatar and logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <OrganicLogo size="sm" />
            <div className="flex items-center justify-center gap-3 mt-5">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-400/30 shadow-lg">
                <img src={waiterImg} alt={waiterName} className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-white">
                  {flag} {isEnglish ? `Hi! I'm ${waiterName}` : `¡Hola! Soy ${waiterName}`}
                </h2>
                <p className="text-xs text-emerald-300/60">
                  {isEnglish
                    ? "Choose how you'd like to practice today!"
                    : "¡Elige cómo quieres practicar hoy!"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Activity cards */}
          <div className="space-y-3">
            {activities.map((activity, i) => (
              <motion.div
                key={activity.route}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
              >
                <button
                  className="w-full text-left rounded-xl border border-emerald-400/15 bg-[#1f3a22]/80 hover:bg-[#264a28] hover:border-emerald-400/30 transition-all duration-200 p-4 flex items-center gap-4 group"
                  onClick={() => navigate(activity.route)}
                >
                  <div className="w-14 h-14 rounded-xl bg-emerald-400/10 flex items-center justify-center shrink-0 text-2xl">
                    {activity.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm">{activity.title}</h3>
                    <p className="text-xs text-white/40 mt-0.5">{activity.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-400/40 group-hover:text-emerald-400 transition-colors shrink-0" />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setStep("language")}
              className="text-sm text-emerald-400/40 hover:text-emerald-300 transition-colors"
            >
              ← {isEnglish ? "Change language" : "Cambiar idioma"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
