import type { AppointmentStatus } from "@/types/api";

/** Nature de l'acte (facturation / dossier). */
export const SESSION_ACT_NATURE_VALUES = [
  "treatment",
  "evaluation",
  "consultation",
  "administrative",
] as const;

export type SessionActNature = (typeof SESSION_ACT_NATURE_VALUES)[number];

/** Issue de la rencontre — détermine le statut du RDV et la fraction facturée. */
export const SESSION_OUTCOME_VALUES = [
  "tracking_ongoing",
  "completed",
  "rescheduled_agreed",
  "referral_other",
  "client_no_show",
] as const;

export type SessionOutcome = (typeof SESSION_OUTCOME_VALUES)[number];

export function getBillingFraction(outcome: SessionOutcome): number {
  switch (outcome) {
    case "tracking_ongoing":
    case "completed":
    case "referral_other":
      return 1;
    case "client_no_show":
      return 1;
    case "rescheduled_agreed":
      return 0;
    default:
      return 1;
  }
}

export function getAppointmentStatusForOutcome(
  outcome: SessionOutcome,
): AppointmentStatus {
  switch (outcome) {
    case "tracking_ongoing":
    case "completed":
    case "referral_other":
      return "completed";
    case "client_no_show":
      return "no-show";
    case "rescheduled_agreed":
      return "cancelled";
    default:
      return "completed";
  }
}

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}
