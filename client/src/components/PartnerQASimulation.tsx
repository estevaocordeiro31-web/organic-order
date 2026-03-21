import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, RotateCcw, Trophy, Star, ChevronRight, Volume2, VolumeX, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QAPair } from "@/lib/restaurantVoiceData";
import { useTTS } from "@/hooks/useTTS";

export type PartnerQASimulationProps = {
  lang: "en" | "es";
  questions: QAPair[];
  accentColor: string;
  bgColor: string;
  restaurantName: string;
  waiterEmoji: string;
  waiterName: string;
  welcomeMessage: string;
  onBack: () => void;
  onSaveScore?: (score: number, total: number) => void;
};

export default function PartnerQASimulation({
  lang,
  questions,
  accentColor,
  bgColor,
  restaurantName,
  waiterEmoji,
  waiterName,
  welcomeMessage,
  onBack,
  onSaveScore,
}: PartnerQASimulationProps) {
  const isEnglish = lang === "en";

  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const [chatHistory, setChatHistory] = useState<{ role: "waiter" | "student"; text: string }[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { speak, isSpeaking, isMuted, toggleMute, isSupported: ttsSupported } = useTTS();

  const currentQ = questions[currentIndex];

  const speakText = (text: string) => speak(text, lang, 0.85);

  const startRecording = () => {
    setTranscript("");
    setShowResult(null);
    setShowHint(false);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript(isEnglish
        ? "Speech recognition not supported. Try Chrome!"
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
      if (currentQ) {
        const keywords = currentQ.keywords;
        let maxMatches = 0;
        for (let i = 0; i < results.length; i++) {
          const alt = results[i].transcript.toLowerCase();
          const matches = keywords.filter(k => alt.includes(k)).length;
          if (matches > maxMatches) {
            maxMatches = matches;
            bestMatch = results[i].transcript;
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
    if (!currentQ) return;
    const spoken = spokenText.toLowerCase();
    const keywords = currentQ.keywords;
    const matchCount = keywords.filter(k => spoken.includes(k)).length;
    const matchRatio = matchCount / keywords.length;

    const isCorrect = matchRatio >= 0.5;
    if (isCorrect) {
      setScore(prev => prev + 1);
      setShowResult("correct");
    } else {
      setShowResult("wrong");
    }

    setChatHistory(prev => [...prev, { role: "student", text: spokenText }]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setGameOver(true);
      if (onSaveScore) onSaveScore(score, questions.length);
    } else {
      const nextQ = questions[currentIndex + 1];
      setCurrentIndex(prev => prev + 1);
      setTranscript("");
      setShowResult(null);
      setShowHint(false);
      setChatHistory(prev => [...prev, { role: "waiter", text: nextQ.question }]);
      setTimeout(() => speakText(nextQ.question), 300);
    }
  };

  const handleStart = () => {
    setStarted(true);
    setChatHistory([{ role: "waiter", text: currentQ.question }]);
    setTimeout(() => speakText(currentQ.question), 400);
  };

  const handleRestart = () => {
    setStarted(false);
    setCurrentIndex(0);
    setScore(0);
    setGameOver(false);
    setTranscript("");
    setShowResult(null);
    setShowHint(false);
    setChatHistory([]);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // ===== INTRO SCREEN =====
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: bgColor }}>
        <button onClick={onBack} className="absolute top-4 left-4 flex items-center gap-1 text-sm" style={{ color: accentColor }}>
          <ArrowLeft className="w-4 h-4" />
          {isEnglish ? "Back" : "Volver"}
        </button>

        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-sm">
          <div className="text-7xl mb-4">{waiterEmoji}</div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {isEnglish ? "Q&A Simulation" : "Simulación de Diálogo"}
          </h1>
          <p className="text-sm mb-1" style={{ color: accentColor }}>{restaurantName}</p>
          <p className="text-white/50 text-xs mb-6">
            {isEnglish
              ? `Practice a real conversation with ${waiterName}, your virtual server!`
              : `¡Practica una conversación real con ${waiterName}, tu mesero virtual!`}
          </p>

          <div className="bg-white/5 rounded-2xl p-4 mb-6 text-left border border-white/10">
            <p className="text-white/60 text-xs mb-2 font-medium">
              {isEnglish ? "How it works:" : "Cómo funciona:"}
            </p>
            <div className="space-y-1.5 text-xs text-white/50">
              <p>🎙️ {isEnglish ? `${waiterName} asks you a question` : `${waiterName} te hace una pregunta`}</p>
              <p>🗣️ {isEnglish ? "You answer out loud in English" : "Respondes en voz alta en español"}</p>
              <p>✅ {isEnglish ? "Get scored on key words" : "Te puntúan por palabras clave"}</p>
              <p>💬 {isEnglish ? "Build a real restaurant conversation!" : "¡Construye una conversación real!"}</p>
            </div>
          </div>

          <Button
            onClick={handleStart}
            className="w-full py-4 font-bold rounded-2xl text-black"
            style={{ backgroundColor: accentColor }}
          >
            {isEnglish ? "Start Conversation!" : "¡Iniciar Conversación!"}
          </Button>
        </motion.div>
      </div>
    );
  }

  // ===== GAME OVER =====
  if (gameOver) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: bgColor }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-sm w-full">
          <div className="text-6xl mb-4">{pct >= 70 ? "🏆" : pct >= 40 ? "⭐" : "💪"}</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isEnglish ? "Conversation complete!" : "¡Conversación completa!"}
          </h2>
          <p className="text-4xl font-bold mb-1" style={{ color: accentColor }}>{pct}%</p>
          <p className="text-white/60 text-sm mb-6">
            {score}/{questions.length} {isEnglish ? "correct answers" : "respuestas correctas"}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRestart} className="font-bold rounded-xl text-black" style={{ backgroundColor: accentColor }}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {isEnglish ? "Try Again" : "Intentar de nuevo"}
            </Button>
            <Button onClick={onBack} variant="ghost" className="text-white/60 hover:text-white rounded-xl border border-white/20">
              {isEnglish ? "Back to menu" : "Volver al menú"}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ===== ACTIVE GAME =====
  return (
    <div className="min-h-screen flex flex-col" style={{ background: bgColor }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xl">{waiterEmoji}</span>
          <div>
            <p className="text-white font-bold text-sm leading-tight">{waiterName}</p>
            <p className="text-xs" style={{ color: accentColor }}>{restaurantName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {ttsSupported && (
            <button
              onClick={toggleMute}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              title={isMuted ? (isEnglish ? "Unmute" : "Activar sonido") : (isEnglish ? "Mute" : "Silenciar")}
            >
              {isMuted
                ? <VolumeX className="w-4 h-4 text-white/50" />
                : <Volume2 className="w-4 h-4" style={{ color: isSpeaking ? accentColor : "white" }} />}
            </button>
          )}
          <Star className="w-4 h-4" style={{ color: accentColor }} />
          <span className="text-white font-bold text-sm">{score}/{questions.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${((currentIndex) / questions.length) * 100}%`, backgroundColor: accentColor }}
        />
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {chatHistory.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "student" ? "justify-end" : "justify-start"} gap-2`}
          >
            {msg.role === "waiter" && (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-base shrink-0 mt-1">
                {waiterEmoji}
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "waiter"
                  ? "bg-white/10 text-white rounded-tl-sm"
                  : "text-white rounded-tr-sm"
              }`}
              style={msg.role === "student" ? { backgroundColor: accentColor + "33", border: `1px solid ${accentColor}44` } : {}}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Current question + controls */}
      <div className="px-4 pb-6 pt-2 space-y-3">
        {/* Current Q display */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-start gap-2 mb-2">
            <span className="text-lg">{waiterEmoji}</span>
            <p className="text-white text-sm font-medium leading-snug flex-1">{currentQ?.question}</p>
            <button
              onClick={() => speakText(currentQ?.question ?? "")}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0"
              style={{ color: accentColor }}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Hint */}
          {showHint && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 p-2 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-white/50 mb-0.5">{isEnglish ? "Hint:" : "Pista:"}</p>
              <p className="text-sm font-medium" style={{ color: accentColor }}>{currentQ?.hint}</p>
              <p className="text-xs text-white/40 mt-0.5">{currentQ?.translation}</p>
            </motion.div>
          )}
        </div>

        {/* Transcript result */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`rounded-2xl p-3 border text-sm ${
                showResult === "correct"
                  ? "bg-green-500/10 border-green-500/30 text-green-300"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{showResult === "correct" ? "✅" : "❌"}</span>
                <span className="font-medium text-xs">
                  {showResult === "correct"
                    ? (isEnglish ? "Great answer!" : "¡Excelente respuesta!")
                    : (isEnglish ? "Try again or see the answer" : "Intenta de nuevo o ve la respuesta")}
                </span>
              </div>
              <p className="text-white/70 italic">"{transcript}"</p>
              {showResult === "wrong" && (
                <p className="text-xs text-white/40 mt-1">
                  {isEnglish ? "Expected: " : "Esperado: "}
                  <span className="text-white/60">{currentQ?.expectedAnswer}</span>
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex gap-2">
          {!showResult ? (
            <>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex-1 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  isRecording ? "bg-red-600 text-white" : "text-black"
                }`}
                style={!isRecording ? { backgroundColor: accentColor } : {}}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    {isEnglish ? `Stop (${recordingTimer}s)` : `Parar (${recordingTimer}s)`}
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    {isEnglish ? "Answer" : "Responder"}
                  </>
                )}
              </button>
              <button
                onClick={() => setShowHint(!showHint)}
                className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                title={isEnglish ? "Show hint" : "Mostrar pista"}
              >
                💡
              </button>
            </>
          ) : (
            <Button
              onClick={handleNext}
              className="flex-1 py-4 font-bold rounded-2xl text-black"
              style={{ backgroundColor: accentColor }}
            >
              {currentIndex + 1 >= questions.length
                ? (isEnglish ? "See Results 🏆" : "Ver Resultados 🏆")
                : (isEnglish ? "Next Question →" : "Siguiente →")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
