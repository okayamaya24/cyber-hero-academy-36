import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Props {
  type: string;
  title: string;
  description: string;
  onComplete: (passed: boolean) => void;
}

const ICONS: Record<string, string> = {
  "profile-builder": "🦸",
  "secret-code-maker": "🔐",
  "email-inspector": "📧",
  "file-scanner": "🔍",
  "two-factor-sim": "📱",
  "stranger-danger": "👤",
  "safe-sites-detector": "🌐",
  "kindness-shield": "💙",
};

export default function MiniGamePlaceholder({ type, title, description, onComplete }: Props) {
  const [completed, setCompleted] = useState(false);
  const icon = ICONS[type] || "🎮";

  const handleComplete = () => {
    setCompleted(true);
    setTimeout(() => onComplete(true), 800);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-4 rounded-2xl border border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_14%/0.8)] p-8 backdrop-blur-md max-w-md w-full text-center"
      >
        <span className="text-5xl">{icon}</span>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-white/60">{description}</p>

        <div className="mt-2 rounded-xl border border-[hsl(195_80%_50%/0.1)] bg-[hsl(210_40%_18%/0.6)] p-4 w-full">
          <p className="text-xs text-[hsl(195_80%_60%)] font-mono">
            // MINI GAME: {type.toUpperCase().replace(/-/g, "_")}
          </p>
          <p className="text-xs text-white/40 mt-1">
            Full interactive gameplay coming soon!
          </p>
        </div>

        {completed ? (
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-3xl"
          >
            ✅
          </motion.div>
        ) : (
          <Button
            onClick={handleComplete}
            className="mt-2 bg-[hsl(195_80%_50%)] hover:bg-[hsl(195_80%_45%)] text-white font-bold px-8"
          >
            ✅ COMPLETE GAME
          </Button>
        )}
      </motion.div>
    </div>
  );
}
