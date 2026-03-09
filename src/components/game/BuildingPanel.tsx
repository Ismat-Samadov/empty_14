"use client";

// Scrollable list of all buildings

import { AnimatePresence } from "framer-motion";
import {
  BUILDINGS,
} from "@/lib/gameConfig";
import {
  getBuildingCost,
  canAfford,
  getBuildingCounts,
  getVisibleBuildings,
} from "@/lib/gameLogic";
import BuildingCard from "./BuildingCard";
import Panel from "@/components/ui/Panel";
import type { SavedGameState, ComputedValues, Resources } from "@/lib/types";

interface BuildingPanelProps {
  state: SavedGameState;
  computed: ComputedValues;
  onBuy: (id: string) => void;
}

export default function BuildingPanel({
  state,
  computed,
  onBuy,
}: BuildingPanelProps) {
  const visibleIds = new Set(getVisibleBuildings(state));
  const counts = getBuildingCounts(state.buildings);

  return (
    <Panel title="Buildings" glowColor="cyan" className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
        <AnimatePresence initial={false}>
          {BUILDINGS.filter((b) => visibleIds.has(b.id)).map((config) => {
            const count = counts[config.id] ?? 0;
            const cost = getBuildingCost(config, count);
            const affordable = canAfford(state.resources, cost);

            // Per-building production contribution (for count owned)
            const mult =
              (computed.buildingMultipliers[config.id] ?? 1) *
              computed.globalMultiplier *
              computed.prestigeMultiplier;

            const production: Partial<Resources> = {};
            if (config.baseProduction.energy && count > 0)
              production.energy = config.baseProduction.energy * count * mult;
            if (config.baseProduction.crystals && count > 0)
              production.crystals =
                config.baseProduction.crystals * count * mult;
            if (config.baseProduction.darkMatter && count > 0)
              production.darkMatter =
                config.baseProduction.darkMatter * count * mult;

            return (
              <BuildingCard
                key={config.id}
                config={config}
                count={count}
                cost={cost}
                canAfford={affordable}
                productionPerSecond={production}
                onBuy={() => onBuy(config.id)}
              />
            );
          })}
        </AnimatePresence>

        {/* Locked hint — next building */}
        {(() => {
          const nextLocked = BUILDINGS.find((b) => !visibleIds.has(b.id));
          if (!nextLocked) return null;
          return (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/3 opacity-40">
              <div className="w-12 h-12 flex items-center justify-center text-2xl bg-white/5 rounded-xl">
                🔒
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400">
                  {nextLocked.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {nextLocked.unlockAt?.buildingId
                    ? `Buy your first ${BUILDINGS.find((b) => b.id === nextLocked.unlockAt?.buildingId)?.name ?? "building"} to unlock`
                    : "Keep playing to unlock"}
                </p>
              </div>
            </div>
          );
        })()}
      </div>
    </Panel>
  );
}
