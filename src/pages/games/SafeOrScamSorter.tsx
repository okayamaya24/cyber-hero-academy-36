import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { AgeTier } from '@/components/games/GameShell';

type MsgType = 'email' | 'text' | 'notification';

interface SortItem {
  id: number;
  type: MsgType;
  from: string;
  subject?: string;
  content: string;
  safe: boolean;
  explanation: string;
}

const ALL_ITEMS: SortItem[] = [
  { id: 1,  type: 'email',        from: 'teacher@school.edu',          subject: "Tomorrow's homework",    content: 'Please complete pages 12-15 tonight.',                   safe: true,  explanation: 'Official school email with expected content!' },
  { id: 2,  type: 'email',        from: 'prize@win-now.xyz',            subject: 'YOU WON $10,000!!!',     content: 'Click to claim your prize instantly!',                   safe: false, explanation: '.xyz + prize + urgency = classic scam!' },
  { id: 3,  type: 'text',         from: 'Mom',                         content: 'Dinner is ready!',                                                                          safe: true,  explanation: 'Trusted contact with a normal message!' },
  { id: 4,  type: 'email',        from: 'support@paypa1.com',           subject: 'Account suspended',      content: 'Your account has been suspended. Login to restore.',    safe: false, explanation: '"paypa1" not "paypal" — typosquatting phishing!' },
  { id: 5,  type: 'notification', from: 'App Store',                   content: 'Update available for YouTube',                                                              safe: true,  explanation: 'Official app store notification is legitimate!' },
  { id: 6,  type: 'email',        from: 'noreply@amazon.com',           subject: 'Your order shipped',     content: 'Your package will arrive Thursday. Track your order.', safe: true,  explanation: 'Expected shipping notification from amazon.com!' },
  { id: 7,  type: 'text',         from: 'Unknown',                     content: 'Click here for a FREE gift card! bit.ly/abc',                                               safe: false, explanation: 'Unknown sender + free gift + short link = scam!' },
  { id: 8,  type: 'email',        from: 'admin@g00gle.net',             subject: 'Verify your account',    content: 'Click to verify or your account will be deleted.',     safe: false, explanation: '"g00gle" with zeros and .net — not Google!' },
  { id: 9,  type: 'email',        from: 'newsletter@trusted-news.com',  subject: 'Monthly newsletter',     content: 'Here\'s your monthly digest of top stories.',           safe: true,  explanation: 'Expected newsletter from subscribed service!' },
  { id: 10, type: 'text',         from: 'Friend 🎮',                   content: 'Want to play later?',                                                                       safe: true,  explanation: 'Known contact with a perfectly normal message!' },
];

const ITEM_COUNTS: Record<AgeTier, number> = { junior: 6, hero: 8, elite: 10 };

function MessageCard({ item }: { item: SortItem }) {
  const base = 'rounded-xl overflow-hidden border';
  if (item.type === 'email') {
    return (
      <div className={`${base} border-white/10 bg-white/5`}>
        <div className="px-3 py-2 bg-white/5 border-b border-white/10">
          <div className="text-xs text-gray-500">From: <span className="text-gray-300">{item.from}</span></div>
          {item.subject && <div className="text-xs font-medium text-white mt-0.5">{item.subject}</div>}
        </div>
        <div className="px-3 py-2 text-sm text-gray-300">{item.content}</div>
      </div>
    );
  }
  if (item.type === 'notification') {
    return (
      <div className={`${base} border-white/10 bg-[#1c1c1e] p-3 flex items-start gap-3`}>
        <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center text-xl flex-shrink-0">📱</div>
        <div>
          <div className="text-sm font-bold text-white">{item.from}</div>
          <div className="text-sm text-gray-300 mt-0.5">{item.content}</div>
        </div>
      </div>
    );
  }
  // text
  return (
    <div className="space-y-1">
      <div className="text-xs text-gray-500 text-center">{item.from}</div>
      <div className="max-w-[80%] mx-auto bg-[#0a84ff] rounded-2xl px-4 py-3 text-white text-sm">{item.content}</div>
    </div>
  );
}

function SafeOrScamSorterGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (score: number, maxScore: number) => void }) {
  const count = ITEM_COUNTS[ageTier];
  const [items] = useState(() => ALL_ITEMS.slice(0, count).sort(() => Math.random() - 0.5));
  const [sorted, setSorted] = useState<{item: SortItem; correct: boolean}[]>([]);
  const [dragItem, setDragItem] = useState<SortItem | null>(null);
  const [dragOverZone, setDragOverZone] = useState<'safe' | 'scam' | null>(null);
  const [feedback, setFeedback] = useState<{item: SortItem; correct: boolean} | null>(null);

  const unsorted = items.filter(item => !sorted.some(s => s.item.id === item.id));
  const score = sorted.filter(s => s.correct).length * 15;

  const handleDrop = (zone: 'safe' | 'scam') => {
    if (!dragItem) return;
    const isSafe = zone === 'safe';
    const correct = isSafe === dragItem.safe;
    const result = { item: dragItem, correct };
    setSorted(prev => [...prev, result]);
    setFeedback(result);
    setDragItem(null);
    setDragOverZone(null);
    setTimeout(() => setFeedback(null), 2000);
    if (sorted.length + 1 >= items.length) {
      setTimeout(() => onComplete(score + (correct ? 15 : 0), items.length * 15), 2200);
    }
  };

  // Also support click sorting
  const handleClick = (item: SortItem, zone: 'safe' | 'scam') => {
    const isSafe = zone === 'safe';
    const correct = isSafe === item.safe;
    const result = { item, correct };
    setSorted(prev => [...prev, result]);
    setFeedback(result);
    setTimeout(() => setFeedback(null), 2000);
    if (sorted.length + 1 >= items.length) {
      setTimeout(() => onComplete(score + (correct ? 15 : 0), items.length * 15), 2200);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] p-3 gap-3">
      {/* HUD */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Sorted: {sorted.length}/{items.length}</span>
        <span className="text-green-400 font-bold">{score} pts</span>
      </div>

      {/* Drop zones */}
      <div className="flex gap-2 h-28">
        <div
          className={`flex-1 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all
            ${dragOverZone === 'safe' ? 'border-green-500 bg-green-500/20' : 'border-green-500/30 bg-green-500/5'}`}
          onDragOver={e => { e.preventDefault(); setDragOverZone('safe'); }}
          onDragLeave={() => setDragOverZone(null)}
          onDrop={() => handleDrop('safe')}
        >
          <div className="text-3xl">📬</div>
          <div className="text-xs font-bold text-green-400 mt-1">SAFE INBOX</div>
          <div className="text-xs text-gray-600">{sorted.filter(s => s.item.safe).length} sorted</div>
        </div>
        <div
          className={`flex-1 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all
            ${dragOverZone === 'scam' ? 'border-red-500 bg-red-500/20' : 'border-red-500/30 bg-red-500/5'}`}
          onDragOver={e => { e.preventDefault(); setDragOverZone('scam'); }}
          onDragLeave={() => setDragOverZone(null)}
          onDrop={() => handleDrop('scam')}
        >
          <div className="text-3xl">🗑️</div>
          <div className="text-xs font-bold text-red-400 mt-1">SCAM TRASH</div>
          <div className="text-xs text-gray-600">{sorted.filter(s => !s.item.safe).length} sorted</div>
        </div>
      </div>

      {/* Message pile */}
      <div className="flex-1 overflow-y-auto space-y-2 relative">
        <AnimatePresence>
          {unsorted.map((item, i) => (
            <motion.div key={item.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 200 }}
              draggable
              onDragStart={() => setDragItem(item)}
              onDragEnd={() => { setDragItem(null); setDragOverZone(null); }}
              className="cursor-grab active:cursor-grabbing"
            >
              <MessageCard item={item} />
              {/* Quick sort buttons */}
              <div className="flex gap-2 mt-1">
                <button onClick={() => handleClick(item, 'safe')}
                  className="flex-1 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-all">
                  📬 SAFE
                </button>
                <button onClick={() => handleClick(item, 'scam')}
                  className="flex-1 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all">
                  🗑️ SCAM
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {unsorted.length === 0 && (
          <div className="text-center text-gray-600 py-8">All sorted! 🎉</div>
        )}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-xl p-3 text-sm ${feedback.correct ? 'bg-green-500/10 border border-green-500 text-green-300' : 'bg-red-500/10 border border-red-500 text-red-300'}`}>
            {feedback.correct ? '✅ Correct! ' : '❌ Actually — '}{feedback.item.explanation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SafeOrScamSorter() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Safe or Scam Sorter" category="Drag & Drop" xpReward={150} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => <SafeOrScamSorterGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
