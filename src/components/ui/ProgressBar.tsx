"use client";

// Animated neon progress bar

interface ProgressBarProps {
  value: number; // 0–100
  color?: "cyan" | "purple" | "pink";
  className?: string;
  label?: string;
}

const trackColors = {
  cyan: "bg-cyan-400",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
};

const glowColors = {
  cyan: "shadow-[0_0_8px_rgba(34,211,238,0.7)]",
  purple: "shadow-[0_0_8px_rgba(168,85,247,0.7)]",
  pink: "shadow-[0_0_8px_rgba(236,72,153,0.7)]",
};

export default function ProgressBar({
  value,
  color = "cyan",
  className = "",
  label,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between mb-1 text-xs text-slate-400">
          <span>{label}</span>
          <span>{clamped.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${trackColors[color]} ${glowColors[color]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
