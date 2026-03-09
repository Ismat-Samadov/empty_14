"use client";

// ============================================================
// Main game page — orchestrates all panels and modals
// ============================================================

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGameEngine } from "@/hooks/useGameEngine";
import { getAvailableUpgrades } from "@/lib/gameLogic";

import ResourceBar from "@/components/game/ResourceBar";
import ClickOrb from "@/components/game/ClickOrb";
import BuildingPanel from "@/components/game/BuildingPanel";
import UpgradePanel from "@/components/game/UpgradePanel";
import PrestigeModal from "@/components/game/PrestigeModal";
import OfflineModal from "@/components/game/OfflineModal";
import AchievementToast from "@/components/game/AchievementToast";
import SettingsModal from "@/components/game/SettingsModal";
import MobileNav from "@/components/game/MobileNav";

export default function GamePage() {
  const { state, computed, pendingStardust, actions, ui } = useGameEngine();
  const [showSettings, setShowSettings] = useState(false);

  const availableUpgradeCount = getAvailableUpgrades(state).length;

  // ---- Click area (center column) ----
  const clickArea = (
    <div className="flex flex-col h-full">
      {/* Resource bar */}
      <ResourceBar resources={state.resources} computed={computed} />

      {/* Orb centered */}
      <div className="flex-1 flex items-center justify-center p-4">
        <ClickOrb
          onClickOrb={actions.click}
          energyPerClick={computed.energyPerClick}
          energyPerSecond={computed.energyPerSecond}
        />
      </div>
    </div>
  );

  // ---- Mobile: single-tab layout ----
  const mobilePanelContent = () => {
    switch (ui.activeTab) {
      case "click":
        return clickArea;
      case "build":
        return (
          <div className="h-full p-2">
            <BuildingPanel
              state={state}
              computed={computed}
              onBuy={actions.buyBuilding}
            />
          </div>
        );
      case "upgrades":
      case "stats":
        return (
          <div className="h-full p-2">
            <UpgradePanel
              state={state}
              computed={computed}
              pendingStardust={pendingStardust}
              onBuyUpgrade={actions.buyUpgrade}
              onBuyPrestigeUpgrade={actions.buyPrestigeUpgrade}
              onOpenPrestigeModal={() => ui.setShowPrestigeModal(true)}
            />
          </div>
        );
    }
  };

  return (
    <div className="relative h-full flex flex-col overflow-hidden bg-slate-950">
      {/* ---- Header bar ---- */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-950/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌌</span>
          <span className="font-bold text-white tracking-tight">
            Cosmic Idle
          </span>
          <span className="hidden sm:block text-xs text-slate-500">
            · Energy Empire
          </span>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
          aria-label="Settings"
        >
          ⚙️
        </button>
      </header>

      {/* ---- Desktop 3-column layout (lg+) ---- */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_320px_320px] flex-1 min-h-0 relative z-10">
        {/* Left: click area */}
        <div className="flex flex-col min-h-0 border-r border-white/10">
          {clickArea}
        </div>

        {/* Middle: buildings */}
        <div className="min-h-0 p-3 border-r border-white/10">
          <BuildingPanel
            state={state}
            computed={computed}
            onBuy={actions.buyBuilding}
          />
        </div>

        {/* Right: upgrades / prestige / stats */}
        <div className="min-h-0 p-3">
          <UpgradePanel
            state={state}
            computed={computed}
            pendingStardust={pendingStardust}
            onBuyUpgrade={actions.buyUpgrade}
            onBuyPrestigeUpgrade={actions.buyPrestigeUpgrade}
            onOpenPrestigeModal={() => ui.setShowPrestigeModal(true)}
          />
        </div>
      </div>

      {/* ---- Mobile layout (< lg) ---- */}
      <div className="lg:hidden flex-1 min-h-0 relative z-10 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={ui.activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            {mobilePanelContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ---- Mobile bottom nav ---- */}
      <MobileNav
        active={ui.activeTab}
        onChange={ui.setActiveTab}
        upgradeCount={availableUpgradeCount}
      />

      {/* ---- Modals ---- */}
      <PrestigeModal
        open={ui.showPrestigeModal}
        pendingStardust={pendingStardust}
        currentStardust={state.resources.stardust}
        totalEnergyEarned={state.stats.totalEnergyEarned}
        onConfirm={actions.prestige}
        onCancel={() => ui.setShowPrestigeModal(false)}
      />

      <OfflineModal
        open={ui.showOfflineModal}
        gains={ui.offlineGains}
        onDismiss={actions.dismissOfflineModal}
      />

      <SettingsModal
        open={showSettings}
        soundEnabled={state.settings.soundEnabled}
        notificationsEnabled={state.settings.notificationsEnabled}
        onToggleSound={actions.toggleSound}
        onToggleNotifications={actions.toggleNotifications}
        onHardReset={actions.hardReset}
        onClose={() => setShowSettings(false)}
      />

      {/* ---- Achievement toasts ---- */}
      <AchievementToast
        achievementIds={ui.newAchievements}
        onDismiss={ui.dismissAchievement}
      />
    </div>
  );
}
