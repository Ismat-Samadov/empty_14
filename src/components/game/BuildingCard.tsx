"use client";

// Individual building purchase card

import { motion } from "framer-motion";
import { formatNumber } from "@/lib/formatters";
import Button from "@/components/ui/Button";
import type { BuildingConfig, Resources } from "@/lib/types";

interface BuildingCardProps {
  config: BuildingConfig;
  count: number;
  cost: Partial<Resources>;
  canAfford: boolean;
  productionPerSecond: Partial<Resources>;
  onBuy: () => void;
}

function CostLine({ cost }: { cost: Partial<Resources> }) {
  const icons: Record<string, string> = {
    energy: "⚡",
    crystals: "💎",
    darkMatter: "🌑",
    stardust: "✨",
  };
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(cost) as (keyof Resources)[]).map((k) => (
        <span key={k} className="text-xs text-slate-300">
          {icons[k]}{" "}
          <span className="font-semibold">{formatNumber(cost[k] ?? 0)}</span>
        </span>
      ))}
    </div>
  );
}

export default function BuildingCard({
  config,
  count,
  cost,
  canAfford,
  productionPerSecond,
  onBuy,
}: BuildingCardProps) {
  const hasProduction = Object.values(productionPerSecond).some((v) => v && v > 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        flex items-center gap-3 p-3 rounded-xl border transition-all duration-200
        ${
          canAfford
            ? "bg-white/5 border-cyan-400/20 hover:border-cyan-400/40 hover:bg-white/8"
            : "bg-white/3 border-white/5 opacity-60"
        }
      `}
    >
      {/* Icon + count badge */}
      <div className="relative shrink-0">
        <div className="w-12 h-12 flex items-center justify-center text-2xl bg-white/10 rounded-xl">
          {config.icon}
        </div>
        {count > 0 && (
          <div className="absolute -top-1 -right-1 bg-cyan-500 text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {count >= 100 ? "99+" : count}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-white text-sm truncate">
            {config.name}
          </span>
          {count > 0 && hasProduction && (
            <span className="text-[10px] text-cyan-400 shrink-0">
              {Object.entries(productionPerSecond)
                .filter(([, v]) => v && v > 0)
                .map(
                  ([k, v]) =>
                    `${formatNumber(v ?? 0)} ${k === "energy" ? "⚡" : k === "crystals" ? "💎" : "🌑"}/s`
                )
                .join(" · ")}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-tight line-clamp-1">
          {config.description}
        </p>
        <div className="mt-1">
          <CostLine cost={cost} />
        </div>
      </div>

      {/* Buy button */}
      <Button
        variant="primary"
        size="sm"
        disabled={!canAfford}
        onClick={onBuy}
        className="shrink-0"
      >
        Buy
      </Button>
    </motion.div>
  );
}
