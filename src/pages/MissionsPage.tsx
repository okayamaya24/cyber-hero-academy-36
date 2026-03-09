import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Lock,
  Eye,
  Shield,
  Star,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import detectiveCat from "@/assets/detective-cat.png";
import wiseOwl from "@/assets/wise-owl.png";

interface Mission {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  guide: { name: string; image: string };
  questions: Question[];
}

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const missionsData: Mission[] = [
  {
    id: "scam-detection",
    title: "Spot the Scam!",
    description: "Learn to tell real messages from fake ones. Detective Whiskers will help!",
    icon: AlertTriangle,
    color: "text-accent",
    bgColor: "bg-accent/10",
    guide: { name: "Detective Whiskers", image: detectiveCat },
    questions: [
      {
        question: "You get an email saying 'You won a million dollars! Click here!' What should you do?",
        options: ["Click the link right away!", "Tell a trusted adult", "Reply with your address", "Share it with friends"],
        correct: 1,
        explanation: "Always tell a trusted adult! Real prizes don't come from surprise emails.",
      },
      {
        question: "A pop-up says 'Your computer has a virus! Call this number!' Is this real?",
        options: ["Yes, call immediately", "No, it's probably a scam", "Maybe, ask a friend", "Click 'Fix Now'"],
        correct: 1,
        explanation: "These pop-ups are almost always scams! Close the window and tell an adult.",
      },
      {
        question: "Someone you don't know online asks for your home address. What do you do?",
        options: ["Give it to them", "Say no and tell an adult", "Ask them why", "Give a fake address"],
        correct: 1,
        explanation: "Never share personal info with strangers online. Always tell a trusted adult!",
      },
    ],
  },
  {
    id: "password-safety",
    title: "Password Power!",
    description: "Create super strong passwords that no villain can crack! Professor Hoot teaches you how.",
    icon: Lock,
    color: "text-primary",
    bgColor: "bg-primary/10",
    guide: { name: "Professor Hoot", image: wiseOwl },
    questions: [
      {
        question: "Which is the STRONGEST password?",
        options: ["password123", "MyDog!Runs2Fast#", "12345678", "abc"],
        correct: 1,
        explanation: "Strong passwords mix uppercase, lowercase, numbers, and special characters!",
      },
      {
        question: "Should you share your password with your best friend?",
        options: ["Yes, they're my friend", "No, passwords are private", "Only in person", "Yes, if they ask nicely"],
        correct: 1,
        explanation: "Passwords should only be shared with your parents or guardians. Nobody else!",
      },
      {
        question: "How often should you change your password?",
        options: ["Never", "Every few months", "Only when you forget it", "Every hour"],
        correct: 1,
        explanation: "Changing passwords regularly helps keep your accounts safe!",
      },
    ],
  },
  {
    id: "safe-websites",
    title: "Safe Sites Explorer",
    description: "Learn to spot safe websites from dangerous ones!",
    icon: Eye,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    guide: { name: "Detective Whiskers", image: detectiveCat },
    questions: [
      {
        question: "What does the lock icon 🔒 in your browser mean?",
        options: ["The website is locked", "The connection is secure", "You can't visit the site", "It's a game"],
        correct: 1,
        explanation: "The lock means the website uses encryption to keep your info safe!",
      },
      {
        question: "Which website address looks safest?",
        options: ["http://free-games.xyz", "https://www.school.edu", "http://win-prize-now.com", "ftp://download.net"],
        correct: 1,
        explanation: "Look for 'https://' and familiar domains like .edu, .gov, or well-known sites!",
      },
      {
        question: "A website asks you to download a 'free game.' What should you do?",
        options: ["Download it right away", "Ask a parent/teacher first", "Give your email to get it", "Share the link everywhere"],
        correct: 1,
        explanation: "Always ask a trusted adult before downloading anything!",
      },
    ],
  },
  {
    id: "personal-info",
    title: "Secret Keeper",
    description: "Protect your personal information like a true Cyber Hero!",
    icon: Shield,
    color: "text-cyber-purple",
    bgColor: "bg-cyber-purple/10",
    guide: { name: "Professor Hoot", image: wiseOwl },
    questions: [
      {
        question: "Which of these is personal information you should protect?",
        options: ["Your favorite color", "Your home address", "Your favorite movie", "Your favorite food"],
        correct: 1,
        explanation: "Your home address is personal info! Never share it with strangers online.",
      },
      {
        question: "Is it safe to post your full name and school on social media?",
        options: ["Yes, everyone does it", "No, keep that private", "Only on weekends", "Only if your profile is pretty"],
        correct: 1,
        explanation: "Keep personal details like your full name and school private online!",
      },
      {
        question: "An online quiz asks for your birthday and phone number. What should you do?",
        options: ["Fill it in to get results", "Skip it or ask an adult", "Use your friend's info", "Fill in everything"],
        correct: 1,
        explanation: "Quizzes that ask for personal info might be trying to collect your data!",
      },
    ],
  },
];

export default function MissionsPage() {
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [missionComplete, setMissionComplete] = useState(false);

  const startMission = (mission: Mission) => {
    setActiveMission(mission);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setMissionComplete(false);
  };

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setSelectedAnswer(idx);
    setShowResult(true);
    if (idx === activeMission!.questions[currentQ].correct) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ + 1 < activeMission!.questions.length) {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setMissionComplete(true);
    }
  };

  const resetMission = () => {
    setActiveMission(null);
    setMissionComplete(false);
  };

  if (activeMission && !missionComplete) {
    const q = activeMission.questions[currentQ];
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto max-w-2xl px-4">
          <Button variant="ghost" onClick={resetMission} className="mb-4">
            ← Back to Missions
          </Button>

          <div className="mb-6 flex items-center gap-4">
            <img
              src={activeMission.guide.image}
              alt={activeMission.guide.name}
              className="h-16 w-16 object-contain"
            />
            <div>
              <h2 className="text-xl font-bold">{activeMission.title}</h2>
              <p className="text-sm text-muted-foreground">
                {activeMission.guide.name} is guiding you!
              </p>
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-1 flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQ + 1} of {activeMission.questions.length}</span>
              <span>Score: {score}/{activeMission.questions.length}</span>
            </div>
            <Progress
              value={((currentQ + 1) / activeMission.questions.length) * 100}
              className="h-3"
            />
          </div>

          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border bg-card p-6 shadow-card"
          >
            <h3 className="mb-6 text-lg font-bold">{q.question}</h3>

            <div className="space-y-3">
              {q.options.map((opt, idx) => {
                let style = "border-2 border-border bg-background hover:border-primary/50";
                if (showResult) {
                  if (idx === q.correct)
                    style = "border-2 border-secondary bg-secondary/10";
                  else if (idx === selectedAnswer && idx !== q.correct)
                    style = "border-2 border-destructive bg-destructive/10";
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={showResult}
                    className={`w-full rounded-xl p-4 text-left font-semibold transition-all ${style} ${
                      !showResult ? "cursor-pointer hover:scale-[1.02]" : ""
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                      {showResult && idx === q.correct && (
                        <CheckCircle2 className="ml-auto h-5 w-5 text-secondary" />
                      )}
                      {showResult &&
                        idx === selectedAnswer &&
                        idx !== q.correct && (
                          <XCircle className="ml-auto h-5 w-5 text-destructive" />
                        )}
                    </span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 rounded-xl bg-muted p-4"
                >
                  <p className="text-sm font-semibold">
                    {selectedAnswer === q.correct ? "🎉 Correct!" : "😅 Not quite!"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {q.explanation}
                  </p>
                  <Button
                    variant="hero"
                    size="sm"
                    className="mt-3"
                    onClick={nextQuestion}
                  >
                    {currentQ + 1 < activeMission.questions.length
                      ? "Next Question"
                      : "See Results"}
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

  if (missionComplete && activeMission) {
    const total = activeMission.questions.length;
    const perfect = score === total;
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto max-w-md px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
            className="rounded-3xl border bg-card p-8 shadow-card"
          >
            <div className="mb-4 text-6xl">{perfect ? "🏆" : "⭐"}</div>
            <h2 className="text-2xl font-bold">
              {perfect ? "Perfect Score!" : "Mission Complete!"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              You scored {score} out of {total}!
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-accent" />
              <span className="text-lg font-bold text-accent">
                +{score * 50} Points
              </span>
            </div>
            {perfect && (
              <Badge className="mt-3 bg-accent text-accent-foreground border-0">
                🏅 New Badge Earned!
              </Badge>
            )}
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={resetMission}>
                Back to Missions
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                onClick={() => startMission(activeMission)}
              >
                Retry
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold md:text-4xl">
            🎮 Learning Missions
          </h1>
          <p className="mt-2 text-muted-foreground">
            Choose a mission and become a Cyber Hero!
          </p>
        </motion.div>

        <motion.div
          className="grid gap-6 sm:grid-cols-2"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {missionsData.map((m) => (
            <motion.div
              key={m.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              className="group overflow-hidden rounded-2xl border-2 bg-card shadow-card transition-all hover:shadow-playful hover:-translate-y-1"
            >
              <div className={`p-6 ${m.bgColor}`}>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-card shadow">
                    <m.icon className={`h-7 w-7 ${m.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{m.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {m.questions.length} questions
                    </p>
                  </div>
                  <img
                    src={m.guide.image}
                    alt={m.guide.name}
                    className="ml-auto h-16 w-16 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
              <div className="p-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  {m.description}
                </p>
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() => startMission(m)}
                >
                  Start Mission 🚀
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
