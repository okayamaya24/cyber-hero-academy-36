import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Star } from "lucide-react";

interface HQOrientationProps {
  playerName: string;
  avatarConfig: any;
  onComplete: () => void;
}

const STEPS = [
  {
    title: "Welcome to HQ, Agent!",
    text: "This is your Cyber HQ — the command centre of your mission. From here, you'll train, learn, and prepare to take on the villains threatening the digital world.",
    icon: Shield,
  },
  {
    title: "How Missions Work",
    text: "Each zone has a series of challenges. Complete them to earn stars and unlock the next zone. Get enough stars and you'll face the continent's boss villain!",
    icon: Zap,
  },
  {
    title: "Ready to Begin?",
    text: "Your first mission awaits. Stay sharp, trust your training, and remember — every hero starts with a single step. Let's go!",
    icon: Star,
  },
];

const HQOrientation = ({ playerName, avatarConfig, onComplete }: HQOrientationProps) => {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(210,40%,8%)]">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 to-transparent pointer-events-none" />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 flex flex-col items-center gap-6 max-w-md px-6 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <Icon className="w-10 h-10 text-cyan-400" />
          </div>

          <div className="flex items-center gap-3">
            <HeroAvatar avatarConfig={avatarConfig} size={48} />
            <span className="text-cyan-300 font-bold text-lg font-mono">{playerName}</span>
          </div>

          <h2 className="text-2xl font-bold text-white font-['Orbitron']">
            {current.title}
          </h2>
          <p className="text-cyan-100/80 text-base leading-relaxed">
            {current.text}
          </p>

          <div className="flex gap-2 mt-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === step ? "bg-cyan-400" : "bg-cyan-900/60"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={() => {
              if (step < STEPS.length - 1) {
                setStep(step + 1);
              } else {
                onComplete();
              }
            }}
            className="mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-3 rounded-xl text-lg"
          >
            {step < STEPS.length - 1 ? "Next" : "Start Mission!"}
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default HQOrientation;
