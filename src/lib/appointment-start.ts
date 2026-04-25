/**
 * Date/heure de début du rendez-vous (pour fenêtres H-48, etc.).
 */
export function getAppointmentStartAt(apt: {
  date?: Date;
  time?: string;
  scheduledStartAt?: Date;
}): Date | null {
  if (apt.scheduledStartAt) {
    const d = new Date(apt.scheduledStartAt);
    return isNaN(d.getTime()) ? null : d;
  }
  if (!apt.date) return null;
  const base =
    apt.date instanceof Date ? new Date(apt.date) : new Date(apt.date as Date);
  if (isNaN(base.getTime())) return null;
  const [hoursStr, minutesStr] = (apt.time || "00:00").split(":");
  const hours = parseInt(hoursStr || "0", 10);
  const minutes = parseInt(minutesStr || "0", 10);
  base.setHours(hours, minutes, 0, 0);
  return base;
}
