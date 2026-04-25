/**
 * Display a canonical FR string in the current locale.
 * Storage/state always uses the FR canonical value; this only transforms display text.
 */
export const translateFromMap = (
  value: string,
  map: Record<string, string>,
  locale: string,
): string => (locale === "en" ? (map[value] ?? value) : value);
