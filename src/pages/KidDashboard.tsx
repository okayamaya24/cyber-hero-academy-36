import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, Star, Lock, Eye, AlertTriangle, Trophy, Flame, Zap } from "lucide-react";
import heroCharacter from "@/assets/hero-character.png";
import robotGuide from "@/assets/robot-guide.png";

const avatars = ["🦸", "🦸‍♀️", "🧙", "🤖", "🦊", "🐱‍👤"];

const badges = [
  { name: "Password Pro", icon: "🔐", earned: true },
  { name: "Scam Spotter", icon: "🔍", earned: true },
  { name: "Safe Surfer", icon: "🏄", earned: false },
  { name: "Privacy Knight", icon: "🛡️", earned: false },
  { name: "Cyber Champion", icon: "🏆", earned: false },
  { name: "Master Hero", icon: "⭐", earned: false },
];

const missions = [
  {
    id: "scam-detection",
    title: "Spot the Scam!",
    description: "Learn to identify fake emails and messages",
    icon: AlertTriangle,
    color: "bg-accent/10 text-accent border-accent/20",
    progress: 100,
    status: "completed" as const,
  },
  {
    id: "password-safety",
    title: "Password Power",
    description: "Create super strong passwords",
    icon: Lock,
    color: "bg-primary/10 text-primary border-primary/20",
    progress: 75,
    status: "in-progress" as const,
  },
  {
    id: "safe-websites",
    title: "Safe Sites",
    description: "Know which websites are safe to visit",
    icon: Eye,
    color: "bg-secondary/10 text-secondary border-secondary/20",
    progress: 0,
    status: "locked" as const,
  },
  {
    id: "personal-info",
    title: "Secret Keeper",
    description: "Protect your personal information",
    icon: Shield,
    color: "bg-cyber-purple/10 text-cyber-purple border-cyber-purple/20",
    progress: 0,
    status: "locked" as const,
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function KidDashboard() {
  const totalPoints = 450;
  const level = 3;
  const streak = 5;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Profile Header */}
      <div className="gradient-hero py-8">
        <div className="container mx-auto flex flex-col items-center gap-6 px-4 sm:flex-row">
          <motion.div
            className="relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-card text-5xl shadow-lg">
              🦸
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground shadow">
              {level}
            </div>
          </motion.div>

          <motion.div
            className="text-center text-primary-foreground sm:text-left"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl font-bold">Welcome, Cyber Hero!</h1>
            <p className="opacity-90">Level {level} · Cyber Defender</p>
            <div className="mt-2 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" /> {totalPoints} Points
              </span>
              <span className="flex items-center gap-1">
                <Flame className="h-4 w-4" /> {streak} Day Streak
              </span>
            </div>
          </motion.div>

          <motion.img
            src={robotGuide}
            alt="Robo Buddy"
            className="ml-auto hidden h-28 sm:block"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 space-y-8">
        {/* Stats Row */}
        <motion.div
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {[
            { label: "Points", value: totalPoints, icon: Star, color: "text-accent" },
            { label: "Missions", value: "1/4", icon: Shield, color: "text-primary" },
            { label: "Badges", value: "2/6", icon: Trophy, color: "text-secondary" },
            { label: "Streak", value: `${streak}🔥`, icon: Zap, color: "text-cyber-pink" },
          ].map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className="rounded-2xl border bg-card p-4 text-center shadow-card"
            >
              <s.icon className={`mx-auto mb-2 h-6 w-6 ${s.color}`} />
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Missions */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Missions</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/missions">View All</Link>
            </Button>
          </div>

          <motion.div
            className="grid gap-4 sm:grid-cols-2"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {missions.map((m) => (
              <motion.div
                key={m.id}
                variants={fadeUp}
                className={`group relative overflow-hidden rounded-2xl border-2 bg-card p-5 shadow-card transition-all hover:shadow-playful hover:-translate-y-1 ${
                  m.status === "locked" ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${m.color}`}
                  >
                    <m.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{m.title}</h3>
                      {m.status === "completed" && (
                        <Badge className="bg-secondary text-secondary-foreground border-0">✓ Done</Badge>
                      )}
                      {m.status === "locked" && (
                        <Badge variant="outline">🔒 Locked</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {m.description}
                    </p>
                    {m.status !== "locked" && (
                      <div className="mt-3">
                        <div className="mb-1 flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{m.progress}%</span>
                        </div>
                        <Progress value={m.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
                {m.status === "in-progress" && (
                  <Button
                    variant="hero"
                    size="sm"
                    className="mt-4 w-full"
                    asChild
                  >
                    <Link to="/missions">Continue Mission →</Link>
                  </Button>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Badges */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Your Badges</h2>
          <motion.div
            className="grid grid-cols-3 gap-4 sm:grid-cols-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {badges.map((b) => (
              <motion.div
                key={b.name}
                variants={fadeUp}
                className={`flex flex-col items-center rounded-2xl border p-4 text-center transition-all ${
                  b.earned
                    ? "bg-card shadow-card hover:shadow-playful"
                    : "bg-muted/50 opacity-50 grayscale"
                }`}
              >
                <span className="mb-2 text-3xl">{b.icon}</span>
                <span className="text-xs font-semibold">{b.name}</span>
                {b.earned && (
                  <span className="mt-1 text-[10px] text-secondary font-bold">
                    EARNED ✓
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
