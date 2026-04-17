import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation, useSearch } from "wouter";
import { ArrowLeft, Trophy, Medal, Star, Crown, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";

const GABI_UNIFORM = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/DpukkKpvgfOJdjGU.png";
const CRIS_UNIFORM = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663292442852/ERTewrUOkIDhpEGI.png";

const gameLabels: Record<string, { en: string; es: string; icon: string }> = {
  phrase_builder: { en: "Phrase Builder", es: "Constructor de Frases", icon: "🧩" },
  voice_order: { en: "Voice Order", es: "Pedido por Voz", icon: "🎤" },
  qa_simulation: { en: "Q&A Simulation", es: "Simulación Q&A", icon: "💬" },
};

export default function Leaderboard() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const lang = (params.get("lang") as "en" | "es") || "en";
  const isEnglish = lang === "en";

  const { data: leaderboard, isLoading } = trpc.game.leaderboard.useQuery({ language: lang });

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-amber-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-muted-foreground">{index + 1}</span>;
  };

  const getRankBg = (index: number) => {
    if (index === 0) return "bg-amber-500/10 border-amber-500/20";
    if (index === 1) return "bg-white/5 border-white/10";
    if (index === 2) return "bg-orange-500/10 border-orange-500/20";
    return "bg-card border-border";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--organic-light)] via-background to-background">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Header */}
        <button
          onClick={() => navigate(`/?lang=${lang}`)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {isEnglish ? "Back" : "Volver"}
        </button>

        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.1 }}
          >
            <Trophy className="w-14 h-14 text-amber-500 mx-auto mb-3" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            {isEnglish ? "Leaderboard" : "Ranking"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEnglish ? "Top students at ImAInd" : "Mejores estudiantes en ImAInd"}
          </p>
        </div>

        {/* Leaderboard */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !leaderboard || leaderboard.length === 0 ? (
          <Card className="border-dashed border-2 border-primary/20">
            <CardContent className="p-8 text-center">
              <Gamepad2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">
                {isEnglish ? "No scores yet!" : "¡Sin puntuaciones aún!"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isEnglish
                  ? "Be the first to play and get on the leaderboard!"
                  : "¡Sé el primero en jugar y aparecer en el ranking!"}
              </p>
              <Button onClick={() => navigate(`/?lang=${lang}`)}>
                {isEnglish ? "Play Now" : "Jugar Ahora"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry: any, index: number) => (
              <motion.div
                key={`${entry.studentName}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border ${getRankBg(index)} transition-all`}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-8 flex items-center justify-center shrink-0">
                      {getRankIcon(index)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">
                        {entry.studentName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {entry.gamesPlayed} {isEnglish ? "games" : "juegos"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {isEnglish ? "Best" : "Mejor"}: {entry.bestPercentage}%
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-foreground text-sm">
                          {entry.totalScore}/{entry.totalQuestions}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {Math.round((entry.totalScore / Math.max(entry.totalQuestions, 1)) * 100)}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Waiter encouragement */}
        <div className="mt-8 flex items-start gap-3 p-4 rounded-xl bg-[var(--organic-cream)] border border-primary/10">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-primary/20">
            <img src={isEnglish ? GABI_UNIFORM : CRIS_UNIFORM} alt="Waiter" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-xs font-semibold text-primary mb-0.5">{isEnglish ? "Gabi" : "Cris"}</p>
            <p className="text-sm text-foreground">
              {isEnglish
                ? "Keep practicing and climb the leaderboard! Every order you make in English helps you improve. 🌿"
                : "¡Sigue practicando y sube en el ranking! Cada pedido que haces en español te ayuda a mejorar. 🌿"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 space-y-2">
          <Button size="lg" className="w-full rounded-xl" onClick={() => navigate(`/?lang=${lang}`)}>
            {isEnglish ? "Play Games" : "Jugar Juegos"}
          </Button>
          <Button variant="outline" size="lg" className="w-full rounded-xl" onClick={() => navigate(`/order?lang=${lang}`)}>
            {isEnglish ? "Order from Menu" : "Pedir del Menú"}
          </Button>
        </div>
      </div>
    </div>
  );
}
