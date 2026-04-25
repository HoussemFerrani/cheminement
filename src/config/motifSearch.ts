/**
 * Mots-clés additionnels indexés par libellé exact de motif (liste MOTIFS).
 * Permet de faire matcher TCC, anxiété, etc. sur les bons intitulés.
 */
export const MOTIF_SEARCH_EXTRAS: Partial<Record<string, string>> = {
  "Troubles anxieux":
    "anxiété anxieux TAG TAC phobie stress inquiétude angoisse généralisée",
  Panique: "anxiété crise attaque panic angoisse",
  "Stress post-traumatique": "TSPT PTSD trauma EMDR stress post traumatique",
  "Gestion du stress": "stress anxiété burnout épuisement surcharge",
  "Troubles obsessifs-compulsifs": "TOC OCD obsession compulsion rituel",
  Dépression: "humeur tristesse déprimé dysphorie",
  "TSA, intervention": "autisme TSA spectre neurodéveloppement",
  "TSA, évaluation": "autisme TSA spectre",
  "Évaluation neuropsychologique": "neuropsy cognitif mémoire attention",
  "Consultation neuropsychologique": "neuropsy évaluation cognitive",
  "Gestion de la colère": "colère agressivité rage",
  "Gestion des émotions": "émotions régulation sensibilité",
  Timidité: "social phobie anxiété sociale réserve",
  "Phobies (insectes…)": "phobie anxiété peur évitement insectes",
  "Psychologie du sport": "performance sport mental préparation",
  "Thérapie de couple": "couple relation conjoint",
  "Médiation familiale": "famille conflit séparation",
};

/**
 * Normalisation pour clés de synonymes (minuscules, sans accents).
 */
export function normalizeMotifSearchToken(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/**
 * Acronymes / synonymes saisis par l’utilisateur → tokens ajoutés à la requête Fuse.
 * Clés = normalizeMotifSearchToken("TCC") → "tcc"
 */
export const MOTIF_QUERY_TOKEN_EXPANSIONS: Record<string, string> = {
  tcc: "thérapie cognitivo-comportementale cognitif comportemental CBT",
  emdr: "trauma stress post traumatique désensibilisation mouvements oculaires",
  cbt: "cognitif comportemental thérapie TCC",
  act: "acceptation engagement thérapie",
  dbt: "thérapie dialectique borderline émotions",
  ipt: "thérapie interpersonnelle relationnelle",
  pnl: "programmation neuro-linguistique",
  tsa: "autisme spectre TSA trouble envahissant",
  tspt: "stress post traumatique PTSD trauma",
  ptsd: "stress post traumatique TSPT trauma",
  tdah: "TDAH hyperactivité attention déficit ADHD",
  adhd: "TDAH attention hyperactivité",
  toc: "obsessif compulsif rituel OCD",
  ocd: "obsessif compulsif TOC",
  tag: "anxiété généralisée troubles anxieux",
  tac: "anxiété sociale phobie sociale",
  anxiete: "anxiété anxieux troubles anxieux stress",
  anxiété: "anxiété anxieux troubles anxieux stress",
  stress: "anxiété gestion charge épuisement",
  burnout: "épuisement professionnel stress surcharge",
  depression: "dépression humeur tristesse",
  dépression: "humeur tristesse dysphorie",
  neuropsy: "neuropsychologique évaluation cognitive",
};

/**
 * Étend la requête utilisateur avec les expansions des jetons reconnus.
 */
export function expandUserMotifQuery(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const tokens = trimmed.split(/[\s,;]+/).filter(Boolean);
  const parts = new Set<string>([trimmed]);
  for (const t of tokens) {
    const n = normalizeMotifSearchToken(t);
    if (n && MOTIF_QUERY_TOKEN_EXPANSIONS[n]) {
      parts.add(MOTIF_QUERY_TOKEN_EXPANSIONS[n]);
    }
  }
  return [...parts].join(" ");
}
