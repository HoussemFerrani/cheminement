/**
 * Cycle comptable bihebdomadaire (étiquette stable pour regroupement / export).
 * Ex. 2026-B01 … B26 (26 × 14 jours ≈ année).
 */
export function getBiweeklyCycleKey(d: Date): string {
  const year = d.getFullYear();
  const start = new Date(year, 0, 1);
  const ms = d.getTime() - start.getTime();
  const day = Math.floor(ms / 86400000);
  const biweek = Math.min(26, Math.floor(day / 14) + 1);
  return `${year}-B${String(biweek).padStart(2, "0")}`;
}

export function cycleKeyFromDateOrNow(
  d: Date | string | undefined | null,
): string {
  if (!d) return getBiweeklyCycleKey(new Date());
  const dt = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dt.getTime())) return getBiweeklyCycleKey(new Date());
  return getBiweeklyCycleKey(dt);
}

/** Bornes [start, end) du cycle bihebdomadaire contenant `d`. */
export function getBiweeklyRange(d: Date): { start: Date; end: Date } {
  const year = d.getFullYear();
  const startYear = new Date(year, 0, 1);
  const day = Math.floor((d.getTime() - startYear.getTime()) / 86400000);
  const bi = Math.floor(day / 14);
  const start = new Date(startYear);
  start.setDate(start.getDate() + bi * 14);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 14);
  return { start, end };
}
