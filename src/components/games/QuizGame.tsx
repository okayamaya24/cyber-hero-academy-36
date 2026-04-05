import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { AgeTier } from './GameShell';
import { QuizQuestion } from '@/data/quizData';

interface QuizGameProps {
  ageTier: AgeTier;
  questions: QuizQuestion[];
  onComplete: (score: number, maxScore: number) => void;
  characterName?: string;
  characterEmoji?: string;
}

const TIMER: Record<AgeTier, number> = { junior: 15, hero: 10, elite: 7 };
const CHOICES: Record<AgeTier, number> = { junior: 2, hero: 4, elite: 4 };

export default function QuizGame({
  ageTier,
  questions,
  onComplete,
  characterName = 'Byte',
  characterEmoji = '🤖',
}: QuizGameProps) {
  const timerMax = TIMER[ageTier];
  const choiceCount = CHOICES[ageTier];

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timerMax);
  const [selected, setSelected] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [byteReaction, setByteReaction] = useState<'idle' | 'happy' | 'sad'>('idle');

  const filteredQ = questions.slice(0, Math.min(questions.length, 8));
  const current = filteredQ[index];
  const displayOptions = current.options.slice(0, choiceCount);
  const progress = (index / filteredQ.length) * 100;

  const advance = useCallback((answeredIndex: number | null) => {
    const correct = answeredIndex === current.correct;
    const pts = correct ? (streak >= 2 ? 15 : 10) : 0;
    const newStreak = correct ? streak + 1 : 0;

    setScore(s => s + pts);
    setStreak(newStreak);
    setByteReaction(correct ? 'happy' : 'sad');
    setTimeout(() => setByteReaction('idle'), 1000);

    setTimeout(() => {
      setSelected(null);
      if (index + 1 >= filteredQ.length) {
        onComplete(score + pts, filteredQ.length * 10);
      } else {
        setIndex(i => i + 1);
        setTimeLeft(timerMax);
      }
    }, ageTier === 'elite' ? 1200 : 1600);
  }, [current, index, filteredQ.length, onComplete, score, streak, timerMax, ageTier]);

  useEffect(() => {
    if (selected !== null) return;
    if (timeLeft <= 0) { advance(null); return; }
    const t = setTimeout(() => setTimeLeft(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, selected, advance]);

  const pick = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    advance(i);
  };

  const optionColors = (i: number) => {
    if (selected === null) return 'bg-white/5 border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/50';
    if (i === current.correct) return 'bg-green-500/20 border-green-500';
    if (i === selected && i !== current.correct) return 'bg-red-500/20 border-red-500';
    return 'bg-white/5 border-white/10 opacity-40';
  };

  return (
    <div className="flex flex-col gap-5 p-5 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              scale: byteReaction !== 'idle' ? 1.3 : 1,
              rotate: byteReaction === 'happy' ? [0, -10, 10, 0] : byteReaction === 'sad' ? [0, 5, -5, 0] : 0,
            }}
            className="text-4xl"
          >
            {byteReaction === 'happy' ? '🤩' : byteReaction === 'sad' ? '😬' : characterEmoji}
          </motion.div>
          <div>
            <p className="text-xs text-gray-400">{characterName} says:</p>
            <p className="text-sm text-cyan-300 font-semibold">
              {byteReaction === 'happy' ? "YES! That's correct! 🔥" :
               byteReaction === 'sad' ? "Oops! Almost had it! 💪" :
               "What do you think, Guardian?"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-cyan-400">{score}</div>
          <div className="text-xs text-gray-500">points</div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Question {index + 1} of {filteredQ.length}</span>
          {streak >= 2 && <span className="text-yellow-400">🔥 {streak} streak!</span>}
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-cyan-500 rounded-full" animate={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors ${timeLeft <= 3 ? 'bg-red-500' : 'bg-green-400'}`}
          animate={{ width: `${(timeLeft / timerMax) * 100}%` }}
          transition={{ duration: 1 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-[#0d1220] border border-white/10 rounded-2xl p-5"
        >
          <p className="text-white font-semibold text-base leading-relaxed">{current.question}</p>
          <AnimatePresence>
            {selected !== null && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className={`mt-3 text-sm ${selected === current.correct ? 'text-green-400' : 'text-red-400'}`}
              >
                {selected === current.correct ? '✅ ' : '❌ '}{current.explanation}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-3">
        {displayOptions.map((opt, i) => (
          <motion.button
            key={`${index}-${i}`}
            whileTap={{ scale: 0.97 }}
            onClick={() => pick(i)}
            disabled={selected !== null}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all font-medium flex items-center gap-3 ${optionColors(i)}`}
          >
            <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {['A', 'B', 'C', 'D'][i]}
            </span>
            <span className="text-sm">{opt}</span>
            {selected !== null && i === current.correct && <CheckCircle className="w-5 h-5 text-green-400 ml-auto flex-shrink-0" />}
            {selected === i && i !== current.correct && <XCircle className="w-5 h-5 text-red-400 ml-auto flex-shrink-0" />}
          </motion.button>
        ))}
      </div>

      {ageTier === 'elite' && (
        <p className={`text-center text-sm font-bold ${timeLeft <= 3 ? 'text-red-400' : 'text-gray-500'}`}>{timeLeft}s</p>
      )}
    </div>
  );
}
