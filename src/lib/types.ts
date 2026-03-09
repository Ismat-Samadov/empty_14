// ============================================================
// Core type definitions for Cosmic Idle
// ============================================================

export interface Resources {
  energy: number;
  crystals: number;
  darkMatter: number;
  stardust: number;
}

export interface BuildingState {
  id: string;
  count: number;
}

export interface GameStats {
  totalEnergyEarned: number;
  totalCrystalsEarned: number;
  totalDarkMatterEarned: number;
  totalClicks: number;
  totalPrestiges: number;
  startTime: number;
  playTime: number; // milliseconds of active play
}

export interface GameSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

// What gets serialized to localStorage
export interface SavedGameState {
  resources: Resources;
  buildings: BuildingState[];
  purchasedUpgrades: string[];
  purchasedPrestigeUpgrades: string[];
  stats: GameStats;
  settings: GameSettings;
  unlockedAchievements: string[];
  lastSaveTime: number;
  version: string;
}

// Static config for each building type
export interface BuildingConfig {
  id: string;
  name: string;
  description: string;
  flavor: string;
  icon: string;
  baseCost: Partial<Resources>;
  baseProduction: Partial<Resources>; // per second
  costMultiplier: number; // applied each purchase
  unlockAt: {
    buildingId?: string; // requires owning ≥1 of this building
    minCount?: number;
  } | null;
}

// Static config for a one-time purchaseable upgrade
export interface UpgradeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: Partial<Resources>;
  unlockAt: {
    buildingId?: string;
    minCount?: number;
    stats?: Partial<GameStats>;
    upgrades?: string[]; // prerequisite upgrade IDs
  };
}

// Static config for a prestige upgrade (costs stardust, persists across resets)
export interface PrestigeUpgradeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  costStardust: number;
}

// Static config for an achievement
export interface AchievementConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Values derived/computed from game state — recalculated each render
export interface ComputedValues {
  energyPerClick: number;
  energyPerSecond: number;
  crystalsPerSecond: number;
  darkMatterPerSecond: number;
  prestigeMultiplier: number; // 1 + stardust * 0.02
  buildingMultipliers: Record<string, number>;
  clickMultiplier: number;
  globalMultiplier: number; // from milestone upgrades + prestige upgrade
}
