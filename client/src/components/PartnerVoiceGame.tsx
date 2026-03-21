import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, RotateCcw, Trophy, Star, ChevronRight, Eye, EyeOff, Volume2, VolumeX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTTS } from "@/hooks/useTTS";

export type VoicePhrase = {
  id: number;
  expression: string;
  translation: string;
  context: string;
  difficulty: "easy" | "medium" | "hard";
};

export type PartnerVoiceGameProps = {
  lang: "en" | "es";
  phrases: VoicePhrase[];
  accentColor: string;
  bgColor: string;
  restaurantName: string;
  waiterEmoji: string;
  onBack: () => void;
  onSaveScore?: (score: number, total: number, difficulty: string) => void;
};

type Difficulty = "easy" | "medium" | "hard";

export default function PartnerVoiceGame({
  lang,
  phrases,
  accentColor,
  bgColor,
  restaurantName,
  waiterEmoji,
  onBack,
  onSaveScore,
}: PartnerVoiceGameProps) {
  const isEnglish = lang === "en";
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [showPhrase, setShowPhrase] = useState(true);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { speak, isSpeaking, isMuted, toggleMute, isSupported: ttsSupported } = useTTS();

  const filteredPhrases = phrases.filter(p => p.difficulty === difficulty);
  const currentPhrase = filteredPhrases[currentIndex];

  useEffect(() => {
    if (difficulty === "medium" && currentPhrase) {
      setShowPhrase(true);
      const timer = setTimeout(() => setShowPhrase(false), 3000);
      return () => clearTimeout(timer);
    } else if (difficulty === "easy") {
      setShowPhrase(true);
    } else if (difficulty === "hard") {
      setShowPhrase(false);
    }
  }, [difficulty, currentPhrase, currentIndex]);

  const speakPhrase = (text: string) => speak(text, lang, 0.85);

  const startRecording = () => {
    setTranscript("");
    setShowResult(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript(isEnglish
        ? "Speech recognition not supported. Try Chrome on your phone!"
        : "Reconocimiento de voz no soportado. ¡Usa Chrome!");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = isEnglish ? "en-US" : "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;

    recognition.onresult = (event: any) => {
      const results = event.results[0];
      let bestMatch = results[0].transcript;
      if (currentPhrase) {
        const target = currentPhrase.expression.toLowerCase().replace(/[.,!?']/g, "");
        for (let i = 0; i < results.length; i++) {
          const alt = results[i].transcript.toLowerCase().replace(/[.,!?']/g, "");
          if (alt === target || alt.includes(target) || target.includes(alt)) {
            bestMatch = results[i].transcript;
            break;
          }
        }
      }
      setTranscript(bestMatch);
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTimer(0);
      checkAnswer(bestMatch);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTimer(0);
      setTranscript(isEnglish ? "Could not hear you. Try again!" : "No te escuché. ¡Intenta de nuevo!");
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTimer(0);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setRecordingTimer(0);
    timerRef.current = setInterval(() => setRecordingTimer(prev => prev + 1), 1000);
  };

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setRecordingTimer(0);
  };

  const checkAnswer = (spokenText: string) => {
    if (!currentPhrase) return;
    const spoken = spokenText.toLowerCase().replace(/[.,!?']/g, "").trim();
    const target = currentPhrase.expression.toLowerCase().replace(/[.,!?']/g, "").trim();
    setTotalAttempts(prev => prev + 1);
    const spokenWords = spoken.split(/\s+/);
    const targetWords = target.split(/\s+/);
    const matchCount = targetWords.filter(w => spokenWords.includes(w)).length;
    const matchRatio = matchCount / targetWords.length;
    if (matchRatio >= 0.65 || spoken === target) {
      setScore(prev => prev + 1);
      setShowResult("correct");
    } else {
      setShowResult("wrong");
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= filteredPhrases.length) {
      setGameOver(true);
      if (onSaveScore && difficulty) onSaveScore(score, totalAttempts, difficulty);
    } else {
      setCurrentIndex(prev => prev + 1);
      setTranscript("");
      setShowResult(null);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setTotalAttempts(0);
    setGameOver(false);
    setDifficulty(null);
    setTranscript("");
    setShowResult(null);
  };

  // ===== DIFFICULTY SELECTION =====
  if (!difficulty) {
    return (
      <div className="min-h-screen" style={{ background: bgColor }}>
        <div className="container mx-auto px-4 py-8 max-w-lg">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm mb-6 transition-colors"
            style={{ color: accentColor }}
          >
            <ArrowLeft className="w-4 h-4" />
            {isEnglish ? "Back to menu" : "Volver al menú"}
          </button>

          <div className="text-center mb-8">
            <div className="text-6xl mb-3">{waiterEmoji}</div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {isEnglish ? "Voice Order" : "Pedido por Voz"}
            </h1>
            <p className="text-sm" style={{ color: accentColor }}>
              {restaurantName}
            </p>
            <p className="text-xs text-white/60 mt-1">
              {isEnglish
                ? "Practice ordering phrases out loud!"
                : "¡Practica frases de pedido en voz alta!"}
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                level: "easy" as Difficulty,
                icon: <Eye className="w-7 h-7" />,
                color: "#22c55e",
                bg: "rgba(34,197,94,0.1)",
                title: isEnglish ? "Easy — Read & Speak" : "Fácil — Leer y Hablar",
                desc: isEnglish ? "See the phrase while you record" : "Ve la frase mientras grabas",
              },
              {
                level: "medium" as Difficulty,
                icon: <EyeOff className="w-7 h-7" />,
                color: "#f59e0b",
                bg: "rgba(245,158,11,0.1)",
                title: isEnglish ? "Medium — Memorize & Speak" : "Medio — Memorizar y Hablar",
                desc: isEnglish ? "Phrase disappears after 3 seconds" : "La frase desaparece en 3 segundos",
              },
              {
                level: "hard" as Difficulty,
                icon: <Mic className="w-7 h-7" />,
                color: "#ef4444",
                bg: "rgba(239,68,68,0.1)",
                title: isEnglish ? "Hard — Listen & Speak" : "Difícil — Escuchar y Hablar",
                desc: isEnglish ? "No visual hints, just the context" : "Sin pistas visuales, solo el contexto",
              },
            ].map(({ level, icon, color, bg, title, desc }) => (
              <div
                key={level}
                onClick={() => setDifficulty(level)}
                className="rounded-xl p-4 flex items-center gap-4 cursor-pointer border transition-all hover:scale-[1.02]"
                style={{ background: bg, borderColor: color + "40" }}
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg, color }}>
                  {icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="text-xs text-white/60">{desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-white/40 mt-6">
            {filteredPhrases.length === 0
              ? `${phrases.filter(p => p.difficulty === "easy").length} ${isEnglish ? "phrases per level" : "frases por nivel"}`
              : `${filteredPhrases.length} ${isEnglish ? "phrases" : "frases"}`}
          </p>
        </div>
      </div>
    );
  }

  // ===== GAME OVER =====
  if (gameOver) {
    const pct = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: bgColor }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-sm w-full"
        >
          <div className="text-6xl mb-4">{pct >= 70 ? "🏆" : pct >= 40 ? "⭐" : "💪"}</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isEnglish ? "Game Over!" : "¡Fin del juego!"}
          </h2>
          <p className="text-4xl font-bold mb-1" style={{ color: accentColor }}>{pct}%</p>
          <p className="text-white/60 text-sm mb-2">
            {score}/{totalAttempts} {isEnglish ? "correct" : "correctas"}
          </p>
          <p className="text-white/40 text-xs mb-8">
            {pct >= 70
              ? (isEnglish ? "Excellent! You're a natural!" : "¡Excelente! ¡Eres un crack!")
              : pct >= 40
              ? (isEnglish ? "Good job! Keep practicing!" : "¡Buen trabajo! ¡Sigue practicando!")
              : (isEnglish ? "Keep going, you'll get it!" : "¡Sigue adelante, lo lograrás!")}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRestart} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <RotateCcw className="w-4 h-4 mr-2" />
              {isEnglish ? "Play Again" : "Jugar de nuevo"}
            </Button>
            <Button onClick={onBack} style={{ background: accentColor, color: "#000" }}>
              {isEnglish ? "Back to Menu" : "Volver al menú"}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ===== MAIN GAME =====
  return (
    <div className="min-h-screen" style={{ background: bgColor }}>
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {ttsSupported && (
              <button
                onClick={toggleMute}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                title={isMuted ? (isEnglish ? "Unmute" : "Activar sonido") : (isEnglish ? "Mute" : "Silenciar")}
              >
                {isMuted
                  ? <VolumeX className="w-3.5 h-3.5 text-white/40" />
                  : <Volume2 className="w-3.5 h-3.5" style={{ color: isSpeaking ? accentColor : "rgba(255,255,255,0.6)" }} />}
              </button>
            )}
            <Badge variant="outline" className="border-white/20 text-white/60 text-xs">
              {currentIndex + 1}/{filteredPhrases.length}
            </Badge>
            <Badge className="text-xs font-bold" style={{ background: accentColor, color: "#000" }}>
              <Star className="w-3 h-3 mr-1" />
              {score}
            </Badge>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full mb-6" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex) / filteredPhrases.length) * 100}%`, background: accentColor }}
          />
        </div>

        {/* Context */}
        {currentPhrase && (
          <div className="text-center mb-6">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-2">
              {isEnglish ? "Context" : "Contexto"}
            </p>
            <p className="text-white/80 text-sm italic">"{currentPhrase.context}"</p>
          </div>
        )}

        {/* Phrase card */}
        <AnimatePresence mode="wait">
          {currentPhrase && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-2xl p-6 mb-6 text-center border"
              style={{ background: "rgba(255,255,255,0.05)", borderColor: accentColor + "30" }}
            >
              {showPhrase ? (
                <>
                  <p className="text-2xl font-bold text-white mb-2">{currentPhrase.expression}</p>
                  <p className="text-sm text-white/50">{currentPhrase.translation}</p>
                  <button
                    onClick={() => speakPhrase(currentPhrase.expression)}
                    className="mt-3 flex items-center gap-1 mx-auto text-xs transition-colors"
                    style={{ color: isSpeaking ? accentColor : "rgba(255,255,255,0.4)" }}
                  >
                    <Volume2 className="w-3 h-3" />
                    {isEnglish ? "Hear it" : "Escuchar"}
                  </button>
                </>
              ) : (
                <div className="py-4">
                  <p className="text-white/30 text-sm mb-1">
                    {isEnglish ? "What would you say?" : "¿Qué dirías?"}
                  </p>
                  <p className="text-white/60 text-xs italic">"{currentPhrase.context}"</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recording button */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={showResult !== null}
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-50"
            style={{
              background: isRecording ? "#ef4444" : accentColor,
              boxShadow: isRecording ? "0 0 30px rgba(239,68,68,0.5)" : `0 0 20px ${accentColor}40`,
            }}
          >
            {isRecording ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-black" />
            )}
          </motion.button>

          {isRecording && (
            <motion.p
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-red-400 text-sm font-medium"
            >
              {isEnglish ? `Recording... ${recordingTimer}s` : `Grabando... ${recordingTimer}s`}
            </motion.p>
          )}

          {!isRecording && !showResult && !transcript && (
            <p className="text-white/40 text-xs">
              {isEnglish ? "Tap the mic to record" : "Toca el micrófono para grabar"}
            </p>
          )}
        </div>

        {/* Result */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl p-4 mb-4 text-center border"
              style={{
                background: showResult === "correct" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                borderColor: showResult === "correct" ? "#22c55e40" : "#ef444440",
              }}
            >
              <p className="text-2xl mb-1">{showResult === "correct" ? "✅" : "❌"}</p>
              <p className="font-semibold text-white text-sm mb-1">
                {showResult === "correct"
                  ? (isEnglish ? "Great job!" : "¡Muy bien!")
                  : (isEnglish ? "Not quite..." : "Casi...")}
              </p>
              {transcript && (
                <p className="text-xs text-white/50">
                  {isEnglish ? "You said: " : "Dijiste: "}
                  <span className="text-white/80 italic">"{transcript}"</span>
                </p>
              )}
              {showResult === "wrong" && currentPhrase && (
                <p className="text-xs mt-1" style={{ color: accentColor }}>
                  {isEnglish ? "Expected: " : "Esperado: "}
                  <span className="font-medium">"{currentPhrase.expression}"</span>
                </p>
              )}
              <Button
                onClick={handleNext}
                size="sm"
                className="mt-3 text-black font-bold"
                style={{ background: accentColor }}
              >
                {currentIndex + 1 >= filteredPhrases.length
                  ? (isEnglish ? "See Results" : "Ver resultados")
                  : (isEnglish ? "Next" : "Siguiente")}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
