export const LEGAL_VERSIONS = {
  terms: "2026-04-13",
  privacy: "2026-04-13",
  professionalTerms: "2026-04-13",
} as const;

export type LegalDocumentKey = keyof typeof LEGAL_VERSIONS;
