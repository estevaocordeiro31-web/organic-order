import { useState, useMemo, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation, useSearch } from "wouter";
import { ArrowLeft, Mic, MicOff, RotateCcw, Trophy, Star, ChevronRight, Eye, EyeOff, Sparkles, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GABI_ENGLISH = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/fSjaBTevqlMJYHae.png";
const CRIS_SPANISH = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/vTPizDjRBbaCIUNs.png";

type Difficulty = "easy" | "medium" | "hard";

export default function VoiceOrder() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const lang = (params.get("lang") as "en" | "es") || "en";
  const isEnglish = lang === "en";

  const { data: expressions, isLoading } = trpc.expressions.byLanguage.useQuery({ language: lang });

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

  const filteredExpressions = useMemo(() => {
    if (!expressions || !difficulty) return [];
    return expressions.filter(e => e.difficulty === difficulty);
  }, [expressions, difficulty]);

  const currentExpression = filteredExpressions[currentIndex];

  // For medium difficulty: show phrase then hide after 3 seconds
  useEffect(() => {
    if (difficulty === "medium" && currentExpression) {
      setShowPhrase(true);
      const timer = setTimeout(() => setShowPhrase(false), 3000);
      return () => clearTimeout(timer);
    } else if (difficulty === "easy") {
      setShowPhrase(true);
    } else if (difficulty === "hard") {
      setShowPhrase(false);
    }
  }, [difficulty, currentExpression, currentIndex]);

  const startRecording = () => {
    setTranscript("");
    setShowResult(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript("Speech recognition not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = isEnglish ? "en-US" : "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: any) => {
      const results = event.results[0];
      let bestMatch = results[0].transcript;

      // Check all alternatives for best match
      if (currentExpression) {
        const target = currentExpression.expression.toLowerCase();
        for (let i = 0; i < results.length; i++) {
          const alt = results[i].transcript.toLowerCase();
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

      // Check answer
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

    // Timer
    setRecordingTimer(0);
    timerRef.current = setInterval(() => {
      setRecordingTimer(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setRecordingTimer(0);
  };

  const checkAnswer = (spokenText: string) => {
    if (!currentExpression) return;
    const spoken = spokenText.toLowerCase().replace(/[.,!?]/g, "").trim();
    const target = currentExpression.expression.toLowerCase().replace(/[.,!?]/g, "").trim();

    setTotalAttempts(prev => prev + 1);

    // Flexible matching: check if key words match
    const spokenWords = spoken.split(/\s+/);
    const targetWords = target.split(/\s+/);
    const matchCount = targetWords.filter(w => spokenWords.includes(w)).length;
    const matchRatio = matchCount / targetWords.length;

    if (matchRatio >= 0.7 || spoken === target) {
      setScore(prev => prev + 1);
      setShowResult("correct");
    } else {
      setShowResult("wrong");
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= filteredExpressions.length) {
      setGameOver(true);
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

  const waiterImg = isEnglish ? GABI_ENGLISH : CRIS_SPANISH;
  const waiterName = isEnglish ? "Gabi" : "Cris";

  // ===== DIFFICULTY SELECTION =====
  if (!difficulty) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--organic-light)] via-background to-background">
        <div className="container mx-auto px-4 py-8 max-w-lg">
          <button
            onClick={() => navigate(`/?lang=${lang}`)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-primary/30 shadow-lg">
              <img src={waiterImg} alt={waiterName} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              🎤 {isEnglish ? "Voice Order" : "Pedido por Voz"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEnglish
                ? "Practice speaking ordering phrases out loud!"
                : "¡Practica diciendo frases de pedido en voz alta!"}
            </p>
          </div>

          <div className="space-y-3">
            <Card
              className="cursor-pointer hover:shadow-lg hover:border-green-300 transition-all border-2"
              onClick={() => setDifficulty("easy")}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {isEnglish ? "Easy — Read & Speak" : "Fácil — Leer y Hablar"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isEnglish
                      ? "See the phrase on screen while you record"
                      : "Ve la frase en pantalla mientras grabas"}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg hover:border-amber-300 transition-all border-2"
              onClick={() => setDifficulty("medium")}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <EyeOff className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {isEnglish ? "Medium — Memorize & Speak" : "Medio — Memorizar y Hablar"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isEnglish
                      ? "Phrase disappears after 3 seconds — then record!"
                      : "La frase desaparece después de 3 segundos — ¡luego graba!"}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg hover:border-red-300 transition-all border-2"
              onClick={() => setDifficulty("hard")}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <Mic className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {isEnglish ? "Hard — Listen & Answer" : "Difícil — Escuchar y Responder"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isEnglish
                      ? "Only see the translation — speak the phrase from memory!"
                      : "Solo ve la traducción — ¡di la frase de memoria!"}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
            {isEnglish ? "Great Speaking!" : "¡Gran Pronunciación!"}
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
                  <p className="text-xs text-muted-foreground">{isEnglish ? "Correct" : "Correctas"}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{percentage}%</p>
                  <p className="text-xs text-muted-foreground">{isEnglish ? "Accuracy" : "Precisión"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button size="lg" className="w-full rounded-xl" onClick={handleRestart}>
              <RotateCcw className="w-4 h-4 mr-2" /> {isEnglish ? "Play Again" : "Jugar de Nuevo"}
            </Button>
            <Button variant="outline" size="lg" className="w-full rounded-xl" onClick={() => navigate(`/order?lang=${lang}`)}>
              🍽️ {isEnglish ? "Order from Menu" : "Pedir del Menú"}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/")}>
              ← {isEnglish ? "Back to Home" : "Volver al Inicio"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ===== LOADING =====
  if (isLoading || !currentExpression) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // ===== GAME PLAY =====
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--organic-light)] via-background to-background">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setDifficulty(null)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Badge variant="outline" className="text-xs capitalize">
            {difficulty === "easy" ? "👁️" : difficulty === "medium" ? "🧠" : "🎯"} {difficulty}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" /> {score}
          </Badge>
        </div>

        {/* Progress */}
        <div className="w-full h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${((currentIndex + 1) / filteredExpressions.length) * 100}%` }}
          />
        </div>

        {/* Waiter prompt */}
        <Card className="mb-6 border-primary/20 bg-[var(--organic-cream)]">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-primary/20">
                <img src={waiterImg} alt={waiterName} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary mb-1">{waiterName}</p>
                <p className="text-sm text-foreground">
                  {difficulty === "easy"
                    ? isEnglish ? "Read this phrase out loud:" : "Lee esta frase en voz alta:"
                    : difficulty === "medium"
                    ? isEnglish ? "Memorize and say this phrase:" : "Memoriza y di esta frase:"
                    : isEnglish ? "How would you say this in English?" : "¿Cómo dirías esto en español?"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phrase display */}
        <div className="text-center mb-6">
          {(difficulty === "easy" || (difficulty === "medium" && showPhrase)) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <p className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                "{currentExpression.expression}"
              </p>
              {difficulty === "medium" && (
                <p className="text-xs text-amber-600 animate-pulse">
                  {isEnglish ? "Memorize it! Disappearing soon..." : "¡Memorízala! Desaparecerá pronto..."}
                </p>
              )}
            </motion.div>
          )}

          {difficulty === "medium" && !showPhrase && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="p-4 bg-muted rounded-xl">
                <EyeOff className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isEnglish ? "Phrase hidden! Now say it from memory." : "¡Frase oculta! Ahora dila de memoria."}
                </p>
              </div>
            </motion.div>
          )}

          {difficulty === "hard" && (
            <div className="p-4 bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">
                {isEnglish ? "Translation:" : "Traducción:"}
              </p>
              <p className="text-lg font-semibold text-foreground">
                "{currentExpression.translation}"
              </p>
            </div>
          )}
        </div>

        {/* Recording area */}
        <div className="text-center mb-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!!showResult}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 transition-all ${
              isRecording
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse"
                : showResult
                ? "bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground shadow-lg hover:shadow-xl"
            }`}
          >
            {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </motion.button>

          {isRecording && (
            <p className="text-sm text-red-500 font-medium animate-pulse">
              {isEnglish ? `Recording... ${recordingTimer}s` : `Grabando... ${recordingTimer}s`}
            </p>
          )}

          {!isRecording && !transcript && !showResult && (
            <p className="text-sm text-muted-foreground">
              {isEnglish ? "Tap the microphone to start speaking" : "Toca el micrófono para empezar a hablar"}
            </p>
          )}
        </div>

        {/* Transcript */}
        {transcript && (
          <Card className={`mb-4 ${
            showResult === "correct" ? "border-green-300 bg-green-50" :
            showResult === "wrong" ? "border-red-300 bg-red-50" :
            "border-border"
          }`}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                {isEnglish ? "You said:" : "Dijiste:"}
              </p>
              <p className="text-base font-medium text-foreground">"{transcript}"</p>
            </CardContent>
          </Card>
        )}

        {/* Result feedback */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl mb-4 text-center ${
                showResult === "correct" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
              }`}
            >
              {showResult === "correct" ? (
                <>
                  <Sparkles className="w-6 h-6 text-green-500 mx-auto mb-1" />
                  <p className="font-semibold text-green-700 text-sm">
                    {isEnglish ? "Great pronunciation!" : "¡Gran pronunciación!"}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-red-700 text-sm mb-1">
                    {isEnglish ? "Almost there!" : "¡Casi!"}
                  </p>
                  <p className="text-xs text-red-600">
                    {isEnglish ? "Correct: " : "Correcto: "}
                    <strong>"{currentExpression.expression}"</strong>
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="space-y-2">
          {showResult ? (
            <Button size="lg" className="w-full rounded-xl" onClick={handleNext}>
              {currentIndex + 1 >= filteredExpressions.length
                ? isEnglish ? "See Results" : "Ver Resultados"
                : isEnglish ? "Next Phrase" : "Siguiente Frase"
              } <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
