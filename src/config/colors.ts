/**
 * Couleurs sémantiques (classes Tailwind) — statuts client côté professionnel.
 */
export const clientStatusTierColors = {
  gray: {
    dot: "bg-zinc-400",
    badge:
      "bg-zinc-100 text-zinc-800 border border-zinc-200 dark:bg-zinc-900/50 dark:text-zinc-200 dark:border-zinc-700",
  },
  yellow: {
    dot: "bg-amber-400",
    badge:
      "bg-amber-100 text-amber-950 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-800",
  },
  green: {
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-100 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800",
  },
  red: {
    dot: "bg-red-500",
    badge:
      "bg-red-100 text-red-900 border border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900",
  },
} as const;
