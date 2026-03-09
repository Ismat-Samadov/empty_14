"use client";

// Top resource bar showing current energy, crystals, dark matter, stardust

import { motion, AnimatePresence } from "framer-motion";
import { formatNumber, formatRate } from "@/lib/formatters";
import type { Resources, ComputedValues } from "@/lib/types";

interface ResourceBarProps {
  resources: Resources;
  computed: ComputedValues;
}

interface ResourceChipProps {
  icon: string;
  label: string;
  amount: number;
  rate?: number;
  color: string;
  glowClass: string;
}

function ResourceChip({ icon, label, amount, rate, color, glowClass }: ResourceChipProps) {
  return (
    <div
      className={`flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 min-w-[120px] backdrop-blur-sm ${glowClass}`}
    >
      <span className="text-xl leading-none">{icon}</span>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
          {label}
        </span>
        <motion.span
          key={Math.floor(amount / 10)} // re-animate every 10 units
          className={`text-sm font-bold tabular-nums ${color}`}
        >
          {formatNumber(amount)}
        </motion.span>
        {rate !== undefined && rate > 0 && (
          <span className="text-[10px] text-slate-500 tabular-nums">
            {formatRate(rate)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ResourceBar({ resources, computed }: ResourceBarProps) {
  const showCrystals =
    resources.crystals > 0 || computed.crystalsPerSecond > 0;
  const showDarkMatter =
    resources.darkMatter > 0 || computed.darkMatterPerSecond > 0;
  const showStardust = resources.stardust > 0;

  return (
    <div className="flex flex-wrap gap-2 p-3">
      {/* Energy — always visible */}
      <ResourceChip
        icon="⚡"
        label="Energy"
        amount={resources.energy}
        rate={computed.energyPerSecond}
        color="text-cyan-300"
        glowClass="shadow-[0_0_8px_rgba(34,211,238,0.15)]"
      />

      {/* Crystals — shown once unlocked */}
      <AnimatePresence>
        {showCrystals && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <ResourceChip
              icon="💎"
              label="Crystals"
              amount={resources.crystals}
              rate={computed.crystalsPerSecond}
              color="text-blue-300"
              glowClass="shadow-[0_0_8px_rgba(96,165,250,0.15)]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dark Matter */}
      <AnimatePresence>
        {showDarkMatter && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <ResourceChip
              icon="🌑"
              label="Dark Matter"
              amount={resources.darkMatter}
              rate={computed.darkMatterPerSecond}
              color="text-purple-300"
              glowClass="shadow-[0_0_8px_rgba(168,85,247,0.15)]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stardust */}
      <AnimatePresence>
        {showStardust && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <ResourceChip
              icon="✨"
              label="Stardust"
              amount={resources.stardust}
              color="text-yellow-300"
              glowClass="shadow-[0_0_8px_rgba(253,224,71,0.15)]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
