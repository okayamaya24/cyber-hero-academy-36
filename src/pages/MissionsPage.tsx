import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, CheckCircle2, XCircle, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MISSIONS, type MissionDef, getMissionQuestions, getAgeTier, getTierLabel, getTierEmoji } from "@/data/missions";
import { toast } from "sonner";

const ENCOURAGEMENTS = [
  "You're a Cyber Superstar! 🌟",
  "Amazing work, hero! 🦸",
  "The internet is safer because of YOU! 🛡️",
  "You're leveling up fast! 🚀",
  "Incredible job, Cyber Champion! 🏆",
];

export default function MissionsPage() {
  const { user, activeChildId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeMission, setActiveMission] = useState<MissionDef | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [missionComplete, setMissionComplete] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!activeChildId) navigate("/select-child");
  }, [user, activeChildId, navigate]);

  const { data: child } = useQuery({
    queryKey: ["child", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_profiles")
        .select("*")
        .eq("id", activeChildId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const { data: missionProgress = [] } = useQuery({
    queryKey: ["mission_progress", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mission_progress")
        .select("*")
        .eq("child_id", activeChildId!);
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const age = child?.age ?? 7;
  const tier = getAgeTier(age);
  const tierLabel = getTierLabel(tier);
  const tierEmoji = getTierEmoji(tier);

  const getQuestions = (mission: MissionDef) => getMissionQuestions(mission, age);

  const startMission = (mission: MissionDef) => {
    const questions = getQuestions(mission);
    const existing = missionProgress.find((m) => m.mission_id === mission.id);
    setActiveMission(mission);
    setCurrentQ(existing?.status === "in_progress" ? Math.min(existing.current_question, questions.length - 1) : 0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(existing?.status === "in_progress" ? existing.score : 0);
    setMissionComplete(false);
  };

  const handleAnswer = (idx: number) => {
    if (showResult || !activeMission) return;
    const questions = getQuestions(activeMission);
    setSelectedAnswer(idx);
    setShowResult(true);
    if (idx === questions[currentQ].correct) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = async () => {
    if (!activeMission || !activeChildId) return;
    const questions = getQuestions(activeMission);
    const nextQ = currentQ + 1;
    const isLast = nextQ >= questions.length;

    await supabase.from("mission_progress").upsert(
      {
        child_id: activeChildId,
        mission_id: activeMission.id,
        status: isLast ? "completed" : "in_progress",
        score: score,
        max_score: questions.length,
        current_question: isLast ? questions.length : nextQ,
        completed_at: isLast ? new Date().toISOString() : null,
      },
      { onConflict: "child_id,mission_id" }
    );

    if (isLast) {
      const pointsEarned = score * 50;
      const { data: childData } = await supabase
        .from("child_profiles")
        .select("points, streak, level, last_activity_date")
        .eq("id", activeChildId)
        .single();

      if (childData) {
        const today = new Date().toISOString().split("T")[0];
        const newStreak = childData.last_activity_date === today ? childData.streak : childData.streak + 1;
        const newPoints = childData.points + pointsEarned;
        const newLevel = Math.floor(newPoints / 200) + 1;

        await supabase
          .from("child_profiles")
          .update({ points: newPoints, streak: newStreak, level: newLevel, last_activity_date: today })
          .eq("id", activeChildId);
      }

      if (score === questions.length) {
        await supabase.from("earned_badges").upsert(
          {
            child_id: activeChildId,
            badge_id: activeMission.badgeId,
            badge_name: activeMission.badgeName,
            badge_icon: activeMission.badgeIcon,
          },
          { onConflict: "child_id,badge_id" }
        );
      }

      queryClient.invalidateQueries({ queryKey: ["mission_progress"] });
      queryClient.invalidateQueries({ queryKey: ["earned_badges"] });
      queryClient.invalidateQueries({ queryKey: ["child"] });
      setMissionComplete(true);
    } else {
      setCurrentQ(nextQ);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const resetMission = () => {
    setActiveMission(null);
    setMissionComplete(false);
  };

  // Active quiz view
  if (activeMission && !missionComplete) {
    const questions = getQuestions(activeMission);
    const q = questions[currentQ];
    const isJunior = tier === "junior";

    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto max-w-2xl px-4">
          <Button variant="ghost" onClick={resetMission} className="mb-4">
            ← Back to Missions
          </Button>
          <div className="mb-6 flex items-center gap-4">
            <img src={activeMission.guide.image} alt={activeMission.guide.name} className="h-16 w-16 object-contain" />
            <div>
              <h2 className="text-xl font-bold">{activeMission.title}</h2>
              <p className="text-sm text-muted-foreground">{activeMission.guide.name} is guiding you!</p>
              <Badge variant="outline" className="mt-1 text-xs">
                {tierEmoji} {tierLabel}
              </Badge>
            </div>
          </div>
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQ + 1} of {questions.length}</span>
              <span>Score: {score}/{questions.length}</span>
            </div>
            <Progress value={((currentQ + 1) / questions.length) * 100} className="h-3" />
          </div>
          <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl border bg-card p-6 shadow-card">
            <h3 className={`mb-6 font-bold ${isJunior ? "text-xl leading-relaxed" : "text-lg"}`}>{q.question}</h3>
            <div className={`grid gap-3 ${q.options.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
              {q.options.map((opt, idx) => {
                let style = "border-2 border-border bg-background hover:border-primary/50";
                if (showResult) {
                  if (idx === q.correct) style = "border-2 border-secondary bg-secondary/10";
                  else if (idx === selectedAnswer && idx !== q.correct) style = "border-2 border-destructive bg-destructive/10";
                }

                // For 2-option (Safe/Scam) layout, make buttons bigger and more visual
                if (q.options.length === 2) {
                  const isSafe = opt.toLowerCase() === "safe";
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={showResult}
                      className={`rounded-2xl p-6 text-center font-bold text-lg transition-all ${style} ${!showResult ? "cursor-pointer hover:scale-105" : ""}`}
                    >
                      <span className="block text-3xl mb-2">{isSafe ? "✅" : "🚫"}</span>
                      {opt}
                      {showResult && idx === q.correct && <CheckCircle2 className="mx-auto mt-2 h-5 w-5 text-secondary" />}
                      {showResult && idx === selectedAnswer && idx !== q.correct && <XCircle className="mx-auto mt-2 h-5 w-5 text-destructive" />}
                    </button>
                  );
                }

                return (
                  <button key={idx} onClick={() => handleAnswer(idx)} disabled={showResult}
                    className={`w-full rounded-xl p-4 text-left font-semibold transition-all ${style} ${!showResult ? "cursor-pointer hover:scale-[1.02]" : ""}`}>
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                      {showResult && idx === q.correct && <CheckCircle2 className="ml-auto h-5 w-5 text-secondary" />}
                      {showResult && idx === selectedAnswer && idx !== q.correct && <XCircle className="ml-auto h-5 w-5 text-destructive" />}
                    </span>
                  </button>
                );
              })}
            </div>
            <AnimatePresence>
              {showResult && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 rounded-xl bg-muted p-4">
                  <p className="text-sm font-semibold">{selectedAnswer === q.correct ? "🎉 Correct!" : "😅 Not quite!"}</p>
                  <p className={`mt-1 text-muted-foreground ${isJunior ? "text-base" : "text-sm"}`}>{q.explanation}</p>
                  <Button variant="hero" size="sm" className="mt-3" onClick={nextQuestion}>
                    {currentQ + 1 < questions.length ? "Next Question" : "See Results"}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    );
  }

  // Mission complete view
  if (missionComplete && activeMission) {
    const questions = getQuestions(activeMission);
    const total = questions.length;
    const perfect = score === total;
    const encouragement = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];

    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto max-w-md px-4 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="rounded-3xl border bg-card p-8 shadow-card">
            <div className="mb-4 text-6xl">{perfect ? "🏆" : "⭐"}</div>
            <h2 className="text-2xl font-bold">{perfect ? "Perfect Score!" : "Mission Complete!"}</h2>
            <p className="mt-2 text-muted-foreground">You scored {score} out of {total}!</p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-3 text-lg font-semibold text-primary flex items-center justify-center gap-2"
            >
              <Sparkles className="h-5 w-5" />
              {encouragement}
            </motion.p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-accent" />
              <span className="text-lg font-bold text-accent">+{score * 50} Points</span>
            </div>
            {perfect && <Badge className="mt-3 bg-accent text-accent-foreground border-0">🏅 New Badge Earned!</Badge>}
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={resetMission}>Back to Missions</Button>
              <Button variant="hero" className="flex-1" onClick={() => navigate("/dashboard")}>Dashboard</Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Mission list view
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <motion.div className="mb-8 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold md:text-4xl">🎮 Learning Missions</h1>
          <p className="mt-2 text-muted-foreground">Choose a mission and become a Cyber Hero!</p>
          {child && (
            <Badge variant="outline" className="mt-3 text-sm px-4 py-1">
              {tierEmoji} {tierLabel} · Age {age}
            </Badge>
          )}
        </motion.div>
        <motion.div className="grid gap-6 sm:grid-cols-2" initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}>
          {MISSIONS.map((m) => {
            const questions = getQuestions(m);
            const mp = missionProgress.find((p) => p.mission_id === m.id);
            const isCompleted = mp?.status === "completed";
            const isInProgress = mp?.status === "in_progress";
            return (
              <motion.div key={m.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                className="group overflow-hidden rounded-2xl border-2 bg-card shadow-card transition-all hover:shadow-playful hover:-translate-y-1">
                <div className={`p-6 ${m.bgColor}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-card shadow">
                      <m.icon className={`h-7 w-7 ${m.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{m.title}</h3>
                      <p className="text-sm text-muted-foreground">{questions.length} questions · {tierLabel}</p>
                    </div>
                    <img src={m.guide.image} alt={m.guide.name} className="ml-auto h-16 w-16 object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="p-6">
                  <p className="mb-4 text-sm text-muted-foreground">{m.description}</p>
                  {isCompleted ? (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-secondary text-secondary-foreground border-0">✓ Completed</Badge>
                      <Button variant="outline" size="sm" className="ml-auto" onClick={() => startMission(m)}>Retry</Button>
                    </div>
                  ) : (
                    <Button variant="hero" className="w-full" onClick={() => startMission(m)}>
                      {isInProgress ? "Continue Mission →" : "Start Mission 🚀"}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
