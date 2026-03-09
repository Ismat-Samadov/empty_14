// ============================================================
// All static game data: buildings, upgrades, achievements
// ============================================================

import type {
  BuildingConfig,
  UpgradeConfig,
  PrestigeUpgradeConfig,
  AchievementConfig,
} from "./types";

// --------------- BUILDINGS ---------------
export const BUILDINGS: BuildingConfig[] = [
  {
    id: "solar_panel",
    name: "Solar Panel",
    description: "Harnesses stellar radiation from nearby stars.",
    flavor: "The cheapest way to start your energy empire.",
    icon: "🌟",
    baseCost: { energy: 15 },
    baseProduction: { energy: 0.1 },
    costMultiplier: 1.15,
    unlockAt: null, // visible from the start
  },
  {
    id: "energy_core",
    name: "Energy Core",
    description: "Concentrates ambient energy into usable power.",
    flavor: '"The core of any great civilization."',
    icon: "⚡",
    baseCost: { energy: 100 },
    baseProduction: { energy: 0.5 },
    costMultiplier: 1.15,
    unlockAt: { buildingId: "solar_panel", minCount: 1 },
  },
  {
    id: "plasma_generator",
    name: "Plasma Generator",
    description: "Superheats matter into plasma to extract energy.",
    flavor: "Hot enough to melt the resolve of your enemies.",
    icon: "🔥",
    baseCost: { energy: 1100 },
    baseProduction: { energy: 4 },
    costMultiplier: 1.15,
    unlockAt: { buildingId: "energy_core", minCount: 1 },
  },
  {
    id: "quantum_reactor",
    name: "Quantum Reactor",
    description: "Splits quantum states to release enormous energy.",
    flavor: "It exists in all states simultaneously. Even profitable.",
    icon: "⚛️",
    baseCost: { energy: 12000 },
    baseProduction: { energy: 20 },
    costMultiplier: 1.15,
    unlockAt: { buildingId: "plasma_generator", minCount: 1 },
  },
  {
    id: "void_harvester",
    name: "Void Harvester",
    description: "Taps into the zero-point energy of the vacuum.",
    flavor: "Harvesting from nothing. Maximum efficiency.",
    icon: "🌀",
    baseCost: { energy: 130000 },
    baseProduction: { energy: 100 },
    costMultiplier: 1.15,
    unlockAt: { buildingId: "quantum_reactor", minCount: 1 },
  },
  {
    id: "crystal_matrix",
    name: "Crystal Matrix",
    description: "Grows energy crystals from the cosmic substrate.",
    flavor: "They sing at frequencies only machines can hear.",
    icon: "💎",
    baseCost: { energy: 1400000 },
    baseProduction: { energy: 640, crystals: 0.1 },
    costMultiplier: 1.15,
    unlockAt: { buildingId: "void_harvester", minCount: 1 },
  },
  {
    id: "singularity_engine",
    name: "Singularity Engine",
    description: "Feeds off a miniature contained black hole.",
    flavor: "Technically not a violation of physics. Technically.",
    icon: "🌌",
    baseCost: { energy: 20000000, crystals: 50 },
    baseProduction: { energy: 5000, crystals: 1 },
    costMultiplier: 1.15,
    unlockAt: { buildingId: "crystal_matrix", minCount: 1 },
  },
  {
    id: "dyson_sphere",
    name: "Dyson Sphere",
    description: "Envelops an entire star to harvest all its output.",
    flavor: "The final achievement of a Type II civilization.",
    icon: "☀️",
    baseCost: { energy: 300000000, crystals: 500 },
    baseProduction: { energy: 50000, crystals: 10, darkMatter: 0.01 },
    costMultiplier: 1.15,
    unlockAt: { buildingId: "singularity_engine", minCount: 1 },
  },
];

// --------------- UPGRADES ---------------
export const UPGRADES: UpgradeConfig[] = [
  // --- Click power upgrades ---
  {
    id: "click_1",
    name: "Focused Beam",
    description: "Your clicks produce 2× more energy.",
    icon: "👆",
    cost: { energy: 100 },
    unlockAt: { stats: { totalClicks: 10 } },
  },
  {
    id: "click_2",
    name: "Overcharged Strike",
    description: "Your clicks produce 3× more energy.",
    icon: "✊",
    cost: { energy: 5000 },
    unlockAt: { stats: { totalClicks: 100 }, upgrades: ["click_1"] },
  },
  {
    id: "click_3",
    name: "Plasma Punch",
    description: "Your clicks produce 5× more energy.",
    icon: "🤜",
    cost: { energy: 100000 },
    unlockAt: { stats: { totalClicks: 1000 }, upgrades: ["click_2"] },
  },
  {
    id: "click_4",
    name: "Quantum Tap",
    description: "Your clicks produce 10× more energy.",
    icon: "⚡",
    cost: { energy: 5000000 },
    unlockAt: { stats: { totalClicks: 10000 }, upgrades: ["click_3"] },
  },

  // --- Solar Panel upgrades ---
  {
    id: "solar_panel_1",
    name: "Improved Photovoltaics",
    description: "Solar Panels produce 2× more energy.",
    icon: "🌟",
    cost: { energy: 200 },
    unlockAt: { buildingId: "solar_panel", minCount: 10 },
  },
  {
    id: "solar_panel_2",
    name: "Quantum Solar Cells",
    description: "Solar Panels produce 3× more energy.",
    icon: "🌟",
    cost: { energy: 10000 },
    unlockAt: { buildingId: "solar_panel", minCount: 25 },
  },

  // --- Energy Core upgrades ---
  {
    id: "energy_core_1",
    name: "Superconductive Coils",
    description: "Energy Cores produce 2× more energy.",
    icon: "⚡",
    cost: { energy: 1000 },
    unlockAt: { buildingId: "energy_core", minCount: 10 },
  },
  {
    id: "energy_core_2",
    name: "Plasma-Enhanced Core",
    description: "Energy Cores produce 3× more energy.",
    icon: "⚡",
    cost: { energy: 50000 },
    unlockAt: { buildingId: "energy_core", minCount: 25 },
  },

  // --- Plasma Generator upgrades ---
  {
    id: "plasma_generator_1",
    name: "Magnetic Containment",
    description: "Plasma Generators produce 2× more energy.",
    icon: "🔥",
    cost: { energy: 11000 },
    unlockAt: { buildingId: "plasma_generator", minCount: 10 },
  },
  {
    id: "plasma_generator_2",
    name: "Antimatter Injection",
    description: "Plasma Generators produce 3× more energy.",
    icon: "🔥",
    cost: { energy: 500000 },
    unlockAt: { buildingId: "plasma_generator", minCount: 25 },
  },

  // --- Quantum Reactor upgrades ---
  {
    id: "quantum_reactor_1",
    name: "Wave Function Collapse",
    description: "Quantum Reactors produce 2× more energy.",
    icon: "⚛️",
    cost: { energy: 120000 },
    unlockAt: { buildingId: "quantum_reactor", minCount: 10 },
  },
  {
    id: "quantum_reactor_2",
    name: "Entanglement Array",
    description: "Quantum Reactors produce 3× more energy.",
    icon: "⚛️",
    cost: { energy: 5000000 },
    unlockAt: { buildingId: "quantum_reactor", minCount: 25 },
  },

  // --- Void Harvester upgrades ---
  {
    id: "void_harvester_1",
    name: "Vacuum Resonance",
    description: "Void Harvesters produce 2× more energy.",
    icon: "🌀",
    cost: { energy: 1300000 },
    unlockAt: { buildingId: "void_harvester", minCount: 10 },
  },
  {
    id: "void_harvester_2",
    name: "Dark Energy Tap",
    description: "Void Harvesters produce 3× more energy.",
    icon: "🌀",
    cost: { energy: 50000000 },
    unlockAt: { buildingId: "void_harvester", minCount: 25 },
  },

  // --- Crystal Matrix upgrades ---
  {
    id: "crystal_matrix_1",
    name: "Crystalline Lattice",
    description: "Crystal Matrices produce 2× more.",
    icon: "💎",
    cost: { energy: 14000000 },
    unlockAt: { buildingId: "crystal_matrix", minCount: 10 },
  },
  {
    id: "crystal_matrix_2",
    name: "Harmonic Resonance",
    description: "Crystal Matrices produce 3× more.",
    icon: "💎",
    cost: { energy: 500000000 },
    unlockAt: { buildingId: "crystal_matrix", minCount: 25 },
  },

  // --- Singularity Engine upgrades ---
  {
    id: "singularity_engine_1",
    name: "Event Horizon Tap",
    description: "Singularity Engines produce 2× more.",
    icon: "🌌",
    cost: { energy: 200000000, crystals: 100 },
    unlockAt: { buildingId: "singularity_engine", minCount: 10 },
  },
  {
    id: "singularity_engine_2",
    name: "Hawking Radiation Capture",
    description: "Singularity Engines produce 3× more.",
    icon: "🌌",
    cost: { energy: 5000000000, crystals: 500 },
    unlockAt: { buildingId: "singularity_engine", minCount: 25 },
  },

  // --- Dyson Sphere upgrades ---
  {
    id: "dyson_sphere_1",
    name: "Stellar Efficiency",
    description: "Dyson Spheres produce 2× more.",
    icon: "☀️",
    cost: { energy: 3000000000, crystals: 2000 },
    unlockAt: { buildingId: "dyson_sphere", minCount: 10 },
  },
  {
    id: "dyson_sphere_2",
    name: "Galactic Harvest",
    description: "Dyson Spheres produce 3× more.",
    icon: "☀️",
    cost: { energy: 100000000000, crystals: 10000 },
    unlockAt: { buildingId: "dyson_sphere", minCount: 25 },
  },

  // --- Milestone upgrades (unlock when total energy earned passes threshold) ---
  {
    id: "milestone_1",
    name: "Star Collector",
    description: "All production ×1.5 (milestone: 1K energy earned).",
    icon: "✨",
    cost: { energy: 1000 },
    unlockAt: { stats: { totalEnergyEarned: 1000 } },
  },
  {
    id: "milestone_2",
    name: "Galactic Pioneer",
    description: "All production ×2 (milestone: 1M energy earned).",
    icon: "🚀",
    cost: { energy: 1000000 },
    unlockAt: { stats: { totalEnergyEarned: 1000000 } },
  },
  {
    id: "milestone_3",
    name: "Universe Builder",
    description: "All production ×3 (milestone: 1B energy earned).",
    icon: "🌍",
    cost: { energy: 1000000000 },
    unlockAt: { stats: { totalEnergyEarned: 1000000000 } },
  },
  {
    id: "milestone_4",
    name: "Cosmic God",
    description: "All production ×5 (milestone: 1T energy earned).",
    icon: "👑",
    cost: { energy: 1000000000000 },
    unlockAt: { stats: { totalEnergyEarned: 1000000000000 } },
  },
];

// --------------- PRESTIGE UPGRADES ---------------
export const PRESTIGE_UPGRADES: PrestigeUpgradeConfig[] = [
  {
    id: "prestige_memory",
    name: "Cosmic Memory",
    description: "Start with 5 Solar Panels after each prestige.",
    icon: "🧠",
    costStardust: 5,
  },
  {
    id: "prestige_focus",
    name: "Stellar Focus",
    description: "Click power permanently doubled.",
    icon: "🎯",
    costStardust: 15,
  },
  {
    id: "prestige_dark",
    name: "Dark Efficiency",
    description: "All buildings produce 50% more energy.",
    icon: "🌑",
    costStardust: 30,
  },
  {
    id: "prestige_time",
    name: "Time Dilation",
    description: "Offline progress extended to 8 hours.",
    icon: "⏳",
    costStardust: 75,
  },
  {
    id: "prestige_quantum",
    name: "Quantum Resonance",
    description: "All production multiplied by 3.",
    icon: "🔮",
    costStardust: 200,
  },
];

// --------------- ACHIEVEMENTS ---------------
export const ACHIEVEMENTS: AchievementConfig[] = [
  {
    id: "first_click",
    name: "First Spark",
    description: "Click for the first time.",
    icon: "⚡",
  },
  {
    id: "clicks_100",
    name: "Button Masher",
    description: "Click 100 times.",
    icon: "👆",
  },
  {
    id: "clicks_1000",
    name: "Clicker",
    description: "Click 1,000 times.",
    icon: "✊",
  },
  {
    id: "first_building",
    name: "Solar Pioneer",
    description: "Buy your first building.",
    icon: "🏗️",
  },
  {
    id: "buildings_10",
    name: "Small Farm",
    description: "Own 10 total buildings.",
    icon: "🌱",
  },
  {
    id: "buildings_50",
    name: "Power Plant",
    description: "Own 50 total buildings.",
    icon: "🏭",
  },
  {
    id: "buildings_100",
    name: "Energy Empire",
    description: "Own 100 total buildings.",
    icon: "🌆",
  },
  {
    id: "energy_1k",
    name: "Spark of Life",
    description: "Earn 1,000 total energy.",
    icon: "✨",
  },
  {
    id: "energy_1m",
    name: "Megawatt",
    description: "Earn 1,000,000 total energy.",
    icon: "⚡",
  },
  {
    id: "energy_1b",
    name: "Gigawatt",
    description: "Earn 1,000,000,000 total energy.",
    icon: "🌟",
  },
  {
    id: "first_crystal",
    name: "Crystal Clear",
    description: "Earn your first crystal.",
    icon: "💎",
  },
  {
    id: "first_prestige",
    name: "Rebirth",
    description: "Prestige for the first time.",
    icon: "🔄",
  },
  {
    id: "prestige_5",
    name: "Cycle of Stars",
    description: "Prestige 5 times.",
    icon: "⭐",
  },
  {
    id: "first_dark_matter",
    name: "Dark Arts",
    description: "Earn your first dark matter.",
    icon: "🌑",
  },
  {
    id: "all_upgrades",
    name: "Completionist",
    description: "Purchase all regular upgrades.",
    icon: "🏆",
  },
];

// --------------- CONSTANTS ---------------
/** Minimum total energy earned before prestige is unlocked */
export const PRESTIGE_REQUIREMENT = 1_000_000;

/** Milliseconds per game tick */
export const TICK_RATE = 100;

/** Save every N ticks (100ms * 50 = 5 seconds) */
export const SAVE_INTERVAL_TICKS = 50;

/** Maximum offline hours that are credited on return */
export const MAX_OFFLINE_HOURS = 4;

export const SAVE_KEY = "cosmic_idle_v1";
export const SAVE_VERSION = "1.0.0";
