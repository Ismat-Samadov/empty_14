"use client";

// Reusable button with neon variants

import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const variantClasses = {
  primary:
    "bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(34,211,238,0.4)] active:scale-95",
  secondary:
    "bg-purple-500/20 border border-purple-500/50 text-purple-300 hover:bg-purple-500/30 hover:border-purple-500 hover:shadow-[0_0_12px_rgba(168,85,247,0.4)] active:scale-95",
  danger:
    "bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30 hover:border-red-500 active:scale-95",
  ghost:
    "bg-transparent border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white active:scale-95",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-all duration-150 select-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer"}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
