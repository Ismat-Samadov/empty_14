"use client";

// Stack of achievement unlock toasts (slide in from right)

import { AnimatePresence, motion } from "framer-motion";
import { getAchievementById } from "@/lib/gameLogic";

interface AchievementToastProps {
  achievementIds: string[]; // queue of IDs to show
  onDismiss: (id: string) => void;
}

export default function AchievementToast({
  achievementIds,
  onDismiss,
}: AchievementToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence>
        {achievementIds.map((id) => {
          const achievement = getAchievementById(id);
          if (!achievement) return null;

          // Auto-dismiss after 4 seconds
          setTimeout(() => onDismiss(id), 4000);

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="pointer-events-auto"
            >
              <div className="flex items-center gap-3 bg-slate-900 border border-purple-500/40 rounded-xl px-4 py-3 shadow-[0_0_20px_rgba(168,85,247,0.3)] max-w-[280px]">
                <span className="text-2xl shrink-0">{achievement.icon}</span>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold">
                    Achievement Unlocked!
                  </p>
                  <p className="text-sm font-bold text-white">
                    {achievement.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {achievement.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
