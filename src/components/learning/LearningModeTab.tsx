/**
 * LearningModeTab
 *
 * Shows the 4 guide characters as lesson hubs.
 * Kids must complete lessons in order. Completing a lesson
 * (= completing the mapped mission) unlocks the next one.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, CheckCircle2, ChevronRight, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LEARNING_CHARACTERS,
  isCharacterUnlocked,
  isLessonUnlocked,
  type LearningCharacter,
  type LearningLesson,
} from "@/data/learningMode";
import { GUIDE_REGISTRY } from "@/data/guides";
import { MISSIONS } from "@/data/missions";
import LessonPlayer from "@/components/learning/LessonPlayer";
import { getLessonContent } from "@/data/lessonContent";

interface Props {
  completedMissionIds: Set<string>;
  missionProgress: any[];
  onStartLesson: (missionId: string) => void;
  childName: string;
}

function getLessonStatus(
  character: LearningCharacter,
  lesson: LearningLesson,
  lessonIndex: number,
  completedMissionIds: Set<string>,
  unlocked: boolean,
): "done" | "active" | "locked" | "soon" {
  if (lesson.comingSoon) return "soon";
  if (!unlocked) return "locked";
  if (lesson.missionId && completedMissionIds.has(lesson.missionId)) return "done";
  return "active";
}

function CharacterCard({
  character,
  completedMissionIds,
  onStartLesson,
  isExpanded,
  onToggle,
}: {
  character: LearningCharacter;
  completedMissionIds: Set<string>;
  onStartLesson: (lessonId: string, missionId: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const unlocked = isCharacterUnlocked(character, completedMissionIds);
  const guide = GUIDE_REGISTRY[character.guideId];

  const completedCount = character.lessons.filter(
    (l) => !l.comingSoon && l.missionId && completedMissionIds.has(l.missionId),
  ).length;
  const totalLive = character.lessons.filter((l) => !l.comingSoon).length;
  const allDone = completedCount === totalLive;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 overflow-hidden transition-all ${
        !unlocked
          ? "border-slate-200 bg-slate-50 opacity-60"
          : allDone
          ? `${character.borderColor} bg-white`
          : `${character.borderColor} bg-white shadow-sm`
      }`}
    >
      {/* Character header */}
      <button
        className="w-full text-left"
        onClick={unlocked ? onToggle : undefined}
        disabled={!unlocked}
      >
        <div className="flex items-center gap-4 p-4">
          {/* Guide image / emoji */}
          <div className={`relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl ${character.color} ${!unlocked ? "grayscale" : ""}`}>
            {guide?.image ? (
              <img src={guide.image} alt={character.name} className="h-12 w-12 object-contain" />
            ) : (
              <span className="text-3xl">{character.emoji}</span>
            )}
            {!unlocked && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-200/60">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className={`font-black text-base ${!unlocked ? "text-slate-400" : "text-slate-900"}`}>
                {character.name}
              </h3>
              {allDone && <span className="text-[10px] font-black text-green-600 bg-green-100 px-2 py-0.5 rounded-full">✓ Complete!</span>}
              {!unlocked && (
                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  🔒 Locked
                </span>
              )}
            </div>
            <p className={`text-xs font-semibold mb-2 ${!unlocked ? "text-slate-400" : "text-slate-500"}`}>
              {character.topic}
            </p>
            {unlocked && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 max-w-[120px] overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${allDone ? "bg-green-500" : character.textColor.replace("text", "bg")}`}
                    style={{ width: `${totalLive > 0 ? (completedCount / totalLive) * 100 : 0}%` }}
                  />
                </div>
                <span className={`text-[11px] font-bold ${character.textColor}`}>
                  {completedCount}/{totalLive} lessons
                </span>
              </div>
            )}
            {!unlocked && (
              <p className="text-[11px] text-slate-400 font-semibold">
                Finish {LEARNING_CHARACTERS.find(c => c.id === character.unlockedAfterCharacter)?.name}'s lessons to unlock
              </p>
            )}
          </div>

          {unlocked && (
            <ChevronRight className={`h-5 w-5 flex-shrink-0 text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
          )}
        </div>
      </button>

      {/* Lessons list */}
      <AnimatePresence>
        {isExpanded && unlocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 divide-y divide-slate-50">
              {character.lessons.map((lesson, idx) => {
                const lessonUnlocked = isLessonUnlocked(character, idx, completedMissionIds);
                const status = getLessonStatus(character, lesson, idx, completedMissionIds, lessonUnlocked);
                const mission = lesson.missionId ? MISSIONS.find((m) => m.id === lesson.missionId) : null;

                return (
                  <div
                    key={lesson.id}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      status === "active" ? "bg-amber-50/50 hover:bg-amber-50" : ""
                    }`}
                  >
                    {/* Status dot */}
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-black ${
                      status === "done"   ? "bg-green-500 text-white" :
                      status === "active" ? "bg-amber-400 text-white shadow-md" :
                      status === "soon"   ? "bg-slate-100 text-slate-400" :
                                            "bg-slate-100 text-slate-400"
                    }`}>
                      {status === "done"   ? <CheckCircle2 className="h-4 w-4" /> :
                       status === "active" ? idx + 1 :
                       status === "soon"   ? "✦" :
                                            <Lock className="h-3 w-3" />}
                    </div>

                    {/* Lesson info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold leading-tight ${
                        status === "locked" || status === "soon" ? "text-slate-400" : "text-slate-800"
                      }`}>
                        {lesson.title}
                        {status === "soon" && <span className="ml-1.5 text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">Coming Soon</span>}
                      </p>
                      <p className={`text-xs font-medium mt-0.5 ${
                        status === "locked" || status === "soon" ? "text-slate-300" : "text-slate-400"
                      }`}>
                        {lesson.description}
                      </p>
                      {status === "done" && mission && (
                        <div className="mt-1 flex items-center gap-1">
                          {[1, 2, 3].map((s) => <Star key={s} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                          <span className="text-[10px] font-bold text-green-600 ml-0.5">Lesson complete!</span>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    {status === "active" && lesson.missionId && (
                      <Button
                        size="sm"
                        className="flex-shrink-0 rounded-xl px-4 font-black text-sm"
                        style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", boxShadow: "0 3px 10px rgba(124,58,237,0.3)" }}
                        onClick={() => onStartLesson(lesson.id, lesson.missionId!)}
                      >
                        Start →
                      </Button>
                    )}
                    {status === "done" && lesson.missionId && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0 rounded-xl px-3 text-xs font-bold border-green-200 text-green-600 hover:bg-green-50"
                        onClick={() => onStartLesson(lesson.id, lesson.missionId!)}
                      >
                        Replay
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function LearningModeTab({ completedMissionIds, missionProgress, onStartLesson, childName }: Props) {
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // When Start is clicked — show lesson player if content exists, else go straight to quiz
  const handleStartLesson = (lessonId: string, missionId: string) => {
    const content = getLessonContent(lessonId);
    if (content) {
      setActiveLessonId(lessonId);
    } else {
      onStartLesson(missionId);
    }
  };

  const activeLessonContent = activeLessonId ? getLessonContent(activeLessonId) : null;

  const [expandedId, setExpandedId] = useState<string | null>(() => {
    // Auto-expand the first character that has an active lesson
    for (const char of LEARNING_CHARACTERS) {
      if (!isCharacterUnlocked(char, completedMissionIds)) continue;
      const hasActive = char.lessons.some(
        (l) => !l.comingSoon && l.missionId && !completedMissionIds.has(l.missionId),
      );
      if (hasActive) return char.id;
    }
    return LEARNING_CHARACTERS[0].id;
  });

  const totalLessons = LEARNING_CHARACTERS.flatMap((c) => c.lessons).filter((l) => !l.comingSoon).length;
  const completedLessons = LEARNING_CHARACTERS.flatMap((c) =>
    c.lessons.filter((l) => !l.comingSoon && l.missionId && completedMissionIds.has(l.missionId)),
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-400" /> Learning Path
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Complete lessons to unlock games — learn first, then play! 🎯
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-purple-400">{completedLessons}<span className="text-gray-500 text-base font-bold">/{totalLessons}</span></p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Lessons Done</p>
          </div>
        </div>
        {/* Overall progress bar */}
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
            initial={{ width: 0 }}
            animate={{ width: `${totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Character cards */}
      <div className="space-y-3">
        {LEARNING_CHARACTERS.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            completedMissionIds={completedMissionIds}
            onStartLesson={handleStartLesson}
            isExpanded={expandedId === character.id}
            onToggle={() => setExpandedId(expandedId === character.id ? null : character.id)}
          />
        ))}
      </div>

      {/* Games unlock hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3"
      >
        <span className="text-2xl flex-shrink-0">💡</span>
        <div>
          <p className="text-sm font-black text-amber-300">Complete lessons → unlock games!</p>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">
            Each lesson you finish unlocks a whole category of games in the Games tab. The more you learn, the more games you get to play!
          </p>
        </div>
      </motion.div>

      {/* Lesson Player overlay */}
      <AnimatePresence>
        {activeLessonContent && (
          <LessonPlayer
            lesson={activeLessonContent}
            onStartQuiz={() => {
              const missionId = activeLessonContent.missionId;
              setActiveLessonId(null);
              onStartLesson(missionId);
            }}
            onClose={() => setActiveLessonId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
