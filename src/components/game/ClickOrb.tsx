"use client";

// The main clickable orb with canvas particle burst and floating numbers

import { useRef, useCallback, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber } from "@/lib/formatters";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0–1 (1 = new)
  color: string;
}

interface FloatText {
  id: number;
  x: number;
  y: number;
  value: string;
}

const PARTICLE_COLORS = [
  "#22d3ee", // cyan
  "#a855f7", // purple
  "#ec4899", // pink
  "#38bdf8", // sky
  "#ffffff",
];

let nextId = 0;

interface ClickOrbProps {
  onClickOrb: () => void;
  energyPerClick: number;
  energyPerSecond: number;
}

export default function ClickOrb({
  onClickOrb,
  energyPerClick,
  energyPerSecond,
}: ClickOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const [floatTexts, setFloatTexts] = useState<FloatText[]>([]);

  // --------------- Canvas particle loop ---------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.life -= 0.025;

        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(draw);
    }

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // --------------- Spawn particles ---------------
  const spawnParticles = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cx = x - rect.left;
      const cy = y - rect.top;

      const count = 16;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const speed = 2 + Math.random() * 3;
        particlesRef.current.push({
          id: nextId++,
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          life: 1,
          color:
            PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        });
      }
    },
    []
  );

  // --------------- Handle click ---------------
  const handleClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      onClickOrb();

      let clientX: number;
      let clientY: number;

      if ("touches" in e) {
        clientX = e.touches[0]?.clientX ?? 0;
        clientY = e.touches[0]?.clientY ?? 0;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      spawnParticles(clientX, clientY);

      // Spawn floating "+X" text
      const id = nextId++;
      setFloatTexts((prev) => [
        ...prev,
        {
          id,
          x: clientX,
          y: clientY,
          value: `+${formatNumber(energyPerClick)}`,
        },
      ]);
      setTimeout(() => {
        setFloatTexts((prev) => prev.filter((t) => t.id !== id));
      }, 1000);
    },
    [onClickOrb, energyPerClick, spawnParticles]
  );

  return (
    <div className="relative flex flex-col items-center gap-4 select-none">
      {/* Canvas — covers full viewport for particles */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-50"
      />

      {/* Floating click numbers (fixed position) */}
      <AnimatePresence>
        {floatTexts.map((ft) => (
          <motion.div
            key={ft.id}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -60 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="fixed pointer-events-none z-50 text-cyan-300 font-bold text-lg drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            style={{ left: ft.x - 20, top: ft.y - 20 }}
          >
            {ft.value}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* The Orb */}
      <motion.button
        onMouseDown={handleClick}
        onTouchStart={handleClick}
        whileTap={{ scale: 0.93 }}
        className="relative w-52 h-52 md:w-64 md:h-64 rounded-full cursor-pointer outline-none border-0 bg-transparent"
        aria-label="Click to generate energy"
      >
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-cyan-400/10 animate-ping-slow" />

        {/* Middle ring */}
        <div className="absolute inset-2 rounded-full border-2 border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.3)]" />

        {/* Inner orb */}
        <div
          className="absolute inset-4 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, #22d3ee 0%, #7c3aed 45%, #0f0f2e 100%)",
            boxShadow:
              "0 0 40px rgba(34,211,238,0.5), 0 0 80px rgba(124,58,237,0.3), inset 0 0 30px rgba(255,255,255,0.1)",
          }}
        />

        {/* Shine highlight */}
        <div className="absolute inset-6 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      </motion.button>

      {/* Stats below orb */}
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-cyan-300 font-semibold text-sm">
          <span className="text-white">+{formatNumber(energyPerClick)}</span>{" "}
          energy / click
        </p>
        {energyPerSecond > 0 && (
          <p className="text-slate-400 text-xs">
            {formatNumber(energyPerSecond)} energy / sec (auto)
          </p>
        )}
      </div>
    </div>
  );
}
