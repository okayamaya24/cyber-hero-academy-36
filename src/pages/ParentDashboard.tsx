import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Shield,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  Award,
  BarChart3,
} from "lucide-react";

const students = [
  {
    name: "Alex",
    avatar: "🦸",
    level: 3,
    points: 450,
    missions: 2,
    totalMissions: 4,
    lastActive: "Today",
    badges: 2,
  },
  {
    name: "Sam",
    avatar: "🦸‍♀️",
    level: 5,
    points: 820,
    missions: 4,
    totalMissions: 4,
    lastActive: "Today",
    badges: 5,
  },
  {
    name: "Jordan",
    avatar: "🧙",
    level: 2,
    points: 280,
    missions: 1,
    totalMissions: 4,
    lastActive: "Yesterday",
    badges: 1,
  },
  {
    name: "Taylor",
    avatar: "🤖",
    level: 1,
    points: 100,
    missions: 0,
    totalMissions: 4,
    lastActive: "3 days ago",
    badges: 0,
  },
];

const missionStats = [
  { name: "Spot the Scam!", icon: AlertTriangle, completed: 3, total: 4, color: "text-accent" },
  { name: "Password Power", icon: Lock, completed: 2, total: 4, color: "text-primary" },
  { name: "Safe Sites", icon: Eye, completed: 1, total: 4, color: "text-secondary" },
  { name: "Secret Keeper", icon: Shield, completed: 1, total: 4, color: "text-cyber-purple" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ParentDashboard() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold md:text-4xl">
            📊 Parent & Teacher Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track your children's cybersecurity learning progress
          </p>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {[
            { label: "Students", value: students.length, icon: Users, color: "text-primary" },
            { label: "Active Today", value: 2, icon: TrendingUp, color: "text-secondary" },
            { label: "Missions Done", value: 7, icon: CheckCircle2, color: "text-accent" },
            { label: "Badges Earned", value: 8, icon: Award, color: "text-cyber-purple" },
          ].map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className="rounded-2xl border bg-card p-5 shadow-card"
            >
              <s.icon className={`mb-2 h-6 w-6 ${s.color}`} />
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Student List */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Student Progress
            </h2>
            <motion.div
              className="space-y-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {students.map((s) => (
                <motion.div
                  key={s.name}
                  variants={fadeUp}
                  className="rounded-2xl border bg-card p-5 shadow-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl">
                      {s.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold">{s.name}</h3>
                        <Badge variant="secondary" className="border-0">
                          Level {s.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {s.lastActive}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span>⭐ {s.points} pts</span>
                        <span>🏅 {s.badges} badges</span>
                        <span>
                          🎯 {s.missions}/{s.totalMissions} missions
                        </span>
                      </div>
                      <div className="mt-2">
                        <Progress
                          value={(s.missions / s.totalMissions) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Mission Completion */}
          <div>
            <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-secondary" />
              Mission Completion
            </h2>
            <motion.div
              className="space-y-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {missionStats.map((m) => (
                <motion.div
                  key={m.name}
                  variants={fadeUp}
                  className="rounded-2xl border bg-card p-4 shadow-card"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <m.icon className={`h-5 w-5 ${m.color}`} />
                    <span className="text-sm font-bold">{m.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={(m.completed / m.total) * 100}
                      className="h-2 flex-1"
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {m.completed}/{m.total}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Tips */}
            <div className="mt-6 rounded-2xl border bg-primary/5 p-5">
              <h3 className="font-bold text-primary mb-2">💡 Tips for Parents</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Discuss online safety during meals</li>
                <li>• Encourage completing all missions</li>
                <li>• Celebrate badge achievements</li>
                <li>• Review progress weekly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
