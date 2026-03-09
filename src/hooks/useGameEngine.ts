"use client";

// ============================================================
// Core game engine: state management, game loop, actions
// ============================================================

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  BUILDINGS,
  UPGRADES,
  PRESTIGE_UPGRADES,
  TICK_RATE,
  SAVE_INTERVAL_TICKS,
  MAX_OFFLINE_HOURS,
  SAVE_KEY,
} from "@/lib/gameConfig";
import {
  makeDefaultState,
  computeValues,
  tick,
  checkAchievements,
  canPrestige,
  applyPrestige,
  calculateStardustGain,
  calculateOfflineGains,
  getBuildingCost,
  canAfford,
  subtractCost,
  getBuildingCounts,
} from "@/lib/gameLogic";
import type { SavedGameState, ComputedValues } from "@/lib/types";
import { useSound } from "./useSound";

export type ActiveTab = "click" | "build" | "upgrades" | "stats";

// --------------- localStorage helpers ---------------

function loadSave(): SavedGameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedGameState;
  } catch {
    return null;
  }
}

function writeSave(state: SavedGameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

// --------------- Hook ---------------

export function useGameEngine() {
  // --- Mutable ref holds current state (no stale closure in interval) ---
  const stateRef = useRef<SavedGameState>(makeDefaultState());

  // --- React state for rendering ---
  const [displayState, setDisplayState] = useState<SavedGameState>(() =>
    makeDefaultState()
  );

  // --- UI state ---
  const [activeTab, setActiveTab] = useState<ActiveTab>("click");
  const [showPrestigeModal, setShowPrestigeModal] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineGains, setOfflineGains] = useState<{
    energy: number;
    crystals: number;
    darkMatter: number;
    offlineMs: number;
  } | null>(null);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  const tickCount = useRef(0);

  // --- Computed values (memoized from display state) ---
  const computed: ComputedValues = useMemo(
    () => computeValues(displayState),
    [displayState]
  );

  // Sound (always call hook; check settings inside)
  const sound = useSound(displayState.settings.soundEnabled);

  // --------------- Mount: load save + offline progress ---------------
  useEffect(() => {
    const saved = loadSave();
    if (saved) {
      // Calculate offline time
      const now = Date.now();
      const offlineMs = now - saved.lastSaveTime;

      // Restore save
      stateRef.current = { ...saved, lastSaveTime: now };

      // Apply offline gains if player was away > 30 seconds
      if (offlineMs > 30_000) {
        const comp = computeValues(saved);
        const maxHours = saved.purchasedPrestigeUpgrades.includes(
          "prestige_time"
        )
          ? 8
          : MAX_OFFLINE_HOURS;
        const gains = calculateOfflineGains(comp, offlineMs, maxHours);

        stateRef.current = {
          ...stateRef.current,
          resources: {
            ...stateRef.current.resources,
            energy:
              stateRef.current.resources.energy + (gains.energy ?? 0),
            crystals:
              stateRef.current.resources.crystals + (gains.crystals ?? 0),
            darkMatter:
              stateRef.current.resources.darkMatter +
              (gains.darkMatter ?? 0),
          },
          stats: {
            ...stateRef.current.stats,
            totalEnergyEarned:
              stateRef.current.stats.totalEnergyEarned + (gains.energy ?? 0),
            totalCrystalsEarned:
              stateRef.current.stats.totalCrystalsEarned +
              (gains.crystals ?? 0),
            totalDarkMatterEarned:
              stateRef.current.stats.totalDarkMatterEarned +
              (gains.darkMatter ?? 0),
          },
        };

        setOfflineGains({
          energy: gains.energy ?? 0,
          crystals: gains.crystals ?? 0,
          darkMatter: gains.darkMatter ?? 0,
          offlineMs,
        });
        setShowOfflineModal(true);
      }

      setDisplayState({ ...stateRef.current });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------- Game loop ---------------
  useEffect(() => {
    const interval = setInterval(() => {
      const dt = TICK_RATE / 1000; // seconds
      const comp = computeValues(stateRef.current);

      // Advance production
      let next = tick(stateRef.current, comp, dt);

      // Increment play time
      next = {
        ...next,
        stats: { ...next.stats, playTime: next.stats.playTime + TICK_RATE },
      };

      // Check achievements
      const newlyUnlocked = checkAchievements(next);
      if (newlyUnlocked.length > 0) {
        next = {
          ...next,
          unlockedAchievements: [
            ...next.unlockedAchievements,
            ...newlyUnlocked,
          ],
        };
        if (next.settings.notificationsEnabled) {
          setNewAchievements((prev) => [...prev, ...newlyUnlocked]);
        }
      }

      stateRef.current = next;

      // Auto-save every SAVE_INTERVAL_TICKS ticks
      tickCount.current += 1;
      if (tickCount.current % SAVE_INTERVAL_TICKS === 0) {
        const toSave = { ...next, lastSaveTime: Date.now() };
        stateRef.current = toSave;
        writeSave(toSave);
      }

      // Push to React state for re-render
      setDisplayState({ ...stateRef.current });
    }, TICK_RATE);

    return () => clearInterval(interval);
  }, []); // runs once; accesses state via ref

  // --------------- Actions ---------------

  const click = useCallback(() => {
    const comp = computeValues(stateRef.current);
    const gained = comp.energyPerClick;
    // Haptic feedback on mobile
    if (navigator.vibrate) navigator.vibrate(15);
    sound.playClick();

    stateRef.current = {
      ...stateRef.current,
      resources: {
        ...stateRef.current.resources,
        energy: stateRef.current.resources.energy + gained,
      },
      stats: {
        ...stateRef.current.stats,
        totalClicks: stateRef.current.stats.totalClicks + 1,
        totalEnergyEarned:
          stateRef.current.stats.totalEnergyEarned + gained,
      },
    };
    setDisplayState({ ...stateRef.current });
  }, [sound]);

  const buyBuilding = useCallback(
    (id: string) => {
      const config = BUILDINGS.find((b) => b.id === id);
      if (!config) return;

      const s = stateRef.current;
      const owned = getBuildingCounts(s.buildings)[id] ?? 0;
      const cost = getBuildingCost(config, owned);

      if (!canAfford(s.resources, cost)) return;

      sound.playPurchase();

      const newResources = subtractCost(s.resources, cost);
      const newBuildings = s.buildings.map((b) =>
        b.id === id ? { ...b, count: b.count + 1 } : b
      );

      stateRef.current = {
        ...s,
        resources: newResources,
        buildings: newBuildings,
      };
      setDisplayState({ ...stateRef.current });
    },
    [sound]
  );

  const buyUpgrade = useCallback(
    (id: string) => {
      const config = UPGRADES.find((u) => u.id === id);
      if (!config) return;

      const s = stateRef.current;
      if (s.purchasedUpgrades.includes(id)) return;
      if (!canAfford(s.resources, config.cost)) return;

      sound.playPurchase();

      stateRef.current = {
        ...s,
        resources: subtractCost(s.resources, config.cost),
        purchasedUpgrades: [...s.purchasedUpgrades, id],
      };
      setDisplayState({ ...stateRef.current });
    },
    [sound]
  );

  const buyPrestigeUpgrade = useCallback(
    (id: string) => {
      const config = PRESTIGE_UPGRADES.find((u) => u.id === id);
      if (!config) return;

      const s = stateRef.current;
      if (s.purchasedPrestigeUpgrades.includes(id)) return;
      if (s.resources.stardust < config.costStardust) return;

      sound.playPurchase();

      stateRef.current = {
        ...s,
        resources: {
          ...s.resources,
          stardust: s.resources.stardust - config.costStardust,
        },
        purchasedPrestigeUpgrades: [...s.purchasedPrestigeUpgrades, id],
      };
      setDisplayState({ ...stateRef.current });
    },
    [sound]
  );

  const prestige = useCallback(() => {
    if (!canPrestige(stateRef.current)) return;
    sound.playPrestige();
    const next = applyPrestige(stateRef.current);
    stateRef.current = next;
    writeSave(next);
    setDisplayState({ ...next });
    setShowPrestigeModal(false);
  }, [sound]);

  const toggleSound = useCallback(() => {
    stateRef.current = {
      ...stateRef.current,
      settings: {
        ...stateRef.current.settings,
        soundEnabled: !stateRef.current.settings.soundEnabled,
      },
    };
    setDisplayState({ ...stateRef.current });
  }, []);

  const toggleNotifications = useCallback(() => {
    stateRef.current = {
      ...stateRef.current,
      settings: {
        ...stateRef.current.settings,
        notificationsEnabled: !stateRef.current.settings.notificationsEnabled,
      },
    };
    setDisplayState({ ...stateRef.current });
  }, []);

  const dismissOfflineModal = useCallback(() => {
    setShowOfflineModal(false);
  }, []);

  const dismissAchievement = useCallback((id: string) => {
    setNewAchievements((prev) => prev.filter((a) => a !== id));
  }, []);

  const hardReset = useCallback(() => {
    const fresh = makeDefaultState();
    stateRef.current = fresh;
    localStorage.removeItem(SAVE_KEY);
    setDisplayState({ ...fresh });
    setShowPrestigeModal(false);
  }, []);

  // Derived helper: stardust that would be gained from prestige now
  const pendingStardust = calculateStardustGain(
    displayState.stats.totalEnergyEarned
  );

  return {
    state: displayState,
    computed,
    pendingStardust,
    actions: {
      click,
      buyBuilding,
      buyUpgrade,
      buyPrestigeUpgrade,
      prestige,
      toggleSound,
      toggleNotifications,
      dismissOfflineModal,
      hardReset,
    },
    ui: {
      activeTab,
      setActiveTab,
      showPrestigeModal,
      setShowPrestigeModal,
      showOfflineModal,
      offlineGains,
      newAchievements,
      dismissAchievement,
    },
  };
}
