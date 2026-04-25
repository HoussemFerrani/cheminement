/**
 * Code unique par rendez-vous, lié au professionnel (suffixe) pour le message Interac.
 */
export function buildInteracReferenceCode(
  appointmentId: string,
  professionalId: string | undefined,
): string {
  const p = (professionalId ?? "000000000000000000000000")
    .replace(/[^a-f0-9]/gi, "")
    .slice(-4)
    .toUpperCase()
    .padStart(4, "0");
  const a = appointmentId
    .replace(/[^a-f0-9]/gi, "")
    .slice(-6)
    .toUpperCase()
    .padStart(6, "0");
  return `INT-${p}-${a}`;
}
