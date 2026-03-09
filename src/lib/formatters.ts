// ============================================================
// Number and time formatting utilities
// ============================================================

const SUFFIXES = [
  "",
  "K",
  "M",
  "B",
  "T",
  "Qa",
  "Qi",
  "Sx",
  "Sp",
  "Oc",
  "No",
  "Dc",
];

/**
 * Format a large number with letter suffixes.
 * e.g. 1234567 → "1.23M"
 */
export function formatNumber(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "0";
  if (n < 0) return `-${formatNumber(-n)}`;
  if (n < 1000) return n % 1 === 0 ? String(Math.floor(n)) : n.toFixed(1);

  const tier = Math.min(
    Math.floor(Math.log10(n) / 3),
    SUFFIXES.length - 1
  );
  const scaled = n / Math.pow(10, tier * 3);
  // Show 3 significant figures
  const formatted =
    scaled >= 100
      ? scaled.toFixed(0)
      : scaled >= 10
      ? scaled.toFixed(1)
      : scaled.toFixed(2);

  return `${formatted}${SUFFIXES[tier]}`;
}

/**
 * Format a production rate with "/s" suffix.
 * e.g. 123.456 → "123.5/s"
 */
export function formatRate(n: number): string {
  if (n === 0) return "0/s";
  return `${formatNumber(n)}/s`;
}

/**
 * Format a millisecond duration into a human-readable string.
 * e.g. 3661000 → "1h 1m 1s"
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (parts.length === 0 || seconds > 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}
