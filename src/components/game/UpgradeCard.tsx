"use client";

// Single upgrade card (regular or prestige)

import { motion } from "framer-motion";
import { formatNumber } from "@/lib/formatters";
import Button from "@/components/ui/Button";
import type { UpgradeConfig, PrestigeUpgradeConfig, Resources } from "@/lib/types";

// ---- Regular upgrade ----
interface UpgradeCardProps {
  config: UpgradeConfig;
  canAfford: boolean;
  onBuy: () => void;
}

export function UpgradeCard({ config, canAfford, onBuy }: UpgradeCardProps) {
  const icons: Record<string, string> = {
    energy: "⚡",
    crystals: "💎",
    darkMatter: "🌑",
    stardust: "✨",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        flex items-start gap-3 p-3 rounded-xl border transition-all duration-200
        ${
          canAfford
            ? "bg-purple-500/10 border-purple-500/30 hover:border-purple-500/50"
            : "bg-white/3 border-white/5 opacity-50"
        }
      `}
    >
      <div className="w-10 h-10 flex items-center justify-center text-xl bg-white/10 rounded-lg shrink-0">
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm">{config.name}</p>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
          {config.description}
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {(Object.keys(config.cost) as (keyof Resources)[]).map((k) => (
            <span key={k} className="text-xs text-slate-300">
              {icons[k]} {formatNumber(config.cost[k] ?? 0)}
            </span>
          ))}
        </div>
      </div>
      <Button variant="secondary" size="sm" disabled={!canAfford} onClick={onBuy}>
        Buy
      </Button>
    </motion.div>
  );
}

// ---- Prestige upgrade ----
interface PrestigeUpgradeCardProps {
  config: PrestigeUpgradeConfig;
  stardust: number;
  purchased: boolean;
  onBuy: () => void;
}

export function PrestigeUpgradeCard({
  config,
  stardust,
  purchased,
  onBuy,
}: PrestigeUpgradeCardProps) {
  const affordable = stardust >= config.costStardust;

  if (purchased) {
    return (
      <div className="flex items-start gap-3 p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 opacity-60">
        <div className="w-10 h-10 flex items-center justify-center text-xl bg-white/10 rounded-lg shrink-0">
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-yellow-300 text-sm">{config.name}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{config.description}</p>
          <p className="text-[11px] text-green-400 mt-1">✓ Purchased</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        flex items-start gap-3 p-3 rounded-xl border transition-all duration-200
        ${
          affordable
            ? "bg-yellow-500/10 border-yellow-400/30 hover:border-yellow-400/50"
            : "bg-white/3 border-white/5 opacity-50"
        }
      `}
    >
      <div className="w-10 h-10 flex items-center justify-center text-xl bg-white/10 rounded-lg shrink-0">
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-yellow-200 text-sm">{config.name}</p>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
          {config.description}
        </p>
        <p className="text-xs text-yellow-400 mt-1">
          ✨ {config.costStardust} Stardust
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        disabled={!affordable}
        onClick={onBuy}
        className={
          affordable
            ? "border-yellow-400/50 text-yellow-300 hover:bg-yellow-500/20"
            : ""
        }
      >
        Buy
      </Button>
    </motion.div>
  );
}
