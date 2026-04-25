/**
 * Grille clinique : périodes × (semaine | week-end).
 * Valeurs stockées en base (string[]).
 */
export const CLINICAL_AVAILABILITY_SLOT_IDS = [
  "week_morning",
  "week_afternoon",
  "week_evening",
  "weekend_morning",
  "weekend_afternoon",
  "weekend_evening",
] as const;

export type ClinicalAvailabilitySlotId =
  (typeof CLINICAL_AVAILABILITY_SLOT_IDS)[number];

const SLOT_SET = new Set<string>(CLINICAL_AVAILABILITY_SLOT_IDS);

export function isClinicalAvailabilitySlotId(
  id: string,
): id is ClinicalAvailabilitySlotId {
  return SLOT_SET.has(id);
}

/** Migre d’anciennes valeurs (profil médical ou préférences) vers la grille actuelle. */
export function migrateLegacyAvailabilitySlots(
  slots: string[],
): ClinicalAvailabilitySlotId[] {
  const out = new Set<ClinicalAvailabilitySlotId>();

  const add = (id: string) => {
    if (isClinicalAvailabilitySlotId(id)) out.add(id);
  };

  for (const s of slots) {
    add(s);

    switch (s) {
      case "morning":
        add("week_morning");
        add("weekend_morning");
        break;
      case "afternoon":
        add("week_afternoon");
        add("weekend_afternoon");
        break;
      case "evening":
        add("week_evening");
        add("weekend_evening");
        break;
      case "weekends":
        add("weekend_morning");
        add("weekend_afternoon");
        add("weekend_evening");
        break;
      case "Weekday mornings":
        add("week_morning");
        break;
      case "Weekday afternoons":
        add("week_afternoon");
        break;
      case "Weekday evenings":
        add("week_evening");
        break;
      case "Weekend mornings":
        add("weekend_morning");
        break;
      case "Weekend afternoons":
        add("weekend_afternoon");
        break;
      case "Weekend evenings":
        add("weekend_evening");
        break;
      case "Weekday Mornings":
        add("week_morning");
        break;
      case "Weekday Afternoons":
        add("week_afternoon");
        break;
      case "Weekday Evenings":
        add("week_evening");
        break;
      case "Weekends":
        add("weekend_morning");
        add("weekend_afternoon");
        add("weekend_evening");
        break;
      default:
        break;
    }
  }

  return [...out];
}
