import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GameShell, { AgeTier } from '@/components/games/GameShell';
import { BLITZ_QUESTIONS } from '@/data/quizData';
import { Zap } from 'lucide-react';

const DURATION: Record<AgeTier, number> = { junior: 45, hero: 60, elite: 60 };

function BytesQuizBlitzGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (s: number, m: number) => void }) {
  const questions = [...BLITZ_QUESTIONS[ageTier]].sort(() => Math.random() - 0.5);
  const duration = DURATION[ageTier];
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [byteState, setByteState] = useState<'hype' | 'sad' | 'idle'>('idle');
  const [answered, setAnswered] = useState(0);
  const scoreRef = useRef(0);
  const endedRef = useRef(false);

  const end = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    onComplete(scoreRef.current, duration * 2);
  }, [duration, onComplete]);

  useEffect(() => {
    if (!started) return;
    if (timeLeft <= 0) { end(); return; }
    const t = setTimeout(() => setTimeLeft(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [started, timeLeft, end]);

  const answer = (choice: number) => {
    if (feedback || !started) return;
    const current = questions[index % questions.length];
    const correct = choice === current.correct;
    const newStreak = correct ? streak + 1 : 0;
    const pts = correct ? 10 * (newStreak >= 3 ? 2 : 1) : 0;
    scoreRef.current += pts;
    setScore(s => s + pts);
    setStreak(newStreak);
    setAnswered(a => a + 1);
    setFeedback(correct ? 'correct' : 'wrong');
    setByteState(correct ? 'hype' : 'sad');
    setTimeout(() => { setFeedback(null); setByteState('idle'); setIndex(i => i + 1); }, 700);
  };

  const current = questions[index % questions.length];
  const timerPct = (timeLeft / duration) * 100;
  const displayOptions = ageTier === 'junior' ? current.options.slice(0, 2) : current.options;
  const byteEmoji = { hype: '🤩', sad: '😬', idle: '🤖' }[byteState];
  const byteText = { hype: streak >= 3 ? `${streak}x STREAK! UNSTOPPABLE! 🔥` : 'CORRECT! Keep going! ⚡', sad: "That's okay! Next one! 💪", idle: `${answered} answered · Go go go!` }[byteState];

  return (
    <div className="flex flex-col gap-4 p-5 max-w-lg mx-auto">
      {!started ? (
        <div className="flex flex-col items-center gap-5 mt-10">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-7xl">🤖</motion.div>
          <h2 className="text-2xl font-black text-white">Byte's Quiz Blitz!</h2>
          <p className="text-gray-300 text-center">{ageTier === 'junior' ? `Answer as many questions as you can in ${duration} seconds!` : `${duration} seconds. Answer fast. Streak bonuses double your points! 🔥`}</p>
          <button onClick={() => { setStarted(true); endedRef.current = false; }} className="px-10 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xl rounded-2xl transition">Let's GO! ⚡</button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <motion.div className={`h-full rounded-full ${timerPct > 50 ? 'bg-green-400' : timerPct > 20 ? 'bg-yellow-400' : 'bg-red-500'}`} animate={{ width: `${timerPct}%` }} transition={{ duration: 1 }} />
              </div>
              <span className={`absolute right-0 -top-5 text-xs font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-gray-400'}`}>{timeLeft}s</span>
            </div>
            <div className="flex items-center gap-1 bg-cyan-500/20 border border-cyan-500 rounded-xl px-3 py-1">
              <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              <span className="text-cyan-400 font-black text-lg">{score}</span>
            </div>
          </div>
          <AnimatePresence>{streak >= 3 && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-center text-yellow-400 font-black text-lg">🔥 {streak}x STREAK — 2x POINTS!</motion.div>}</AnimatePresence>
          <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3 border border-white/10">
            <motion.div animate={{ scale: byteState === 'hype' ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }} className="text-4xl flex-shrink-0">{byteEmoji}</motion.div>
            <p className="text-sm text-cyan-300 font-semibold">{byteText}</p>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.15 }}
              className={`bg-[#0d1220] border-2 rounded-2xl p-4 transition-colors ${feedback === 'correct' ? 'border-green-500' : feedback === 'wrong' ? 'border-red-500' : 'border-white/10'}`}>
              <p className="text-white font-semibold text-base">{current.question}</p>
            </motion.div>
          </AnimatePresence>
          <div className={`grid gap-2 ${displayOptions.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {displayOptions.map((opt, i) => (
              <motion.button key={`${index}-${i}`} whileTap={{ scale: 0.95 }} onClick={() => answer(i)} disabled={!!feedback}
                className={`py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all text-left
                  ${feedback === null ? 'bg-white/5 border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500' : 'opacity-50'}
                  ${feedback !== null && i === current.correct ? 'bg-green-500/20 border-green-500 opacity-100' : ''}`}>
                {opt}
              </motion.button>
            ))}
          </div>
          <p className="text-center text-xs text-gray-600">{answered} questions answered</p>
        </>
      )}
    </div>
  );
}

export default function BytesQuizBlitz() {
  const navigate = useNavigate();
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Byte's Quiz Blitz" category="Speed Round" xpReward={150} ageTier={ageTier} onClose={() => navigate('/missions')}>
      {({ ageTier, onComplete }) => <BytesQuizBlitzGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
