/**
 * Statuts de rendez-vous qui établissent un lien pro ↔ client
 * (liste clients, fiche utilisateur, profil médical).
 * À garder aligné avec GET /api/clients.
 */
export const PROFESSIONAL_CLIENT_APPOINTMENT_STATUSES = [
  "pending",
  "scheduled",
  "ongoing",
  "completed",
  "no-show",
  "cancelled",
] as const;
