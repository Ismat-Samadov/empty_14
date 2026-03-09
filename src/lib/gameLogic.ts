// ============================================================
// Pure game logic — no React, no side-effects
// ============================================================

import {
  BUILDINGS,
  UPGRADES,
  ACHIEVEMENTS,
  PRESTIGE_REQUIREMENT,
  SAVE_VERSION,
} from "./gameConfig";
import type {
  SavedGameState,
  ComputedValues,
  Resources,
  BuildingState,
} from "./types";

// --------------- Default state ---------------

export function makeDefaultState(): SavedGameState {
  return {
    resources: { energy: 0, crystals: 0, darkMatter: 0, stardust: 0 },
    buildings: BUILDINGS.map((b) => ({ id: b.id, count: 0 })),
    purchasedUpgrades: [],
    purchasedPrestigeUpgrades: [],
    stats: {
      totalEnergyEarned: 0,
      totalCrystalsEarned: 0,
      totalDarkMatterEarned: 0,
      totalClicks: 0,
      totalPrestiges: 0,
      startTime: Date.now(),
      playTime: 0,
    },
    settings: { soundEnabled: true, notificationsEnabled: true },
    unlockedAchievements: [],
    lastSaveTime: Date.now(),
    version: SAVE_VERSION,
  };
}

// --------------- Cost helpers ---------------

/** Cost of the Nth unit of a building given its base cost and multiplier */
export function getBuildingCost(
  config: { baseCost: Partial<Resources>; costMultiplier: number },
  owned: number
): Partial<Resources> {
  const factor = Math.pow(config.costMultiplier, owned);
  const result: Partial<Resources> = {};
  (Object.keys(config.baseCost) as (keyof Resources)[]).forEach((key) => {
    result[key] = Math.ceil((config.baseCost[key] ?? 0) * factor);
  });
  return result;
}

/** True when the player has enough of every resource required */
export function canAfford(
  resources: Resources,
  cost: Partial<Resources>
): boolean {
  return (Object.keys(cost) as (keyof Resources)[]).every(
    (k) => resources[k] >= (cost[k] ?? 0)
  );
}

/** Returns new resources after subtracting cost (caller must have checked canAfford) */
export function subtractCost(
  resources: Resources,
  cost: Partial<Resources>
): Resources {
  const r = { ...resources };
  (Object.keys(cost) as (keyof Resources)[]).forEach((k) => {
    r[k] = r[k] - (cost[k] ?? 0);
  });
  return r;
}

// --------------- Visibility helpers ---------------

/** Which buildings should be visible in the UI */
export function getVisibleBuildings(state: SavedGameState): string[] {
  const counts = getBuildingCounts(state.buildings);
  return BUILDINGS.filter((b) => {
    if (!b.unlockAt) return true; // always visible
    if (b.unlockAt.buildingId && b.unlockAt.minCount !== undefined) {
      return (counts[b.unlockAt.buildingId] ?? 0) >= b.unlockAt.minCount;
    }
    return true;
  }).map((b) => b.id);
}

/** Which upgrades should be shown as purchaseable */
export function getAvailableUpgrades(state: SavedGameState): string[] {
  const counts = getBuildingCounts(state.buildings);
  const purchased = new Set(state.purchasedUpgrades);

  return UPGRADES.filter((u) => {
    if (purchased.has(u.id)) return false; // already bought

    const { buildingId, minCount, stats, upgrades } = u.unlockAt;

    if (buildingId && minCount !== undefined) {
      if ((counts[buildingId] ?? 0) < minCount) return false;
    }
    if (stats) {
      if (
        stats.totalClicks !== undefined &&
        state.stats.totalClicks < stats.totalClicks
      )
        return false;
      if (
        stats.totalEnergyEarned !== undefined &&
        state.stats.totalEnergyEarned < stats.totalEnergyEarned
      )
        return false;
    }
    if (upgrades) {
      if (!upgrades.every((req) => purchased.has(req))) return false;
    }
    return true;
  }).map((u) => u.id);
}

// --------------- Computed values ---------------

export function computeValues(state: SavedGameState): ComputedValues {
  const purchased = new Set(state.purchasedUpgrades);
  const prestigePurchased = new Set(state.purchasedPrestigeUpgrades);
  const counts = getBuildingCounts(state.buildings);

  // --- Click multiplier ---
  let clickMultiplier = 1;
  if (purchased.has("click_1")) clickMultiplier *= 2;
  if (purchased.has("click_2")) clickMultiplier *= 3;
  if (purchased.has("click_3")) clickMultiplier *= 5;
  if (purchased.has("click_4")) clickMultiplier *= 10;
  if (prestigePurchased.has("prestige_focus")) clickMultiplier *= 2;

  // --- Per-building production multipliers ---
  const buildingMultipliers: Record<string, number> = {};
  for (const b of BUILDINGS) {
    let mult = 1;
    if (purchased.has(`${b.id}_1`)) mult *= 2;
    if (purchased.has(`${b.id}_2`)) mult *= 3;
    if (prestigePurchased.has("prestige_dark")) mult *= 1.5;
    buildingMultipliers[b.id] = mult;
  }

  // --- Global production multiplier (milestone upgrades + prestige) ---
  let globalMultiplier = 1;
  if (purchased.has("milestone_1")) globalMultiplier *= 1.5;
  if (purchased.has("milestone_2")) globalMultiplier *= 2;
  if (purchased.has("milestone_3")) globalMultiplier *= 3;
  if (purchased.has("milestone_4")) globalMultiplier *= 5;
  if (prestigePurchased.has("prestige_quantum")) globalMultiplier *= 3;

  // --- Prestige multiplier: each stardust gives +2% ---
  const prestigeMultiplier = 1 + state.resources.stardust * 0.02;

  // --- Sum building production ---
  let energyPerSecond = 0;
  let crystalsPerSecond = 0;
  let darkMatterPerSecond = 0;

  for (const b of BUILDINGS) {
    const count = counts[b.id] ?? 0;
    if (count === 0) continue;
    const mult =
      buildingMultipliers[b.id] * globalMultiplier * prestigeMultiplier;
    energyPerSecond += (b.baseProduction.energy ?? 0) * count * mult;
    crystalsPerSecond += (b.baseProduction.crystals ?? 0) * count * mult;
    darkMatterPerSecond += (b.baseProduction.darkMatter ?? 0) * count * mult;
  }

  return {
    energyPerClick: 1 * clickMultiplier * prestigeMultiplier,
    energyPerSecond,
    crystalsPerSecond,
    darkMatterPerSecond,
    prestigeMultiplier,
    buildingMultipliers,
    clickMultiplier,
    globalMultiplier,
  };
}

// --------------- Tick ---------------

/**
 * Advance game state by one tick (TICK_RATE ms).
 * dt is in seconds (TICK_RATE / 1000).
 */
export function tick(
  state: SavedGameState,
  computed: ComputedValues,
  dt: number
): SavedGameState {
  const energyGained = computed.energyPerSecond * dt;
  const crystalsGained = computed.crystalsPerSecond * dt;
  const darkMatterGained = computed.darkMatterPerSecond * dt;

  return {
    ...state,
    resources: {
      ...state.resources,
      energy: state.resources.energy + energyGained,
      crystals: state.resources.crystals + crystalsGained,
      darkMatter: state.resources.darkMatter + darkMatterGained,
    },
    stats: {
      ...state.stats,
      totalEnergyEarned: state.stats.totalEnergyEarned + energyGained,
      totalCrystalsEarned: state.stats.totalCrystalsEarned + crystalsGained,
      totalDarkMatterEarned:
        state.stats.totalDarkMatterEarned + darkMatterGained,
    },
  };
}

// --------------- Achievements ---------------

/**
 * Check which achievements are newly unlocked.
 * Returns the IDs of newly unlocked achievements.
 */
export function checkAchievements(
  state: SavedGameState
): string[] {
  const already = new Set(state.unlockedAchievements);
  const counts = getBuildingCounts(state.buildings);
  const totalBuildings = Object.values(counts).reduce((a, b) => a + b, 0);
  const newlyUnlocked: string[] = [];

  const check = (
    id: string,
    condition: boolean
  ) => {
    if (!already.has(id) && condition) newlyUnlocked.push(id);
  };

  check("first_click", state.stats.totalClicks >= 1);
  check("clicks_100", state.stats.totalClicks >= 100);
  check("clicks_1000", state.stats.totalClicks >= 1000);
  check("first_building", totalBuildings >= 1);
  check("buildings_10", totalBuildings >= 10);
  check("buildings_50", totalBuildings >= 50);
  check("buildings_100", totalBuildings >= 100);
  check("energy_1k", state.stats.totalEnergyEarned >= 1000);
  check("energy_1m", state.stats.totalEnergyEarned >= 1_000_000);
  check("energy_1b", state.stats.totalEnergyEarned >= 1_000_000_000);
  check("first_crystal", state.stats.totalCrystalsEarned >= 1);
  check("first_prestige", state.stats.totalPrestiges >= 1);
  check("prestige_5", state.stats.totalPrestiges >= 5);
  check("first_dark_matter", state.stats.totalDarkMatterEarned >= 1);
  check(
    "all_upgrades",
    state.purchasedUpgrades.length === UPGRADES.length
  );

  return newlyUnlocked;
}

// --------------- Prestige ---------------

/** Stardust earned = floor(sqrt(totalEnergyEarned / PRESTIGE_REQUIREMENT)) */
export function calculateStardustGain(totalEnergyEarned: number): number {
  return Math.floor(Math.sqrt(totalEnergyEarned / PRESTIGE_REQUIREMENT));
}

export function canPrestige(state: SavedGameState): boolean {
  return state.stats.totalEnergyEarned >= PRESTIGE_REQUIREMENT;
}

/** Apply prestige: resets most things but keeps stardust, prestige upgrades, achievements */
export function applyPrestige(state: SavedGameState): SavedGameState {
  const gained = calculateStardustGain(state.stats.totalEnergyEarned);
  const prestigePurchased = new Set(state.purchasedPrestigeUpgrades);

  // Determine starting buildings after prestige
  const startingBuildings: BuildingState[] = BUILDINGS.map((b) => ({
    id: b.id,
    count:
      b.id === "solar_panel" && prestigePurchased.has("prestige_memory") ? 5 : 0,
  }));

  return {
    ...makeDefaultState(),
    // Keep stardust (add gained), prestige upgrades, achievements, settings
    resources: {
      energy: 0,
      crystals: 0,
      darkMatter: 0,
      stardust: state.resources.stardust + gained,
    },
    purchasedPrestigeUpgrades: state.purchasedPrestigeUpgrades,
    unlockedAchievements: state.unlockedAchievements,
    settings: state.settings,
    buildings: startingBuildings,
    stats: {
      ...makeDefaultState().stats,
      totalPrestiges: state.stats.totalPrestiges + 1,
      startTime: Date.now(),
    },
    lastSaveTime: Date.now(),
    version: SAVE_VERSION,
  };
}

// --------------- Offline progress ---------------

/**
 * Calculate resources gained while offline, capped at maxHours.
 * Returns an object with the resource deltas to add.
 */
export function calculateOfflineGains(
  computed: ComputedValues,
  offlineMs: number,
  maxHours: number
): Partial<Resources> {
  const maxMs = maxHours * 3600 * 1000;
  const creditedMs = Math.min(offlineMs, maxMs);
  const dt = creditedMs / 1000;

  return {
    energy: computed.energyPerSecond * dt,
    crystals: computed.crystalsPerSecond * dt,
    darkMatter: computed.darkMatterPerSecond * dt,
  };
}

// --------------- Utilities ---------------

/** Map building ID → count owned */
export function getBuildingCounts(
  buildings: BuildingState[]
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const b of buildings) map[b.id] = b.count;
  return map;
}

/** Total number of buildings across all types */
export function getTotalBuildings(buildings: BuildingState[]): number {
  return buildings.reduce((sum, b) => sum + b.count, 0);
}

/** Look up achievement config by ID */
export function getAchievementById(id: string) {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
