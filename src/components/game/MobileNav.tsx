"use client";

// Bottom mobile navigation tab bar (hidden on lg+)

import type { ActiveTab } from "@/hooks/useGameEngine";

const TABS: { id: ActiveTab; icon: string; label: string }[] = [
  { id: "click", icon: "⚡", label: "Click" },
  { id: "build", icon: "🔧", label: "Build" },
  { id: "upgrades", icon: "⬆️", label: "Upgrade" },
  { id: "stats", icon: "📊", label: "Stats" },
];

interface MobileNavProps {
  active: ActiveTab;
  onChange: (tab: ActiveTab) => void;
  upgradeCount: number;
}

export default function MobileNav({
  active,
  onChange,
  upgradeCount,
}: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-950/90 backdrop-blur-md border-t border-white/10">
      <div className="flex">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex-1 flex flex-col items-center gap-1 py-3 relative transition-all duration-150
              ${active === tab.id ? "text-cyan-300" : "text-slate-500 hover:text-slate-300"}
            `}
          >
            {/* Active indicator */}
            {active === tab.id && (
              <span className="absolute top-0 inset-x-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            )}
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              {tab.label}
            </span>
            {/* Badge for available upgrades */}
            {tab.id === "upgrades" && upgradeCount > 0 && (
              <span className="absolute top-1.5 right-1/3 bg-purple-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {upgradeCount > 9 ? "9+" : upgradeCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
