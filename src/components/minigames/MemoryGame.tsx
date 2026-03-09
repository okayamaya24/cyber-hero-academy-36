import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { AgeTier } from "@/data/missions";

interface Props {
  ageTier: AgeTier;
  guideImage: string;
  guideName: string;
  onComplete: (correct: boolean) => void;
}

const CARD_SETS: Record<AgeTier, { emoji: string; label: string }[]> = {
  junior: [
    { emoji: "🔒", label: "Lock" },
    { emoji: "🛡️", label: "Shield" },
    { emoji: "🔑", label: "Key" },
    { emoji: "⭐", label: "Star" },
    { emoji: "🦸", label: "Hero" },
    { emoji: "🔍", label: "Search" },
  ],
  defender: [
    { emoji: "🔒", label: "Password" },
    { emoji: "🛡️", label: "Firewall" },
    { emoji: "🔑", label: "Encryption" },
    { emoji: "🦠", label: "Virus" },
    { emoji: "🎣", label: "Phishing" },
    { emoji: "🤖", label: "Bot" },
    { emoji: "🔍", label: "Scan" },
    { emoji: "🚫", label: "Block" },
  ],
  guardian: [
    { emoji: "🔒", label: "TLS/SSL" },
    { emoji: "🛡️", label: "Firewall" },
    { emoji: "🔑", label: "2FA" },
    { emoji: "🦠", label: "Malware" },
    { emoji: "🎣", label: "Phishing" },
    { emoji: "🤖", label: "Bot" },
    { emoji: "🔍", label: "Audit" },
    { emoji: "🚫", label: "Deny" },
    { emoji: "🧅", label: "VPN" },
    { emoji: "💾", label: "Backup" },
  ],
};

interface Card {
  id: number;
  emoji: string;
  label: string;
  pairId: number;
}

export default function MemoryGame({ ageTier, guideImage, guideName, onComplete }: Props) {
  const pairCount = ageTier === "junior" ? 4 : ageTier === "defender" ? 6 : 8;

  const cards = useMemo<Card[]>(() => {
    const set = CARD_SETS[ageTier].slice(0, pairCount);
    const pairs: Card[] = [];
    set.forEach((item, i) => {
      pairs.push({ id: i * 2, emoji: item.emoji, label: item.label, pairId: i });
      pairs.push({ id: i * 2 + 1, emoji: item.emoji, label: item.label, pairId: i });
    });
    return pairs.sort(() => Math.random() - 0.5);
  }, [ageTier, pairCount]);

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [checking, setChecking] = useState(false);

  const handleFlip = (id: number) => {
    if (checking || flipped.includes(id) || matched.has(id)) return;

    const next = [...flipped, id];
    setFlipped(next);

    if (next.length === 2) {
      setMoves((m) => m + 1);
      setChecking(true);
      const [a, b] = next;
      const cardA = cards.find((c) => c.id === a)!;
      const cardB = cards.find((c) => c.id === b)!;

      setTimeout(() => {
        if (cardA.pairId === cardB.pairId) {
          setMatched((prev) => new Set([...prev, a, b]));
        }
        setFlipped([]);
        setChecking(false);
      }, 800);
    }
  };

  const allMatched = matched.size === cards.length;
  const maxMoves = pairCount * 3;
  const isGood = moves <= maxMoves;

  const cols = ageTier === "junior" ? 4 : 4;

  return (
    <div className="text-center">
      <div className="flex items-center gap-3 mb-4">
        <img src={guideImage} alt={guideName} className="h-12 w-12 object-contain" />
        <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-left">
          <p className="font-semibold text-sm">
            🧠 Flip cards to find matching cybersecurity pairs!
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-4 mb-4 text-sm">
        <span className="font-bold">Moves: {moves}</span>
        <span className="text-muted-foreground">Pairs: {matched.size / 2}/{pairCount}</span>
      </div>

      {!allMatched ? (
        <div
          className="grid gap-2 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            maxWidth: ageTier === "junior" ? "280px" : "320px",
          }}
        >
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.id) || matched.has(card.id);
            const isMatched = matched.has(card.id);

            return (
              <motion.button
                key={card.id}
                whileTap={!isFlipped ? { scale: 0.9 } : {}}
                onClick={() => handleFlip(card.id)}
                className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all ${
                  isMatched
                    ? "bg-secondary/20 border-secondary/40"
                    : isFlipped
                    ? "bg-primary/10 border-primary/40"
                    : "bg-card border-border hover:border-primary/50 hover:shadow-md cursor-pointer"
                }`}
              >
                {isFlipped ? (
                  <motion.div initial={{ rotateY: 90 }} animate={{ rotateY: 0 }}>
                    <span className="text-2xl block">{card.emoji}</span>
                    <span className="text-[9px] font-bold mt-0.5 block text-muted-foreground">{card.label}</span>
                  </motion.div>
                ) : (
                  <span className="text-2xl">❓</span>
                )}
              </motion.button>
            );
          })}
        </div>
      ) : (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
          <p className="text-5xl">{isGood ? "🎉" : "💪"}</p>
          <p className="text-lg font-bold">
            {isGood ? "Great memory, hero!" : "All pairs found! Keep practicing!"}
          </p>
          <p className="text-sm text-muted-foreground">
            Completed in {moves} moves
          </p>
          <Button variant="hero" className="w-full py-5 text-base" onClick={() => onComplete(isGood)}>
            Continue ✨
          </Button>
        </motion.div>
      )}
    </div>
  );
}
