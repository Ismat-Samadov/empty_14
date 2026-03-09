"use client";

// Tabbed panel: Upgrades / Prestige / Stats

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  UPGRADES,
  PRESTIGE_UPGRADES,
} from "@/lib/gameConfig";
import { canAfford, getAvailableUpgrades, canPrestige } from "@/lib/gameLogic";
import { UpgradeCard, PrestigeUpgradeCard } from "./UpgradeCard";
import StatsPanel from "./StatsPanel";
import Panel from "@/components/ui/Panel";
import Button from "@/components/ui/Button";
import type { SavedGameState, ComputedValues } from "@/lib/types";
import { formatNumber } from "@/lib/formatters";

type RightTab = "upgrades" | "prestige" | "stats";

interface UpgradePanelProps {
  state: SavedGameState;
  computed: ComputedValues;
  pendingStardust: number;
  onBuyUpgrade: (id: string) => void;
  onBuyPrestigeUpgrade: (id: string) => void;
  onOpenPrestigeModal: () => void;
}

export default function UpgradePanel({
  state,
  computed,
  pendingStardust,
  onBuyUpgrade,
  onBuyPrestigeUpgrade,
  onOpenPrestigeModal,
}: UpgradePanelProps) {
  const [tab, setTab] = useState<RightTab>("upgrades");

  const availableUpgradeIds = new Set(getAvailableUpgrades(state));
  const availableUpgrades = UPGRADES.filter((u) =>
    availableUpgradeIds.has(u.id)
  );

  const prestigeReady = canPrestige(state);

  return (
    <Panel className="h-full flex flex-col" glowColor="purple">
      {/* Tab bar */}
      <div className="flex border-b border-white/10 shrink-0">
        {(["upgrades", "prestige", "stats"] as RightTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`
              flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-all duration-150 capitalize
              ${
                tab === t
                  ? "text-purple-300 border-b-2 border-purple-400"
                  : "text-slate-500 hover:text-slate-300"
              }
            `}
          >
            {t}
            {t === "upgrades" && availableUpgrades.length > 0 && (
              <span className="ml-1.5 bg-purple-500 text-white text-[9px] rounded-full px-1.5 py-0.5">
                {availableUpgrades.length}
              </span>
            )}
            {t === "prestige" && prestigeReady && (
              <span className="ml-1.5 text-yellow-400">★</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {tab === "upgrades" && (
            <motion.div
              key="upgrades"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-y-auto p-3 space-y-2 scrollbar-thin"
            >
              {availableUpgrades.length === 0 ? (
                <p className="text-center text-slate-500 text-sm mt-8">
                  No upgrades available yet.
                  <br />
                  Keep clicking and building!
                </p>
              ) : (
                availableUpgrades.map((u) => (
                  <UpgradeCard
                    key={u.id}
                    config={u}
                    canAfford={canAfford(state.resources, u.cost)}
                    onBuy={() => onBuyUpgrade(u.id)}
                  />
                ))
              )}
            </motion.div>
          )}

          {tab === "prestige" && (
            <motion.div
              key="prestige"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-y-auto p-3 space-y-3 scrollbar-thin"
            >
              {/* Prestige action card */}
              <div
                className={`p-4 rounded-xl border ${
                  prestigeReady
                    ? "border-yellow-400/40 bg-yellow-500/10"
                    : "border-white/10 bg-white/3 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <p className="font-bold text-yellow-200">Prestige Reset</p>
                    <p className="text-[11px] text-slate-400">
                      Reset progress, gain{" "}
                      <span className="text-yellow-300 font-semibold">
                        ✨ {pendingStardust}
                      </span>{" "}
                      stardust
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Requires 1M total energy earned.{" "}
                  {!prestigeReady && (
                    <span className="text-slate-500">
                      Need{" "}
                      {formatNumber(
                        1_000_000 - state.stats.totalEnergyEarned
                      )}{" "}
                      more.
                    </span>
                  )}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!prestigeReady}
                  onClick={onOpenPrestigeModal}
                  className={
                    prestigeReady
                      ? "border-yellow-400/50 text-yellow-300 hover:bg-yellow-500/20 w-full"
                      : "w-full"
                  }
                >
                  Prestige Now
                </Button>
              </div>

              {/* Prestige upgrades */}
              <p className="text-[11px] uppercase tracking-widest text-slate-500 px-1">
                Prestige Upgrades
              </p>
              {PRESTIGE_UPGRADES.map((pu) => (
                <PrestigeUpgradeCard
                  key={pu.id}
                  config={pu}
                  stardust={state.resources.stardust}
                  purchased={state.purchasedPrestigeUpgrades.includes(pu.id)}
                  onBuy={() => onBuyPrestigeUpgrade(pu.id)}
                />
              ))}
            </motion.div>
          )}

          {tab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-y-auto scrollbar-thin"
            >
              <StatsPanel state={state} computed={computed} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Panel>
  );
}
