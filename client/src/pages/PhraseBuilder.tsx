import { useState, useMemo, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation, useSearch } from "wouter";
import { ArrowLeft, RotateCcw, Trophy, Star, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";

const GABI_ENGLISH = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/fSjaBTevqlMJYHae.png";
const CRIS_SPANISH = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/vTPizDjRBbaCIUNs.png";

type Chunk = { id: string; text: string };

export default function PhraseBuilder() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const lang = (params.get("lang") as "en" | "es") || "en";
  const isEnglish = lang === "en";

  const { data: expressions, isLoading } = trpc.expressions.byLanguage.useQuery({ language: lang });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledChunks, setShuffledChunks] = useState<Chunk[]>([]);
  const [selectedChunks, setSelectedChunks] = useState<Chunk[]>([]);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | null>(null);

  const filteredExpressions = useMemo(() => {
    if (!expressions || !difficulty) return [];
    return expressions.filter(e => e.difficulty === difficulty);
  }, [expressions, difficulty]);

  const currentExpression = filteredExpressions[currentIndex];

  useEffect(() => {
    if (currentExpression) {
      try {
        const chunks: string[] = JSON.parse(currentExpression.chunks as string);
        const mapped = chunks.map((text, i) => ({ id: `chunk-${i}`, text }));
        // Shuffle
        const shuffled = [...mapped].sort(() => Math.random() - 0.5);
        setShuffledChunks(shuffled);
        setSelectedChunks([]);
        setShowResult(null);
      } catch {
        setShuffledChunks([]);
      }
    }
  }, [currentExpression]);

  const handleSelectChunk = useCallback((chunk: Chunk) => {
    setShuffledChunks(prev => prev.filter(c => c.id !== chunk.id));
    setSelectedChunks(prev => [...prev, chunk]);
  }, []);

  const handleRemoveChunk = useCallback((chunk: Chunk) => {
    setSelectedChunks(prev => prev.filter(c => c.id !== chunk.id));
    setShuffledChunks(prev => [...prev, chunk]);
  }, []);

  const handleCheck = () => {
    if (!currentExpression) return;
    const userAnswer = selectedChunks.map(c => c.text).join(" ");
    const correctAnswer = currentExpression.expression;

    setTotalAttempts(prev => prev + 1);

    if (userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
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
    }
  };

  const handleReset = () => {
    if (currentExpression) {
      try {
        const chunks2: string[] = JSON.parse(currentExpression.chunks as string);
        const mapped2 = chunks2.map((text, i) => ({ id: `chunk-${i}`, text }));
        const shuffled = [...mapped2].sort(() => Math.random() - 0.5);
        setShuffledChunks(shuffled);
        setSelectedChunks([]);
        setShowResult(null);
      } catch {
        // ignore
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setTotalAttempts(0);
    setGameOver(false);
    setDifficulty(null);
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
              🧩 {isEnglish ? "Phrase Builder" : "Constructor de Frases"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEnglish
                ? "Put the chunks in the right order to build ordering phrases"
                : "Ordena los fragmentos para construir frases de pedido"}
            </p>
          </div>

          <div className="space-y-3">
            {(["easy", "medium", "hard"] as const).map((d) => (
              <Card
                key={d}
                className="cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all border-2"
                onClick={() => setDifficulty(d)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    d === "easy" ? "bg-green-100" : d === "medium" ? "bg-amber-100" : "bg-red-100"
                  }`}>
                    <span className="text-xl">
                      {d === "easy" ? "⭐" : d === "medium" ? "⭐⭐" : "⭐⭐⭐"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground capitalize">{d}</h3>
                    <p className="text-xs text-muted-foreground">
                      {d === "easy"
                        ? isEnglish ? "Simple ordering phrases" : "Frases simples de pedido"
                        : d === "medium"
                        ? isEnglish ? "Common restaurant expressions" : "Expresiones comunes de restaurante"
                        : isEnglish ? "Complex ordering situations" : "Situaciones complejas de pedido"}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
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
            {isEnglish ? "Great Job!" : "¡Buen Trabajo!"}
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
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {currentIndex + 1} / {filteredExpressions.length}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" /> {score}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
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
                  {isEnglish
                    ? "Put these words in the right order:"
                    : "Pon estas palabras en el orden correcto:"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 italic">
                  {currentExpression.translation}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answer area */}
        <div className="min-h-[60px] p-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 mb-4 flex flex-wrap gap-2 items-start">
          {selectedChunks.length === 0 && (
            <p className="text-xs text-muted-foreground/50 w-full text-center py-2">
              {isEnglish ? "Tap the words below to build the phrase" : "Toca las palabras abajo para construir la frase"}
            </p>
          )}
          <AnimatePresence>
            {selectedChunks.map((chunk) => (
              <motion.button
                key={chunk.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => !showResult && handleRemoveChunk(chunk)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  showResult === "correct"
                    ? "bg-green-500 text-white"
                    : showResult === "wrong"
                    ? "bg-red-500 text-white"
                    : "bg-primary text-primary-foreground hover:bg-primary/80"
                }`}
              >
                {chunk.text}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Available chunks */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <AnimatePresence>
            {shuffledChunks.map((chunk) => (
              <motion.button
                key={chunk.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() => !showResult && handleSelectChunk(chunk)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-muted text-foreground hover:bg-accent transition-colors border border-border"
              >
                {chunk.text}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Result feedback */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-xl mb-4 text-center ${
                showResult === "correct"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {showResult === "correct" ? (
                <>
                  <Sparkles className="w-6 h-6 text-green-500 mx-auto mb-1" />
                  <p className="font-semibold text-green-700 text-sm">
                    {isEnglish ? "Perfect!" : "¡Perfecto!"}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-red-700 text-sm mb-1">
                    {isEnglish ? "Not quite!" : "¡Casi!"}
                  </p>
                  <p className="text-xs text-red-600">
                    {isEnglish ? "Correct answer: " : "Respuesta correcta: "}
                    <strong>{currentExpression.expression}</strong>
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="space-y-2">
          {!showResult ? (
            <>
              <Button
                size="lg"
                className="w-full rounded-xl"
                disabled={selectedChunks.length === 0}
                onClick={handleCheck}
              >
                {isEnglish ? "Check Answer" : "Verificar Respuesta"}
              </Button>
              <Button variant="ghost" size="sm" className="w-full" onClick={handleReset}>
                <RotateCcw className="w-3 h-3 mr-1" /> {isEnglish ? "Reset" : "Reiniciar"}
              </Button>
            </>
          ) : (
            <Button size="lg" className="w-full rounded-xl" onClick={handleNext}>
              {currentIndex + 1 >= filteredExpressions.length
                ? isEnglish ? "See Results" : "Ver Resultados"
                : isEnglish ? "Next Phrase" : "Siguiente Frase"
              } <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
