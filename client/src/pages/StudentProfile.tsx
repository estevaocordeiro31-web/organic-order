import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Trophy, Star, Mic, MessageCircle, Zap, Share2, ArrowLeft, Award, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  voice_order: <Mic className="w-4 h-4" />,
  qa_simulation: <MessageCircle className="w-4 h-4" />,
  phrase_builder: <Zap className="w-4 h-4" />,
};

const ACTIVITY_LABELS: Record<string, string> = {
  voice_order: "Voice Order",
  qa_simulation: "Q&A Simulation",
  phrase_builder: "Phrase Builder",
};

const ACTIVITY_COLORS: Record<string, string> = {
  voice_order: "#6366f1",
  qa_simulation: "#10b981",
  phrase_builder: "#f59e0b",
};

// Achievement badges
function getAchievements(data: NonNullable<ReturnType<typeof useStudentProfile>["data"]>) {
  const badges: { icon: string; label: string; color: string }[] = [];
  if (data.totalGames >= 1) badges.push({ icon: "🎯", label: "First Order!", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" });
  if (data.totalXP >= 10) badges.push({ icon: "⭐", label: "10 XP", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" });
  if (data.totalXP >= 50) badges.push({ icon: "🏆", label: "50 XP", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" });
  if (data.totalXP >= 100) badges.push({ icon: "💎", label: "100 XP", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" });
  if (data.totalGames >= 5) badges.push({ icon: "🔥", label: "5 Sessions", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" });
  if (data.totalGames >= 10) badges.push({ icon: "🚀", label: "10 Sessions", color: "bg-pink-500/20 text-pink-300 border-pink-500/30" });
  if (data.avgAccuracy >= 80) badges.push({ icon: "🎖️", label: "Accuracy Pro", color: "bg-green-500/20 text-green-300 border-green-500/30" });
  if (Object.keys(data.byType).filter(k => data.byType[k as keyof typeof data.byType].length > 0).length >= 3)
    badges.push({ icon: "🌟", label: "All Activities", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" });
  return badges;
}

function useStudentProfile(studentName: string) {
  return trpc.game.publicProfile.useQuery({ studentName }, { enabled: !!studentName });
}

export default function StudentProfile() {
  const params = useParams<{ studentName: string }>();
  const studentName = decodeURIComponent(params.studentName || "");
  const { data, isLoading, error } = useStudentProfile(studentName);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build XP chart data
  const xpChartData = data
    ? Object.entries(data.xpByDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, xp]) => ({
          day: new Date(day).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          xp,
        }))
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent" />
          <div className="relative px-4 pt-6 pb-8 max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="h-4 w-16 rounded bg-white/5 animate-pulse" />
              <div className="h-8 w-20 rounded-lg bg-white/5 animate-pulse" />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-white/5 animate-pulse mb-3" />
              <div className="h-6 w-40 rounded bg-white/5 animate-pulse mb-2" />
              <div className="h-4 w-32 rounded bg-white/5 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 pb-12 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center gap-2">
                <div className="w-5 h-5 rounded bg-white/5 animate-pulse" />
                <div className="h-5 w-12 rounded bg-white/5 animate-pulse" />
                <div className="h-3 w-14 rounded bg-white/5 animate-pulse" />
              </div>
            ))}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="h-4 w-28 rounded bg-white/5 animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-7 w-20 rounded-full bg-white/5 animate-pulse" />
              ))}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="h-4 w-32 rounded bg-white/5 animate-pulse mb-4" />
            <div className="h-24 w-full rounded bg-white/5 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data || data.totalGames === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-white text-xl font-bold mb-2">Profile not found</h2>
          <p className="text-white/50 text-sm mb-6">
            No activities found for <span className="text-white font-medium">"{studentName}"</span>. Make sure the name matches exactly.
          </p>
          <Link href="/">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to ImAInd
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const achievements = getAchievements(data);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent" />
        <div className="relative px-4 pt-6 pb-8 max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <button className="flex items-center gap-1 text-white/60 hover:text-white text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" />
                ImAInd
              </button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              className="border-white/20 text-white hover:bg-white/10 text-xs"
            >
              <Share2 className="w-3 h-3 mr-1" />
              {copied ? "Copied!" : "Share"}
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-3 shadow-lg shadow-primary/30">
              {studentName.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{studentName}</h1>
            <p className="text-white/50 text-sm">ImAInd Language Learner</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-12 space-y-4">
        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { icon: <Trophy className="w-5 h-5 text-amber-400" />, value: data.totalXP, label: "Total XP" },
            { icon: <Target className="w-5 h-5 text-green-400" />, value: `${data.avgAccuracy}%`, label: "Accuracy" },
            { icon: <TrendingUp className="w-5 h-5 text-blue-400" />, value: data.totalGames, label: "Sessions" },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
              <div className="flex justify-center mb-1">{stat.icon}</div>
              <p className="text-white font-bold text-lg leading-none">{stat.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-white font-semibold text-sm">Achievements</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {achievements.map((badge, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}
                >
                  {badge.icon} {badge.label}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* XP Evolution Chart */}
        {xpChartData.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="text-white font-semibold text-sm">XP Evolution</h3>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={xpChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} width={28} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                  itemStyle={{ color: "#818cf8" }}
                />
                <Line type="monotone" dataKey="xp" stroke="#818cf8" strokeWidth={2} dot={{ fill: "#818cf8", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Activity breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-yellow-400" />
            <h3 className="text-white font-semibold text-sm">Activity Breakdown</h3>
          </div>
          <div className="space-y-3">
            {(["voice_order", "qa_simulation", "phrase_builder"] as const).map((type) => {
              const sessions = data.byType[type];
              if (sessions.length === 0) return null;
              const totalXP = sessions.reduce((s, r) => s + r.score, 0);
              const avgAcc = Math.round(sessions.reduce((s, r) => s + (r.totalQuestions > 0 ? r.score / r.totalQuestions : 0), 0) / sessions.length * 100);
              const color = ACTIVITY_COLORS[type];
              return (
                <div key={type} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}20`, color }}>
                    {ACTIVITY_ICONS[type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white text-xs font-medium">{ACTIVITY_LABELS[type]}</p>
                      <p className="text-white/50 text-xs">{sessions.length} sessions · {totalXP} XP</p>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${avgAcc}%`, background: color }} />
                    </div>
                    <p className="text-white/30 text-xs mt-0.5">{avgAcc}% accuracy</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent sessions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-white font-semibold text-sm">Recent Sessions</h3>
          </div>
          <div className="space-y-2">
            {data.sessions.slice(-8).reverse().map((s, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white"
                  style={{ background: `${ACTIVITY_COLORS[s.gameType]}30`, color: ACTIVITY_COLORS[s.gameType] }}
                >
                  {ACTIVITY_ICONS[s.gameType]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{ACTIVITY_LABELS[s.gameType]}</p>
                  <p className="text-white/30 text-xs">{new Date(s.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white text-xs font-bold">{s.score}/{s.totalQuestions}</p>
                  <Badge variant="outline" className="text-xs border-white/10 text-white/50 px-1 py-0">{s.language.toUpperCase()}</Badge>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-center py-4"
        >
          <p className="text-white/40 text-xs mb-3">Powered by</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-white font-bold text-lg tracking-tight">ImAInd</span>
            <span className="text-white/40 text-xs">×</span>
            <span className="text-primary font-semibold text-sm">inFlux</span>
          </div>
          <p className="text-white/30 text-xs mt-1">Restaurant Experience · Language Learning</p>
        </motion.div>
      </div>
    </div>
  );
}
