import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ZoneDragDropItem } from "@/data/zoneGames";

interface Props {
  items: ZoneDragDropItem[];
  buckets: string[];
  mode?: "physics" | "conveyor";
  onComplete: (passed: boolean, stars: number) => void;
}

/* ─── Conveyor Belt Mode ────────────────────────────── */
function ConveyorMode({ items, buckets, onComplete }: Omit<Props, "mode">) {
  const shuffled = useMemo(() => [...items].sort(() => Math.random() - 0.5), [items]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [done, setDone] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [speed, setSpeed] = useState(1);

  const current = shuffled[currentIndex];

  const handleBucketClick = (bucket: string) => {
    if (!current || done || feedback) return;

    // Match bucket - strip emoji prefix for comparison
    const stripEmoji = (s: string) => s.replace(/^[^\w]*\s*/, "").trim();
    const isCorrect = stripEmoji(current.bucket).toLowerCase() === stripEmoji(bucket).toLowerCase()
      || current.bucket === bucket
      || bucket.includes(current.bucket)
      || current.bucket.includes(stripEmoji(bucket));

    if (isCorrect) {
      setCorrect((c) => c + 1);
      setFeedback({ text: "✅ Correct!", isCorrect: true });
      setAttempts(0);

      // Increase speed every 5 correct
      if ((correct + 1) % 5 === 0) setSpeed((s) => Math.min(s + 0.3, 3));

      setTimeout(() => {
        setFeedback(null);
        if (currentIndex + 1 >= shuffled.length) {
          setDone(true);
          const total = shuffled.length;
          const finalCorrect = correct + 1;
          const pct = finalCorrect / total;
          const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1;
          setTimeout(() => onComplete(true, stars), 1200);
        } else {
          setCurrentIndex((i) => i + 1);
        }
      }, 800);
    } else {
      setWrong((w) => w + 1);
      setAttempts((a) => a + 1);
      setFeedback({ text: attempts >= 1 ? `Not quite — belongs in ${current.bucket}` : "Try again! ❌", isCorrect: false });

      setTimeout(() => {
        setFeedback(null);
        if (attempts >= 1) {
          // Move on after 2 failed attempts
          if (currentIndex + 1 >= shuffled.length) {
            setDone(true);
            const pct = correct / shuffled.length;
            const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1;
            setTimeout(() => onComplete(true, stars), 1200);
          } else {
            setCurrentIndex((i) => i + 1);
            setAttempts(0);
          }
        }
      }, 800);
    }
  };

  if (done) {
    const total = shuffled.length;
    const pct = correct / total;
    const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1;
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4 py-8">
        <span className="text-5xl">🎉</span>
        <h3 className="text-xl font-bold text-white">Sorting Complete!</h3>
        <p className="text-sm text-white/60">{correct}/{total} correct</p>
        <div className="flex gap-1">
          {[1, 2, 3].map((s) => (
            <span key={s} className={`text-2xl ${s <= stars ? "" : "opacity-20"}`}>⭐</span>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 py-6 px-4">
      {/* Progress bar */}
      <div className="w-full max-w-sm">
        <p className="text-[10px] text-white/40 font-mono mb-1 text-center">
          ITEM {currentIndex + 1} OF {shuffled.length}
        </p>
        <Progress value={(currentIndex / shuffled.length) * 100} className="h-2 bg-white/10" />
      </div>

      {/* Conveyor belt track */}
      <div className="relative w-full max-w-md h-28 rounded-xl overflow-hidden border border-[hsl(195_80%_50%/0.15)] bg-[hsl(210_40%_10%)]">
        {/* Belt texture animation */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 28px, hsl(195 80% 50% / 0.3) 28px, hsl(195 80% 50% / 0.3) 30px)",
            backgroundSize: "30px 100%",
          }}
          animate={{ x: [0, -30] }}
          transition={{ repeat: Infinity, duration: 1 / speed, ease: "linear" }}
        />

        {/* Belt lines */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[hsl(195_80%_50%/0.2)]" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[hsl(195_80%_50%/0.2)]" />

        {/* Item sliding in */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: "0%", opacity: 1 }}
            exit={{ x: "150%", opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="absolute inset-0 flex items-center justify-center px-6"
          >
            <div className="rounded-xl border-2 border-[hsl(195_80%_50%/0.3)] bg-[hsl(210_40%_16%)] px-5 py-3 shadow-lg shadow-black/30 max-w-[280px]">
              <p className="text-sm font-bold text-white text-center">{current?.text}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${
              feedback.isCorrect
                ? "bg-[hsl(160_65%_35%/0.3)] text-[hsl(160_65%_70%)]"
                : "bg-[hsl(0_65%_35%/0.3)] text-[hsl(0_65%_70%)]"
            }`}
          >
            {feedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bucket buttons */}
      <div className="flex flex-wrap justify-center gap-3 max-w-lg">
        {buckets.map((bucket) => (
          <motion.button
            key={bucket}
            onClick={() => handleBucketClick(bucket)}
            disabled={!!feedback}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl border-2 border-[hsl(195_80%_50%/0.25)] bg-[hsl(210_40%_18%)] hover:bg-[hsl(210_40%_25%)] hover:border-[hsl(195_80%_50%/0.5)] text-white font-bold px-5 py-3 text-sm transition-colors disabled:opacity-50"
          >
            {bucket}
          </motion.button>
        ))}
      </div>

      {/* Score */}
      <div className="flex gap-4 text-xs text-white/40">
        <span>✅ {correct}</span>
        <span>❌ {wrong}</span>
        <span className="text-[hsl(45_90%_60%)]">⚡ Speed: {speed.toFixed(1)}x</span>
      </div>
    </div>
  );
}

/* ─── Physics Card Mode ─────────────────────────────── */
function PhysicsCardMode({ items, buckets, onComplete }: Omit<Props, "mode">) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [remaining, setRemaining] = useState(() => [...items].sort(() => Math.random() - 0.5));
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean; cardText: string } | null>(null);
  const [done, setDone] = useState(false);
  const [bucketRects, setBucketRects] = useState<Record<string, DOMRect>>({});
  const bucketRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const total = items.length;

  // Update bucket rects
  useEffect(() => {
    const rects: Record<string, DOMRect> = {};
    for (const [key, el] of Object.entries(bucketRefs.current)) {
      if (el) rects[key] = el.getBoundingClientRect();
    }
    setBucketRects(rects);
  }, [buckets]);

  const handleDragEnd = useCallback((cardItem: ZoneDragDropItem, point: { x: number; y: number }) => {
    // Check which bucket the card was dropped on
    for (const [bucket, rect] of Object.entries(bucketRects)) {
      if (point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom) {
        const stripEmoji = (s: string) => s.replace(/^[^\w]*\s*/, "").trim();
        const isCorrect = stripEmoji(cardItem.bucket).toLowerCase() === stripEmoji(bucket).toLowerCase()
          || cardItem.bucket === bucket
          || bucket.includes(cardItem.bucket)
          || cardItem.bucket.includes(stripEmoji(bucket));

        if (isCorrect) {
          setCorrect((c) => c + 1);
          setRemaining((r) => r.filter((item) => item.text !== cardItem.text));
          setFeedback({ text: "✅ Correct!", isCorrect: true, cardText: cardItem.text });
        } else {
          setWrong((w) => w + 1);
          setFeedback({ text: `❌ Belongs in ${cardItem.bucket}`, isCorrect: false, cardText: cardItem.text });
        }

        setTimeout(() => setFeedback(null), 1000);
        return;
      }
    }
    // Dropped on nothing — card springs back (handled by framer-motion)
  }, [bucketRects]);

  // Check completion
  useEffect(() => {
    if (remaining.length === 0 && !done && total > 0) {
      setDone(true);
      const pct = correct / total;
      const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1;
      setTimeout(() => onComplete(true, stars), 1200);
    }
  }, [remaining.length, done, correct, total, onComplete]);

  if (done) {
    const pct = correct / total;
    const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1;
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4 py-8">
        <span className="text-5xl">🎉</span>
        <h3 className="text-xl font-bold text-white">All Sorted!</h3>
        <p className="text-sm text-white/60">{correct}/{total} correct</p>
        <div className="flex gap-1">
          {[1, 2, 3].map((s) => (
            <span key={s} className={`text-2xl ${s <= stars ? "" : "opacity-20"}`}>⭐</span>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-4 py-4 px-4 min-h-[450px] relative">
      {/* Progress */}
      <div className="text-center">
        <p className="text-xs text-white/40 font-mono mb-1">{total - remaining.length}/{total} SORTED</p>
        <Progress value={((total - remaining.length) / total) * 100} className="h-2 bg-white/10 max-w-xs mx-auto" />
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mx-auto rounded-lg px-4 py-2 text-sm font-bold ${
              feedback.isCorrect
                ? "bg-[hsl(160_65%_35%/0.3)] text-[hsl(160_65%_70%)]"
                : "bg-[hsl(0_65%_35%/0.3)] text-[hsl(0_65%_70%)]"
            }`}
          >
            {feedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards area */}
      <div className="flex flex-wrap justify-center gap-3 min-h-[180px] py-2">
        {remaining.map((item, i) => (
          <motion.div
            key={item.text}
            drag
            dragSnapToOrigin
            dragElastic={0.2}
            dragMomentum={false}
            whileDrag={{ scale: 1.08, rotate: 3, zIndex: 50, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
            whileHover={{ scale: 1.03, y: -4 }}
            onDragEnd={(_, info) => handleDragEnd(item, info.point)}
            className="cursor-grab active:cursor-grabbing rounded-xl border-2 border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_16%)] px-4 py-3 shadow-lg shadow-black/20 select-none max-w-[200px]"
            style={{ zIndex: remaining.length - i }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <p className="text-xs font-bold text-white text-center pointer-events-none">{item.text}</p>
          </motion.div>
        ))}
      </div>

      {/* Bucket drop zones */}
      <div className="flex flex-wrap justify-center gap-4 mt-auto">
        {buckets.map((bucket) => (
          <div
            key={bucket}
            ref={(el) => { bucketRefs.current[bucket] = el; }}
            className="rounded-2xl border-2 border-dashed border-[hsl(195_80%_50%/0.3)] bg-[hsl(210_40%_14%/0.6)] px-6 py-4 min-w-[140px] text-center transition-colors hover:border-[hsl(195_80%_50%/0.6)] hover:bg-[hsl(210_40%_14%/0.8)]"
          >
            <p className="text-xs font-bold text-[hsl(195_80%_65%)]">{bucket}</p>
            <p className="text-[9px] text-white/20 mt-1">Drop here</p>
          </div>
        ))}
      </div>

      {/* Score */}
      <div className="flex gap-4 text-xs text-white/40 justify-center">
        <span>✅ {correct}</span>
        <span>❌ {wrong}</span>
      </div>
    </div>
  );
}

/* ─── Mode assignment per zone ──────────────────────── */
const CONVEYOR_ZONES = new Set([
  "hq", "password-peak", "phish-lagoon", "stranger-shore", "kindness-kingdom", "social-fortress",
]);

export default function ZoneDragDropGame({ items, buckets, mode, onComplete }: Props) {
  // Determine mode: explicit prop > zone-based > default
  const resolvedMode = mode || "conveyor";

  if (resolvedMode === "physics") {
    return <PhysicsCardMode items={items} buckets={buckets} onComplete={onComplete} />;
  }
  return <ConveyorMode items={items} buckets={buckets} onComplete={onComplete} />;
}

export { CONVEYOR_ZONES };
