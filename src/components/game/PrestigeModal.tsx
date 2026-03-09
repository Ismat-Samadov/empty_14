"use client";

// Prestige confirmation modal

import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { formatNumber } from "@/lib/formatters";

interface PrestigeModalProps {
  open: boolean;
  pendingStardust: number;
  currentStardust: number;
  totalEnergyEarned: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PrestigeModal({
  open,
  pendingStardust,
  currentStardust,
  totalEnergyEarned,
  onConfirm,
  onCancel,
}: PrestigeModalProps) {
  const newTotal = currentStardust + pendingStardust;
  const newMultiplier = (1 + newTotal * 0.02).toFixed(2);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="bg-slate-900 border border-yellow-400/30 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_60px_rgba(253,224,71,0.2)] pointer-events-auto">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">✨</div>
                <h2 className="text-xl font-bold text-yellow-200">
                  Prestige Reset
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Rewrite the cosmos and grow stronger.
                </p>
              </div>

              {/* Gain preview */}
              <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-xl p-4 mb-4 space-y-2">
                <p className="text-xs text-slate-400">You will gain:</p>
                <p className="text-lg font-bold text-yellow-300">
                  ✨ +{pendingStardust} Stardust
                </p>
                <p className="text-xs text-slate-400">
                  New total:{" "}
                  <span className="text-yellow-300 font-semibold">
                    {newTotal} stardust
                  </span>{" "}
                  → ×{newMultiplier} multiplier
                </p>
              </div>

              {/* What resets */}
              <div className="space-y-1 mb-6 text-xs">
                <p className="text-slate-400 font-semibold mb-1">Resets:</p>
                {[
                  "⚡ All energy, crystals, dark matter",
                  "🏗️ All buildings",
                  "⬆️ All regular upgrades",
                  "📊 Production stats",
                ].map((item) => (
                  <p key={item} className="text-red-400">
                    ✗ {item}
                  </p>
                ))}
                <p className="text-slate-400 font-semibold mt-2 mb-1">Kept:</p>
                {[
                  "✨ Stardust",
                  "🔮 Prestige upgrades",
                  "🏆 Achievements",
                  "⚙️ Settings",
                ].map((item) => (
                  <p key={item} className="text-green-400">
                    ✓ {item}
                  </p>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={onConfirm}
                  className="flex-1 border-yellow-400/50 text-yellow-300 hover:bg-yellow-500/20"
                >
                  Confirm Prestige
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
