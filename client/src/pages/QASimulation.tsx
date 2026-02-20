import { useState, useMemo, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation, useSearch } from "wouter";
import { ArrowLeft, Mic, MicOff, RotateCcw, Trophy, Star, ChevronRight, Sparkles, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GABI_ENGLISH = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/fSjaBTevqlMJYHae.png";
const CRIS_SPANISH = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/vTPizDjRBbaCIUNs.png";
const GABI_UNIFORM = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/DpukkKpvgfOJdjGU.png";
const CRIS_UNIFORM = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/ERTewrUOkIDhpEGI.png";

type QAItem = {
  question: string;
  expectedAnswer: string;
  hint: string;
  keywords: string[];
};

const QA_EN: QAItem[] = [
  { question: "Hi! Welcome to Organic In The Box. What can I get for you today?", expectedAnswer: "I'd like a cappuccino, please.", hint: "Order a drink", keywords: ["like", "have", "get", "please", "cappuccino", "coffee", "latte"] },
  { question: "Would you like anything to eat with that?", expectedAnswer: "Yes, I'll have the avocado toast, please.", hint: "Order some food", keywords: ["yes", "have", "like", "toast", "salad", "burger", "please"] },
  { question: "How would you like your coffee? Hot or iced?", expectedAnswer: "I'd like it hot, please.", hint: "Choose hot or iced", keywords: ["hot", "iced", "cold", "please", "like", "prefer"] },
  { question: "Would you like to add anything else to your order?", expectedAnswer: "No, that's all. Thank you!", hint: "Finish your order", keywords: ["no", "that", "all", "thank", "thanks", "enough"] },
  { question: "For here or to go?", expectedAnswer: "For here, please. I'll be sitting in the garden.", hint: "Eating in the garden", keywords: ["here", "please", "garden", "sitting", "stay"] },
  { question: "Can I get you something to drink?", expectedAnswer: "Could I get a fresh orange juice, please?", hint: "Order a juice", keywords: ["could", "can", "get", "juice", "water", "drink", "please"] },
  { question: "We have a special today — our açaí bowl. Would you like to try it?", expectedAnswer: "That sounds great! I'll have one, please.", hint: "Accept the special", keywords: ["sounds", "great", "sure", "yes", "have", "try", "please"] },
  { question: "Is there anything you're allergic to?", expectedAnswer: "I'm allergic to gluten. Do you have gluten-free options?", hint: "Mention dietary needs", keywords: ["allergic", "gluten", "free", "options", "lactose", "vegan", "no"] },
];

const QA_ES: QAItem[] = [
  { question: "¡Hola! Bienvenido a Organic In The Box. ¿Qué le puedo ofrecer hoy?", expectedAnswer: "Me gustaría un capuchino, por favor.", hint: "Pide una bebida", keywords: ["gustaría", "quiero", "favor", "capuchino", "café", "latte"] },
  { question: "¿Le gustaría algo de comer?", expectedAnswer: "Sí, me gustaría la tostada de aguacate, por favor.", hint: "Pide algo de comer", keywords: ["sí", "gustaría", "quiero", "tostada", "ensalada", "favor"] },
  { question: "¿Cómo prefiere su café? ¿Caliente o frío?", expectedAnswer: "Lo prefiero caliente, por favor.", hint: "Elige caliente o frío", keywords: ["caliente", "frío", "favor", "prefiero"] },
  { question: "¿Desea agregar algo más a su pedido?", expectedAnswer: "No, eso es todo. ¡Gracias!", hint: "Termina tu pedido", keywords: ["no", "todo", "gracias", "suficiente"] },
  { question: "¿Para comer aquí o para llevar?", expectedAnswer: "Para comer aquí, por favor. Estaré en el jardín.", hint: "Comer en el jardín", keywords: ["aquí", "favor", "jardín", "sentado"] },
  { question: "¿Puedo ofrecerle algo de beber?", expectedAnswer: "¿Podría traerme un jugo de naranja natural?", hint: "Pide un jugo", keywords: ["podría", "jugo", "naranja", "agua", "beber"] },
];

export default function QASimulation() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const lang = (params.get("lang") as "en" | "es") || "en";
  const isEnglish = lang === "en";

  const qaItems = isEnglish ? QA_EN : QA_ES;

  // Randomly pick waiter
  const [waiter] = useState(() => Math.random() > 0.5 ? "gabi" : "cris");
  const waiterImg = waiter === "gabi" ? (isEnglish ? GABI_ENGLISH : GABI_UNIFORM) : (isEnglish ? CRIS_UNIFORM : CRIS_SPANISH);
  const waiterName = waiter === "gabi" ? "Gabi" : "Cris";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const [chatHistory, setChatHistory] = useState<{ role: "waiter" | "student"; text: string }[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQA = qaItems[currentIndex];

  // Add waiter question to chat when index changes
  const initChat = () => {
    if (currentQA && chatHistory.length === 0) {
      setChatHistory([{ role: "waiter", text: currentQA.question }]);
    }
  };
  if (chatHistory.length === 0 && currentQA) {
    initChat();
  }

  const startRecording = () => {
    setTranscript("");
    setShowResult(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript(isEnglish ? "Speech recognition not supported. Try Chrome." : "Reconocimiento de voz no soportado. Usa Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = isEnglish ? "en-US" : "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: any) => {
      const bestMatch = event.results[0][0].transcript;
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
    if (!currentQA) return;
    const spoken = spokenText.toLowerCase().replace(/[.,!?¿¡]/g, "").trim();
    const spokenWords = spoken.split(/\s+/);

    setTotalAttempts(prev => prev + 1);

    // Check if answer contains enough keywords
    const matchedKeywords = currentQA.keywords.filter(kw => spokenWords.some(w => w.includes(kw.toLowerCase())));
    const matchRatio = matchedKeywords.length / Math.min(currentQA.keywords.length, 3);

    // Add student response to chat
    setChatHistory(prev => [...prev, { role: "student", text: spokenText }]);

    if (matchRatio >= 0.5 || spokenWords.length >= 3) {
      setScore(prev => prev + 1);
      setShowResult("correct");
      setChatHistory(prev => [...prev, {
        role: "waiter",
        text: isEnglish ? "Perfect! Great answer! 👏" : "¡Perfecto! ¡Gran respuesta! 👏"
      }]);
    } else {
      setShowResult("wrong");
      setChatHistory(prev => [...prev, {
        role: "waiter",
        text: isEnglish
          ? `Good try! A better answer would be: "${currentQA.expectedAnswer}"`
          : `¡Buen intento! Una mejor respuesta sería: "${currentQA.expectedAnswer}"`
      }]);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= qaItems.length) {
      setGameOver(true);
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setTranscript("");
      setShowResult(null);
      setShowHint(false);
      setChatHistory([{ role: "waiter", text: qaItems[nextIndex].question }]);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setTotalAttempts(0);
    setGameOver(false);
    setTranscript("");
    setShowResult(null);
    setShowHint(false);
    setChatHistory([{ role: "waiter", text: qaItems[0].question }]);
  };

  // ===== GAME OVER =====
  if (gameOver) {
    const percentage = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;
    const stars = percentage >= 90 ? 3 : percentage >= 60 ? 2 : percentage >= 30 ? 1 : 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--organic-light)] via-background to-background flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
            <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          </motion.div>

          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {isEnglish ? "Conversation Complete!" : "¡Conversación Completa!"}
          </h1>

          <div className="flex items-center justify-center gap-1 mb-4">
            {[1, 2, 3].map(i => (
              <Star key={i} className={`w-8 h-8 ${i <= stars ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
            ))}
          </div>

          <Card className="mb-6 border-primary/20">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{score}/{totalAttempts}</p>
                  <p className="text-xs text-muted-foreground">{isEnglish ? "Good answers" : "Buenas respuestas"}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{percentage}%</p>
                  <p className="text-xs text-muted-foreground">{isEnglish ? "Fluency" : "Fluidez"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button size="lg" className="w-full rounded-xl" onClick={handleRestart}>
              <RotateCcw className="w-4 h-4 mr-2" /> {isEnglish ? "Try Again" : "Intentar de Nuevo"}
            </Button>
            <Button variant="outline" size="lg" className="w-full rounded-xl" onClick={() => navigate(`/order?lang=${lang}`)}>
              🍽️ {isEnglish ? "Order for Real!" : "¡Pedir de Verdad!"}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/")}>
              ← {isEnglish ? "Back to Home" : "Volver al Inicio"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ===== GAME PLAY =====
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--organic-light)] via-background to-background flex flex-col">
      <div className="container mx-auto px-4 py-4 max-w-lg flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <p className="text-xs font-medium text-foreground">
              💬 {isEnglish ? "Waiter Q&A" : "Preguntas del Mesero"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {currentIndex + 1} / {qaItems.length}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" /> {score}
          </Badge>
        </div>

        {/* Progress */}
        <div className="w-full h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${((currentIndex + 1) / qaItems.length) * 100}%` }}
          />
        </div>

        {/* Chat area */}
        <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
          <AnimatePresence>
            {chatHistory.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex gap-2 ${msg.role === "student" ? "flex-row-reverse" : ""}`}
              >
                {msg.role === "waiter" && (
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-primary/20">
                    <img src={waiterImg} alt={waiterName} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === "waiter"
                    ? "bg-[var(--organic-cream)] text-foreground rounded-tl-sm"
                    : "bg-primary text-primary-foreground rounded-tr-sm"
                }`}>
                  {msg.role === "waiter" && (
                    <p className="text-[10px] font-semibold text-primary mb-0.5">{waiterName}</p>
                  )}
                  <p>{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Hint */}
        {!showResult && (
          <div className="text-center mb-3">
            {showHint ? (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                💡 {currentQA.hint}: <em>"{currentQA.expectedAnswer}"</em>
              </motion.p>
            ) : (
              <button
                onClick={() => setShowHint(true)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                💡 {isEnglish ? "Need a hint?" : "¿Necesitas una pista?"}
              </button>
            )}
          </div>
        )}

        {/* Recording / Next */}
        <div className="pb-4">
          {!showResult ? (
            <div className="flex items-center justify-center gap-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse"
                    : "bg-primary text-primary-foreground shadow-lg hover:shadow-xl"
                }`}
              >
                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </motion.button>
              {isRecording && (
                <p className="text-sm text-red-500 font-medium animate-pulse">{recordingTimer}s</p>
              )}
            </div>
          ) : (
            <Button size="lg" className="w-full rounded-xl" onClick={handleNext}>
              {currentIndex + 1 >= qaItems.length
                ? isEnglish ? "See Results" : "Ver Resultados"
                : isEnglish ? "Next Question" : "Siguiente Pregunta"
              } <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
