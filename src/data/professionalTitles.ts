/**
 * Liste des titres professionnels, ordre harmonisé avec la page d'accueil.
 * Ordre : 1. Psychologue, 2. Psychothérapeute, 3. Neuropsychologue, etc.
 */
export const PROFESSIONAL_TITLES = [
  { value: "psychologist", msgKey: "psychologist" },
  { value: "psychotherapist", msgKey: "psychotherapist" },
  { value: "neuropsychologist", msgKey: "neuropsychologist" },
  { value: "psychoeducator", msgKey: "psychoeducator" },
  { value: "occupationalTherapistMentalHealth", msgKey: "occupationalTherapistMentalHealth" },
  { value: "psychiatrist", msgKey: "psychiatrist" },
  { value: "otherProfessionals", msgKey: "otherProfessionals" },
] as const;

/** Catégories d'âge (dès le début pour déterminer l'affichage de l'étape 4). */
export const AGE_CATEGORIES = [
  { value: "0-12", msgKey: "0-12" },
  { value: "13-17", msgKey: "13-17" },
  { value: "18-64", msgKey: "18-64" },
  { value: "65+", msgKey: "65+" },
] as const;
