/**
 * LessonPreviewPage — DEV ONLY
 * Quick preview of all lesson content without needing to log in.
 */
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import LessonPlayer from "@/components/learning/LessonPlayer";
import { LESSON_CONTENT, type LessonContent } from "@/data/lessonContent";

export default function LessonPreviewPage() {
  const [active, setActive] = useState<LessonContent | null>(null);

  return (
    <div className="min-h-screen bg-[#080c18] p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-white mb-1">📚 Lesson Preview</h1>
        <p className="text-gray-400 text-sm mb-8">Click any lesson to preview the player.</p>

        <div className="grid gap-3">
          {LESSON_CONTENT.map((lesson) => (
            <button
              key={lesson.lessonId}
              onClick={() => setActive(lesson)}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10 hover:border-purple-400/30 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl ${lesson.characterColor} flex items-center justify-center text-2xl flex-shrink-0`}>
                {lesson.characterEmoji}
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-0.5">
                  {lesson.character}
                </p>
                <p className="text-sm font-bold text-white">
                  {lesson.slides[0].headline}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {lesson.slides.length} slides · Mission: {lesson.missionId}
                </p>
              </div>
              <span className="ml-auto text-purple-400 font-extrabold text-sm">Preview →</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <LessonPlayer
            lesson={active}
            onStartQuiz={() => {
              alert(`✅ Would now launch quiz mission: "${active.missionId}"`);
              setActive(null);
            }}
            onClose={() => setActive(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
