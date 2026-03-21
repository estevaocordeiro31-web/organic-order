import { useState, useEffect, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation, useSearch } from "wouter";
import { ArrowLeft, Mic, MicOff, RotateCcw, Trophy, Star, ChevronRight, Eye, EyeOff, Sparkles, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTTS } from "@/hooks/useTTS";

const GABI_ENGLISH = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/fSjaBTevqlMJYHae.png";
const CRIS_SPANISH = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/vTPizDjRBbaCIUNs.png";
const GABI_UNIFORM = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/DpukkKpvgfOJdjGU.png";
const CRIS_UNIFORM = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/ERTewrUOkIDhpEGI.png";

type Difficulty = "easy" | "medium" | "hard";

export default function VoiceOrder() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const lang = (params.get("lang") as "en" | "es") || "en";
  const studentName = params.get("student") || "";
  const isEnglish = lang === "en";

  const { data: expressions, isLoading } = trpc.expressions.byLanguage.useQuery({ language: lang });
  const saveScoreMutation = trpc.game.saveScore.useMutation();

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

  // Randomly pick waiter
  const [waiter] = useState(() => Math.random() > 0.5 ? "gabi" : "cris");
  const waiterImg = waiter === "gabi" ? GABI_UNIFORM : CRIS_UNIFORM;
  const waiterLangImg = isEnglish ? GABI_ENGLISH : CRIS_SPANISH;
  const waiterName = waiter === "gabi" ? "Gabi" : "Cris";

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

  // TTS: speak the phrase for the student to hear
  const speakPhrase = (text: string) => speak(text, lang, 0.85);

  const startRecording = () => {
    setTranscript("");
    setShowResult(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript(isEnglish
        ? "Speech recognition not supported in this browser. Try Chrome on your phone!"
        : "Reconocimiento de voz no soportado. ¡Usa Chrome en tu celular!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = isEnglish ? "en-US" : "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;

    recognition.onresult = (event: any) => {
      const results = event.results[0];
      let bestMatch = results[0].transcript;

      // Check all alternatives for best match
      if (currentExpression) {
        const target = currentExpression.expression.toLowerCase().replace(/[.,!?']/g, "");
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
    if (!currentExpression) return;
    const spoken = spokenText.toLowerCase().replace(/[.,!?']/g, "").trim();
    const target = currentExpression.expression.toLowerCase().replace(/[.,!?']/g, "").trim();

    setTotalAttempts(prev => prev + 1);

    // Flexible matching
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
    if (currentIndex + 1 >= filteredExpressions.length) {
      setGameOver(true);
      // Save score
      if (studentName && difficulty) {
        saveScoreMutation.mutate({
          studentName,
          gameType: "voice_order",
          difficulty,
          score,
          totalQuestions: totalAttempts,
          language: lang,
        });
      }
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
      <div className="min-h-screen bg-gradient-to-b from-[var(--organic-light)] via-background to-background">
        <div className="container mx-auto px-4 py-8 max-w-lg">
          <button
            onClick={() => navigate(`/?lang=${lang}`)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {isEnglish ? "Back" : "Volver"}
          </button>

          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-2 border-primary/30 shadow-lg">
              <img src={waiterImg} alt={waiterName} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              {isEnglish ? "Voice Order" : "Pedido por Voz"}
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
                <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                  <Eye className="w-7 h-7 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {isEnglish ? "Easy — Read & Speak" : "Fácil — Leer y Hablar"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isEnglish
                      ? "See the phrase on screen while you record your voice"
                      : "Ve la frase en pantalla mientras grabas tu voz"}
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
                <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <EyeOff className="w-7 h-7 text-amber-600" />
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
                <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <Mic className="w-7 h-7 text-red-600" />
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
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{score}/{totalAttempts}</p>
                  <p className="text-xs text-muted-foreground">{isEnglish ? "Correct" : "Correctas"}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{percentage}%</p>
                  <p className="text-xs text-muted-foreground">{isEnglish ? "Accuracy" : "Precisión"}</p>
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
          <div className="flex items-center gap-2">
            {ttsSupported && (
              <button
                onClick={toggleMute}
                className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                title={isMuted ? (isEnglish ? "Unmute" : "Activar sonido") : (isEnglish ? "Mute" : "Silenciar")}
              >
                {isMuted
                  ? <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
                  : <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? "text-primary" : "text-muted-foreground"}`} />}
              </button>
            )}
            <Badge variant="secondary" className="text-xs">
              <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" /> {score}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full h-2 bg-muted rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${((currentIndex + 1) / filteredExpressions.length) * 100}%` }}
          />
        </div>

        {/* Waiter prompt */}
        <Card className="mb-6 border-primary/20 bg-[var(--organic-cream)]">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-primary/20 shadow">
                <img src={waiterImg} alt={waiterName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-primary mb-1">{waiterName}</p>
                <p className="text-sm text-foreground">
                  {difficulty === "easy"
                    ? isEnglish ? "Read this phrase out loud:" : "Lee esta frase en voz alta:"
                    : difficulty === "medium"
                    ? isEnglish ? "Memorize and say this phrase:" : "Memoriza y di esta frase:"
                    : isEnglish ? "How would you say this?" : "¿Cómo dirías esto?"}
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
              className="relative"
            >
              <p className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                "{currentExpression.expression}"
              </p>
              <p className="text-xs text-muted-foreground mb-3 italic">
                {currentExpression.translation}
              </p>
              <button
                onClick={() => speakPhrase(currentExpression.expression)}
                disabled={isSpeaking}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSpeaking ? "bg-primary/20 text-primary animate-pulse" : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                {isSpeaking ? (isEnglish ? "Playing..." : "Reproduciendo...") : (isEnglish ? "Listen" : "Escuchar")}
              </button>
              {difficulty === "medium" && (
                <p className="text-xs text-amber-600 animate-pulse mt-2">
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
            whileTap={{ scale: 0.9 }}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!!showResult}
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-3 transition-all ${
              isRecording
                ? "bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse"
                : showResult
                ? "bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-105"
            }`}
          >
            {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
          </motion.button>

          {isRecording && (
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <p className="text-sm text-red-500 font-medium">
                {isEnglish ? `Recording... ${recordingTimer}s` : `Grabando... ${recordingTimer}s`}
              </p>
            </div>
          )}

          {!isRecording && !transcript && !showResult && (
            <p className="text-sm text-muted-foreground">
              {isEnglish ? "Tap the microphone to start speaking" : "Toca el micrófono para empezar a hablar"}
            </p>
          )}
        </div>

        {/* Transcript & Result */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`mb-4 ${
                showResult === "correct" ? "border-green-400 bg-green-50" :
                showResult === "wrong" ? "border-red-400 bg-red-50" :
                "border-border"
              }`}>
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    {isEnglish ? "You said:" : "Dijiste:"}
                  </p>
                  <p className="text-base font-medium text-foreground mb-3">"{transcript}"</p>

                  {showResult === "correct" && (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Sparkles className="w-5 h-5" />
                      <p className="font-semibold text-sm">
                        {isEnglish ? "Excellent pronunciation!" : "¡Excelente pronunciación!"}
                      </p>
                    </div>
                  )}

                  {showResult === "wrong" && (
                    <div>
                      <p className="font-semibold text-red-600 text-sm mb-1">
                        {isEnglish ? "Almost there! Try to say:" : "¡Casi! Intenta decir:"}
                      </p>
                      <p className="text-sm text-red-700 font-medium">"{currentExpression.expression}"</p>
                      <button
                        onClick={() => speakPhrase(currentExpression.expression)}
                        className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      >
                        <Volume2 className="w-3 h-3" /> {isEnglish ? "Hear correct" : "Escuchar correcto"}
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
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
