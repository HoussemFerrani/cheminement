/**
 * Affichage minimal pour RBAC (ex. admin facturation) — ne remplace pas le chiffrement au repos.
 */

/** Ex. 5145551234 ou +15145551234 → "514-XXX-1234" */
export function maskPhoneForDisplay(phone: string | undefined | null): string {
  if (phone === undefined || phone === null || String(phone).trim() === "") {
    return "";
  }
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 0) {
    return "—";
  }
  let d = digits;
  if (d.length === 11 && d.startsWith("1")) {
    d = d.slice(1);
  }
  if (d.length === 10) {
    return `${d.slice(0, 3)}-XXX-${d.slice(6)}`;
  }
  if (d.length >= 7) {
    const head = d.slice(0, Math.min(3, d.length - 4));
    const tail = d.slice(-3);
    return `${head}-XXX-${tail}`;
  }
  return "XXX-XXX-XXXX";
}
