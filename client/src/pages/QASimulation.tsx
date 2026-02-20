import { useState, useMemo, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation, useSearch } from "wouter";
import { ArrowLeft, Mic, MicOff, RotateCcw, Trophy, Star, ChevronRight, MessageCircle, Sparkles, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GABI_UNIFORM = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/DpukkKpvgfOJdjGU.png";
const CRIS_UNIFORM = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/ERTewrUOkIDhpEGI.png";

type QAPair = {
  question: string;
  expectedAnswer: string;
  translation: string;
  hint: string;
  keywords: string[];
};

const qaEnglish: QAPair[] = [
  { question: "Hi! Welcome to Organic. What can I get you today?", expectedAnswer: "I'd like a cappuccino, please.", translation: "Eu gostaria de um cappuccino, por favor.", hint: "I'd like a...", keywords: ["like", "cappuccino", "please"] },
  { question: "Would you like anything to eat with that?", expectedAnswer: "Yes, I'll have the avocado toast.", translation: "Sim, vou querer a torrada de abacate.", hint: "I'll have the...", keywords: ["have", "avocado", "toast"] },
  { question: "What size would you like for your coffee?", expectedAnswer: "A large one, please.", translation: "Um grande, por favor.", hint: "A large...", keywords: ["large", "please"] },
  { question: "Would you like to add anything else to your order?", expectedAnswer: "Could I also get a green juice?", translation: "Poderia pedir também um suco verde?", hint: "Could I also get...", keywords: ["could", "also", "green", "juice"] },
  { question: "How would you like to pay?", expectedAnswer: "I'll pay by card, please.", translation: "Vou pagar no cartão, por favor.", hint: "I'll pay by...", keywords: ["pay", "card", "please"] },
  { question: "For here or to go?", expectedAnswer: "For here, please. I'll sit in the garden.", translation: "Para comer aqui, por favor. Vou sentar no jardim.", hint: "For here...", keywords: ["here", "please", "garden"] },
  { question: "Can I get you anything else?", expectedAnswer: "No, that's all. Thank you!", translation: "Não, é só isso. Obrigado!", hint: "That's all...", keywords: ["that", "all", "thank"] },
  { question: "Do you have any dietary restrictions?", expectedAnswer: "I'm looking for gluten-free options.", translation: "Estou procurando opções sem glúten.", hint: "I'm looking for...", keywords: ["looking", "gluten", "free"] },
  { question: "Would you like to try our special of the day?", expectedAnswer: "Sure, what do you recommend?", translation: "Claro, o que você recomenda?", hint: "What do you...", keywords: ["sure", "recommend"] },
  { question: "Your order is ready! Enjoy your meal!", expectedAnswer: "Thank you so much! It looks delicious.", translation: "Muito obrigado! Parece delicioso.", hint: "Thank you...", keywords: ["thank", "delicious", "looks"] },
];

const qaSpanish: QAPair[] = [
  { question: "¡Hola! Bienvenido a Organic. ¿Qué te puedo servir hoy?", expectedAnswer: "Me gustaría un cappuccino, por favor.", translation: "Eu gostaria de um cappuccino, por favor.", hint: "Me gustaría...", keywords: ["gustaría", "cappuccino", "favor"] },
  { question: "¿Te gustaría algo para comer con eso?", expectedAnswer: "Sí, voy a pedir la tostada de aguacate.", translation: "Sim, vou pedir a torrada de abacate.", hint: "Voy a pedir...", keywords: ["pedir", "tostada", "aguacate"] },
  { question: "¿De qué tamaño quieres tu café?", expectedAnswer: "Uno grande, por favor.", translation: "Um grande, por favor.", hint: "Uno grande...", keywords: ["grande", "favor"] },
  { question: "¿Quieres agregar algo más a tu pedido?", expectedAnswer: "¿Podría también pedir un jugo verde?", translation: "Poderia pedir também um suco verde?", hint: "¿Podría también...", keywords: ["podría", "también", "jugo", "verde"] },
  { question: "¿Cómo te gustaría pagar?", expectedAnswer: "Voy a pagar con tarjeta, por favor.", translation: "Vou pagar no cartão, por favor.", hint: "Voy a pagar...", keywords: ["pagar", "tarjeta", "favor"] },
  { question: "¿Para aquí o para llevar?", expectedAnswer: "Para aquí, por favor. Voy a sentarme en el jardín.", translation: "Para comer aqui, por favor. Vou sentar no jardim.", hint: "Para aquí...", keywords: ["aquí", "favor", "jardín"] },
  { question: "¿Te puedo traer algo más?", expectedAnswer: "No, eso es todo. ¡Gracias!", translation: "Não, é só isso. Obrigado!", hint: "Eso es todo...", keywords: ["eso", "todo", "gracias"] },
  { question: "¿Tienes alguna restricción alimentaria?", expectedAnswer: "Estoy buscando opciones sin gluten.", translation: "Estou procurando opções sem glúten.", hint: "Estoy buscando...", keywords: ["buscando", "opciones", "gluten"] },
];

export default function QASimulation() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const lang = (params.get("lang") as "en" | "es") || "en";
  const studentName = params.get("student") || "";
  const isEnglish = lang === "en";

  const saveScoreMutation = trpc.game.saveScore.useMutation();

  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const [chatHistory, setChatHistory] = useState<{ role: "waiter" | "student"; text: string }[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [waiter] = useState(() => Math.random() > 0.5 ? "gabi" : "cris");
  const waiterImg = waiter === "gabi" ? GABI_UNIFORM : CRIS_UNIFORM;
  const waiterName = waiter === "gabi" ? "Gabi" : "Cris";

  const questions = useMemo(() => isEnglish ? qaEnglish : qaSpanish, [isEnglish]);
  const currentQ = questions[currentIndex];

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isEnglish ? "en-US" : "es-ES";
      utterance.rate = 0.85;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

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
        const targetKws = currentQ.keywords.map(k => k.toLowerCase());
        let bestKeywordCount = 0;
        for (let i = 0; i < results.length; i++) {
          const alt = results[i].transcript.toLowerCase();
          const count = targetKws.filter(kw => alt.includes(kw)).length;
          if (count > bestKeywordCount) {
            bestKeywordCount = count;
            bestMatch = results[i].transcript;
          }
        }
      }

      setTranscript(bestMatch);
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTimer(0);

      // Add student response to chat
      setChatHistory(prev => [...prev, { role: "student", text: bestMatch }]);
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
    const spoken = spokenText.toLowerCase().replace(/[.,!?¡¿']/g, "").trim();
    const keywordsMatched = currentQ.keywords.filter(kw => spoken.includes(kw.toLowerCase())).length;
    const matchRatio = keywordsMatched / currentQ.keywords.length;

    if (matchRatio >= 0.5) {
      setScore(prev => prev + 1);
      setShowResult("correct");
      setChatHistory(prev => [...prev, {
        role: "waiter",
        text: isEnglish ? "Perfect! Great answer!" : "¡Perfecto! ¡Gran respuesta!"
      }]);
    } else {
      setShowResult("wrong");
      setChatHistory(prev => [...prev, {
        role: "waiter",
        text: isEnglish
          ? `Good try! A better answer: "${currentQ.expectedAnswer}"`
          : `¡Buen intento! Mejor respuesta: "${currentQ.expectedAnswer}"`
      }]);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setGameOver(true);
      if (studentName) {
        saveScoreMutation.mutate({
          studentName,
          gameType: "qa_simulation",
          difficulty: "hard",
          score,
          totalQuestions: questions.length,
          language: lang,
        });
      }
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setTranscript("");
      setShowResult(null);
      setShowHint(false);
      setChatHistory([{ role: "waiter", text: questions[nextIndex].question }]);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setGameOver(false);
    setStarted(false);
    setTranscript("");
    setShowResult(null);
    setShowHint(false);
    setChatHistory([]);
  };

  // ===== INTRO =====
  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--organic-light)] via-background to-background">
        <div className="container mx-auto px-4 py-8 max-w-lg">
          <button
            onClick={() => navigate(`/?lang=${lang}`)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {isEnglish ? "Back" : "Volver"}
          </button>

          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-primary/30 shadow-lg">
              <img src={waiterImg} alt={waiterName} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              {isEnglish ? "Q&A Simulation" : "Simulación Q&A"}
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              {isEnglish
                ? `${waiterName} will ask you questions like a real waiter. Answer by speaking into the microphone!`
                : `${waiterName} te hará preguntas como un mesero real. ¡Responde hablando al micrófono!`}
            </p>
          </div>

          <Card className="mb-6 border-primary/20 bg-[var(--organic-cream)]">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground text-sm mb-3">
                {isEnglish ? "How it works:" : "Cómo funciona:"}
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p>{isEnglish ? "The waiter asks you a question" : "El mesero te hace una pregunta"}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Volume2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p>{isEnglish ? "Listen to the question (tap the speaker)" : "Escucha la pregunta (toca el altavoz)"}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Mic className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p>{isEnglish ? "Record your answer using the microphone" : "Graba tu respuesta usando el micrófono"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button size="lg" className="w-full rounded-xl" onClick={() => {
            setStarted(true);
            setChatHistory([{ role: "waiter", text: questions[0].question }]);
          }}>
            {isEnglish ? "Start Simulation" : "Iniciar Simulación"}
          </Button>
        </div>
      </div>
    );
  }

  // ===== GAME OVER =====
  if (gameOver) {
    const percentage = Math.round((score / questions.length) * 100);
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
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{score}/{questions.length}</p>
                  <p className="text-xs text-muted-foreground">{isEnglish ? "Correct" : "Correctas"}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{percentage}%</p>
                  <p className="text-xs text-muted-foreground">{isEnglish ? "Fluency" : "Fluidez"}</p>
                </div>
                <div>
                  <div className="flex justify-center gap-0.5">
                    {[1, 2, 3].map(i => (
                      <Star key={i} className={`w-5 h-5 ${i <= stars ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{isEnglish ? "Rating" : "Nivel"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button size="lg" className="w-full rounded-xl" onClick={handleRestart}>
              <RotateCcw className="w-4 h-4 mr-2" /> {isEnglish ? "Play Again" : "Jugar de Nuevo"}
            </Button>
            <Button variant="outline" size="lg" className="w-full rounded-xl" onClick={() => navigate(`/game/leaderboard?lang=${lang}`)}>
              <Trophy className="w-4 h-4 mr-2" /> {isEnglish ? "Leaderboard" : "Ranking"}
            </Button>
            <Button variant="outline" size="lg" className="w-full rounded-xl" onClick={() => navigate(`/order?lang=${lang}`)}>
              {isEnglish ? "Order from Menu" : "Pedir del Menú"}
            </Button>
            <Button variant="ghost" onClick={() => navigate(`/?lang=${lang}`)}>
              {isEnglish ? "Back to Home" : "Volver al Inicio"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ===== GAMEPLAY (Chat style) =====
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--organic-light)] via-background to-background flex flex-col">
      <div className="container mx-auto px-4 py-4 max-w-lg flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setStarted(false)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Badge variant="outline" className="text-xs">
            {currentIndex + 1}/{questions.length}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" /> {score}
          </Badge>
        </div>

        {/* Progress */}
        <div className="w-full h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
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
                transition={{ delay: i * 0.05 }}
                className={`flex gap-2 ${msg.role === "student" ? "flex-row-reverse" : ""}`}
              >
                {msg.role === "waiter" && (
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-primary/20">
                    <img src={waiterImg} alt={waiterName} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === "waiter"
                    ? "bg-[var(--organic-cream)] text-foreground rounded-tl-sm"
                    : "bg-primary text-primary-foreground rounded-tr-sm"
                }`}>
                  {msg.role === "waiter" && i === 0 && (
                    <p className="text-[10px] font-semibold text-primary mb-0.5">{waiterName}</p>
                  )}
                  <p>{msg.text}</p>
                  {msg.role === "waiter" && i === chatHistory.length - 1 && !showResult && chatHistory.length <= 1 && (
                    <button
                      onClick={() => speakText(msg.text)}
                      disabled={isSpeaking}
                      className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all ${
                        isSpeaking ? "bg-primary/20 text-primary animate-pulse" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Volume2 className="w-3 h-3" />
                      {isSpeaking ? "..." : (isEnglish ? "Listen" : "Escuchar")}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Translation */}
        <p className="text-xs text-muted-foreground text-center mb-2 italic">
          {currentQ.translation}
        </p>

        {/* Hint */}
        {!showResult && (
          <div className="text-center mb-3">
            {showHint ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                  💡 {currentQ.hint}
                </Badge>
              </motion.div>
            ) : (
              <button
                onClick={() => setShowHint(true)}
                className="text-xs text-primary hover:underline"
              >
                {isEnglish ? "Need a hint?" : "¿Necesitas una pista?"}
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
              {currentIndex + 1 >= questions.length
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
