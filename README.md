# 🌌 Cosmic Idle — Energy Empire

A space-themed idle/incremental game built with **Next.js 16**, **TypeScript**, and **Tailwind CSS 4**. Click the orb to generate energy, build an automated production network, unlock upgrades, and prestige to grow even more powerful.

---

## ✨ Features

- **Click to generate energy** — satisfying particle burst + floating numbers on every click
- **8 progressive buildings** — from Solar Panels to Dyson Spheres, each unlocking as you grow
- **24 regular upgrades** — click power, per-building multipliers, and global milestone bonuses
- **5 prestige upgrades** — permanent bonuses that survive resets
- **Prestige system** — reset for Stardust that grants a permanent production multiplier
- **Offline progress** — earn resources while away (up to 4 hours, extendable to 8h via prestige)
- **15 achievements** — milestone-based with unlock notifications
- **Sound effects** — synthesized via Web Audio API (no external files)
- **Responsive layout** — 3-column desktop, tab-based mobile
- **Auto-save** — progress saved to localStorage every 5 seconds
- **Space neon aesthetic** — glassmorphism panels, animated starfield, neon glow effects

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.x | App Router, SSR/CSR |
| React | 19.x | UI framework |
| TypeScript | 5.x | Strict type safety |
| Tailwind CSS | 4.x | Styling (v4 CSS-first config) |
| Framer Motion | 12.x | Animations & transitions |
| Web Audio API | Browser | Synthesized sound effects |

---

## 🎮 Controls

### Desktop
| Action | Control |
|---|---|
| Generate energy | Click the glowing orb |
| Buy building | Click **Buy** on any building card |
| Buy upgrade | Click **Buy** on any upgrade card |
| Open settings | Click ⚙️ in the top-right corner |
| Prestige | Navigate to Upgrades → Prestige tab |

### Mobile
| Action | Control |
|---|---|
| Generate energy | Tap the orb (Click tab) |
| Buy building | Build tab → tap Buy |
| Buy upgrade | Upgrade tab → tap Buy |
| Navigate | Bottom tab bar |

---

## 🚀 How to Run Locally

**Prerequisites:** Node.js 18+ and npm

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd cosmic-idle

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in browser
# http://localhost:3000
```

To create a production build:
```bash
npm run build
npm start
```

---

## ☁️ Deploy to Vercel

This project is deploy-ready with zero configuration.

1. Push the repo to GitHub (or GitLab / Bitbucket)
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**
3. Import your repository
4. Click **Deploy** — no environment variables needed

Or use the Vercel CLI:
```bash
npm i -g vercel
vercel --prod
```

---

## 🎯 Game Mechanics

### Resources
| Resource | How to earn | Use |
|---|---|---|
| ⚡ Energy | Click + auto-buildings | Buy everything |
| 💎 Crystals | Crystal Matrix + above | Late-game buildings/upgrades |
| 🌑 Dark Matter | Dyson Sphere | End-game resource |
| ✨ Stardust | Prestige resets | Permanent multiplier + prestige upgrades |

### Prestige
- Requires **1,000,000 total energy earned**
- Earns **Stardust = √(totalEnergy / 1,000,000)**
- Each Stardust gives **+2% global production multiplier**
- Unlocks special Prestige Upgrades that persist forever

### Buildings (in unlock order)
1. 🌟 **Solar Panel** — 15⚡ → 0.1⚡/s
2. ⚡ **Energy Core** — 100⚡ → 0.5⚡/s
3. 🔥 **Plasma Generator** — 1,100⚡ → 4⚡/s
4. ⚛️ **Quantum Reactor** — 12,000⚡ → 20⚡/s
5. 🌀 **Void Harvester** — 130,000⚡ → 100⚡/s
6. 💎 **Crystal Matrix** — 1.4M⚡ → 640⚡/s + 0.1💎/s
7. 🌌 **Singularity Engine** — 20M⚡ + 50💎 → 5,000⚡/s + 1💎/s
8. ☀️ **Dyson Sphere** — 300M⚡ + 500💎 → 50,000⚡/s + 10💎/s + 0.01🌑/s

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx       # Root layout & metadata
│   ├── page.tsx         # Main game page
│   └── globals.css      # Tailwind v4 + starfield + animations
├── lib/
│   ├── types.ts         # TypeScript interfaces
│   ├── gameConfig.ts    # Static game data (buildings, upgrades, achievements)
│   ├── formatters.ts    # Number/time formatting utilities
│   └── gameLogic.ts     # Pure game logic (no React)
├── hooks/
│   ├── useGameEngine.ts # Core game loop + state management
│   └── useSound.ts      # Web Audio API sound synthesis
└── components/
    ├── game/
    │   ├── ResourceBar.tsx
    │   ├── ClickOrb.tsx       # Canvas particles + floating numbers
    │   ├── BuildingPanel.tsx
    │   ├── BuildingCard.tsx
    │   ├── UpgradePanel.tsx   # Upgrades/Prestige/Stats tabs
    │   ├── UpgradeCard.tsx
    │   ├── StatsPanel.tsx
    │   ├── PrestigeModal.tsx
    │   ├── OfflineModal.tsx
    │   ├── AchievementToast.tsx
    │   ├── SettingsModal.tsx
    │   └── MobileNav.tsx
    └── ui/
        ├── Panel.tsx          # Glassmorphism panel
        ├── Button.tsx         # Neon button variants
        └── ProgressBar.tsx    # Animated neon progress bar
```

---

## 📄 License

MIT — feel free to fork and build your own idle empire!
