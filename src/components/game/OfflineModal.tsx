"use client";

// Modal shown when returning after being offline

import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { formatNumber, formatTime } from "@/lib/formatters";

interface OfflineModalProps {
  open: boolean;
  gains: {
    energy: number;
    crystals: number;
    darkMatter: number;
    offlineMs: number;
  } | null;
  onDismiss: () => void;
}

export default function OfflineModal({
  open,
  gains,
  onDismiss,
}: OfflineModalProps) {
  if (!gains) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={onDismiss}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="bg-slate-900 border border-cyan-400/30 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_40px_rgba(34,211,238,0.2)] pointer-events-auto">
              <div className="text-center mb-5">
                <div className="text-4xl mb-2">⏰</div>
                <h2 className="text-lg font-bold text-cyan-200">
                  Welcome Back!
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  You were away for{" "}
                  <span className="text-white font-semibold">
                    {formatTime(gains.offlineMs)}
                  </span>
                  .
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  (Offline progress capped at 4 hours)
                </p>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-xl p-4 mb-5 space-y-2">
                <p className="text-xs text-slate-400 mb-2">
                  Resources earned while away:
                </p>
                {gains.energy > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">⚡ Energy</span>
                    <span className="text-sm font-bold text-cyan-300">
                      +{formatNumber(gains.energy)}
                    </span>
                  </div>
                )}
                {gains.crystals > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">💎 Crystals</span>
                    <span className="text-sm font-bold text-blue-300">
                      +{formatNumber(gains.crystals)}
                    </span>
                  </div>
                )}
                {gains.darkMatter > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">🌑 Dark Matter</span>
                    <span className="text-sm font-bold text-purple-300">
                      +{formatNumber(gains.darkMatter)}
                    </span>
                  </div>
                )}
                {gains.energy === 0 &&
                  gains.crystals === 0 &&
                  gains.darkMatter === 0 && (
                    <p className="text-sm text-slate-500">
                      No automated production yet.
                    </p>
                  )}
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={onDismiss}
                className="w-full"
              >
                Collect & Continue
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
