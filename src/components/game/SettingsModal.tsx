"use client";

// Settings modal: sound, notifications, hard reset

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

interface SettingsModalProps {
  open: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  onToggleSound: () => void;
  onToggleNotifications: () => void;
  onHardReset: () => void;
  onClose: () => void;
}

function Toggle({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/10">
      <span className="text-sm text-slate-300">{label}</span>
      <button
        onClick={onToggle}
        className={`
          relative w-11 h-6 rounded-full transition-all duration-200
          ${enabled ? "bg-cyan-500" : "bg-white/10"}
        `}
      >
        <span
          className={`
            absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200
            ${enabled ? "left-5" : "left-0.5"}
          `}
        />
      </button>
    </div>
  );
}

export default function SettingsModal({
  open,
  soundEnabled,
  notificationsEnabled,
  onToggleSound,
  onToggleNotifications,
  onHardReset,
  onClose,
}: SettingsModalProps) {
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full pointer-events-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">⚙️ Settings</h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <Toggle
                label="🔊 Sound Effects"
                enabled={soundEnabled}
                onToggle={onToggleSound}
              />
              <Toggle
                label="🔔 Achievement Notifications"
                enabled={notificationsEnabled}
                onToggle={onToggleNotifications}
              />

              <div className="mt-6">
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">
                  Danger Zone
                </p>
                {!confirmingReset ? (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setConfirmingReset(true)}
                    className="w-full"
                  >
                    Hard Reset (delete all progress)
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-red-400 text-center">
                      Are you sure? This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmingReset(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          onHardReset();
                          setConfirmingReset(false);
                          onClose();
                        }}
                        className="flex-1"
                      >
                        Yes, Reset
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-center text-[10px] text-slate-600 mt-6">
                Cosmic Idle v1.0.0
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
