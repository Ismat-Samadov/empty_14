"use client";

// Statistics display

import { ACHIEVEMENTS } from "@/lib/gameConfig";
import { formatNumber, formatRate, formatTime, } from "@/lib/formatters";
import { getTotalBuildings } from "@/lib/gameLogic";
import ProgressBar from "@/components/ui/ProgressBar";
import type { SavedGameState, ComputedValues } from "@/lib/types";

interface StatsPanelProps {
  state: SavedGameState;
  computed: ComputedValues;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-xs font-semibold text-white tabular-nums">
        {value}
      </span>
    </div>
  );
}

export default function StatsPanel({ state, computed }: StatsPanelProps) {
  const totalBuildings = getTotalBuildings(state.buildings);
  const achievementsUnlocked = state.unlockedAchievements.length;
  const achievementsTotal = ACHIEVEMENTS.length;

  return (
    <div className="p-4 space-y-4">
      {/* Production */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">
          Production
        </p>
        <StatRow
          label="Energy per click"
          value={formatNumber(computed.energyPerClick)}
        />
        <StatRow
          label="Energy per second"
          value={formatRate(computed.energyPerSecond)}
        />
        {computed.crystalsPerSecond > 0 && (
          <StatRow
            label="Crystals per second"
            value={formatRate(computed.crystalsPerSecond)}
          />
        )}
        {computed.darkMatterPerSecond > 0 && (
          <StatRow
            label="Dark Matter per second"
            value={formatRate(computed.darkMatterPerSecond)}
          />
        )}
        <StatRow
          label="Prestige multiplier"
          value={`×${computed.prestigeMultiplier.toFixed(2)}`}
        />
        <StatRow
          label="Global multiplier"
          value={`×${computed.globalMultiplier.toFixed(1)}`}
        />
      </div>

      {/* Lifetime */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">
          Lifetime
        </p>
        <StatRow
          label="Total energy earned"
          value={formatNumber(state.stats.totalEnergyEarned)}
        />
        {state.stats.totalCrystalsEarned > 0 && (
          <StatRow
            label="Total crystals earned"
            value={formatNumber(state.stats.totalCrystalsEarned)}
          />
        )}
        <StatRow
          label="Total clicks"
          value={formatNumber(state.stats.totalClicks)}
        />
        <StatRow
          label="Buildings owned"
          value={String(totalBuildings)}
        />
        <StatRow
          label="Prestiges"
          value={String(state.stats.totalPrestiges)}
        />
        <StatRow
          label="Play time"
          value={formatTime(state.stats.playTime)}
        />
      </div>

      {/* Achievements */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">
          Achievements ({achievementsUnlocked}/{achievementsTotal})
        </p>
        <ProgressBar
          value={(achievementsUnlocked / achievementsTotal) * 100}
          color="purple"
          className="mb-3"
        />
        <div className="grid grid-cols-3 gap-2">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = state.unlockedAchievements.includes(a.id);
            return (
              <div
                key={a.id}
                title={`${a.name}: ${a.description}`}
                className={`
                  flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all
                  ${
                    unlocked
                      ? "border-purple-500/30 bg-purple-500/10"
                      : "border-white/5 bg-white/3 opacity-30"
                  }
                `}
              >
                <span className="text-xl">{a.icon}</span>
                <span className="text-[10px] font-medium text-slate-300 leading-tight">
                  {a.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
