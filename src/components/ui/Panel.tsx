"use client";

// Reusable glassmorphism panel with optional neon glow border

import { type ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  className?: string;
  glowColor?: "cyan" | "purple" | "pink" | "none";
  title?: string;
}

const glowClasses: Record<NonNullable<PanelProps["glowColor"]>, string> = {
  cyan: "border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]",
  purple: "border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]",
  pink: "border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.15)]",
  none: "border-white/10",
};

export default function Panel({
  children,
  className = "",
  glowColor = "none",
  title,
}: PanelProps) {
  return (
    <div
      className={`bg-white/5 backdrop-blur-md border rounded-2xl ${glowClasses[glowColor]} ${className}`}
    >
      {title && (
        <div className="px-4 py-3 border-b border-white/10">
          <h2 className="text-sm font-semibold tracking-widest uppercase text-slate-400">
            {title}
          </h2>
        </div>
      )}
      {children}
    </div>
  );
}
