import { useMemo, useState, useCallback, useEffect } from "react";
import Fuse, { type IFuseOptions } from "fuse.js";
import {
  expandUserMotifQuery,
  MOTIF_SEARCH_EXTRAS,
  normalizeMotifSearchToken,
} from "@/config/motifSearch";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseStringSearchOptions {
  /** 0.0 = exact match, 1.0 = match anything. Default: 0.3 */
  threshold?: number;
  /** Minimum characters required before fuzzy search kicks in. Default: 1 */
  minMatchCharLength?: number;
  /** Whether to include relevance score (0–1) in results. Default: false */
  includeScore?: boolean;
  /** Sort results alphabetically. Default: true */
  sortAlphabetically?: boolean;
}

export interface SearchResult {
  item: string;
  /** Relevance score: 0 = perfect match, 1 = no match (only present if includeScore: true) */
  score?: number;
  /** Index of the item in the original array */
  refIndex: number;
}

export interface UseStringSearchReturn {
  /** Current search query */
  query: string;
  /** Update the query and trigger a new search */
  setQuery: (query: string) => void;
  /** Filtered results based on the current query */
  results: string[];
  /** Detailed results with score and index (useful for highlighting) */
  detailedResults: SearchResult[];
  /** Whether the search returned no results */
  isEmpty: boolean;
  /** Whether a query is currently active */
  isFiltered: boolean;
  /** Total number of results */
  count: number;
  /** Reset the query to empty string */
  reset: () => void;
  /** Imperatively search without updating internal state */
  search: (query: string) => string[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useStringSearch
 *
 * A fuzzy search hook for arrays of strings, powered by Fuse.js.
 *
 * @example
 * const { query, setQuery, results, reset } = useStringSearch(MOTIFS);
 *
 * @example with options
 * const { results } = useStringSearch(items, { threshold: 0.4, sortAlphabetically: false });
 */
export function useStringSearch(
  items: string[],
  options: UseStringSearchOptions = {},
): UseStringSearchReturn {
  const {
    threshold = 0.3,
    minMatchCharLength = 1,
    includeScore = false,
    sortAlphabetically = true,
  } = options;

  const [query, setQueryState] = useState("");

  // Memoize Fuse instance — only rebuilds when items or config changes
  const fuse = useMemo(() => {
    const fuseOptions: IFuseOptions<string> = {
      threshold,
      minMatchCharLength,
      includeScore: true, // always fetch score internally for ranking
      // No keys needed for plain string arrays
    };
    return new Fuse(items, fuseOptions);
  }, [items, threshold, minMatchCharLength]);

  // Core search logic (pure, no state side-effects)
  const runSearch = useCallback(
    (rawQuery: string): SearchResult[] => {
      const trimmed = rawQuery.trim();

      if (!trimmed) {
        // Return all items when query is empty
        const all = items.map((item, refIndex) => ({ item, refIndex }));
        return sortAlphabetically
          ? all.sort((a, b) => a.item.localeCompare(b.item))
          : all;
      }

      const fuseResults = fuse.search(trimmed);

      const mapped: SearchResult[] = fuseResults.map((r) => ({
        item: r.item,
        score: r.score,
        refIndex: r.refIndex,
      }));

      return sortAlphabetically
        ? mapped.sort((a, b) => a.item.localeCompare(b.item))
        : mapped; // default: Fuse relevance order
    },
    [fuse, items, sortAlphabetically],
  );

  // Memoized results derived from current query
  const detailedResults = useMemo(() => runSearch(query), [query, runSearch]);

  const results = useMemo(
    () => detailedResults.map((r) => r.item),
    [detailedResults],
  );

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);

  const reset = useCallback(() => {
    setQueryState("");
  }, []);

  // Imperative search — returns results without touching state
  const search = useCallback(
    (rawQuery: string): string[] => runSearch(rawQuery).map((r) => r.item),
    [runSearch],
  );

  return {
    query,
    setQuery,
    results,
    detailedResults: includeScore
      ? detailedResults
      : detailedResults.map(({ score: _omit, ...rest }) => rest),
    isEmpty: results.length === 0,
    isFiltered: query.trim().length > 0,
    count: results.length,
    reset,
    search,
  };
}

// ─── Smart-Suggest (synonymes / acronymes + debounce) ─────────────────────────

export interface MotifSearchRecord {
  canonical: string;
  searchText: string;
}

/**
 * Construit les documents Fuse : libellé + mots-clés optionnels par entrée.
 * @param perItemExtras — `{}` pour désactiver les extras (ex. liste custom).
 */
export function buildMotifSearchRecords(
  motifs: string[],
  perItemExtras: Partial<Record<string, string>> = MOTIF_SEARCH_EXTRAS,
): MotifSearchRecord[] {
  return motifs.map((canonical) => {
    const extra = perItemExtras[canonical];
    const searchText = extra ? `${canonical} ${extra}` : canonical;
    return { canonical, searchText };
  });
}

export interface UseDebouncedSmartMotifSearchOptions {
  debounceMs?: number;
  fuseThreshold?: number;
}

/**
 * Recherche différée (défaut 300 ms) sur searchText, avec expansion de requête
 * (TCC, EMDR, anxiété… — voir config/motifSearch.ts).
 */
export function useDebouncedSmartMotifSearch(
  records: MotifSearchRecord[],
  {
    debounceMs = 300,
    fuseThreshold = 0.34,
  }: UseDebouncedSmartMotifSearchOptions = {},
) {
  const [inputQuery, setInputQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(inputQuery), debounceMs);
    return () => clearTimeout(id);
  }, [inputQuery, debounceMs]);

  const fuse = useMemo(
    () =>
      new Fuse(records, {
        keys: ["searchText"],
        threshold: fuseThreshold,
        minMatchCharLength: 1,
        ignoreLocation: true,
        includeScore: true,
      }),
    [records, fuseThreshold],
  );

  const normalizedRecords = useMemo(
    () =>
      records.map((r) => ({
        canonical: r.canonical,
        normalizedCanonical: normalizeMotifSearchToken(r.canonical),
        normalizedSearchText: normalizeMotifSearchToken(r.searchText),
      })),
    [records],
  );

  const results = useMemo(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) return [];

    const normalizedQuery = normalizeMotifSearchToken(trimmed);
    const seen = new Set<string>();
    const startsWith: string[] = [];
    const contains: string[] = [];

    // Substring pass (accent + case insensitive) — guarantees every item
    // containing the typed word appears, even when the word is complete.
    if (normalizedQuery) {
      for (const r of normalizedRecords) {
        if (seen.has(r.canonical)) continue;
        if (r.normalizedCanonical.startsWith(normalizedQuery)) {
          seen.add(r.canonical);
          startsWith.push(r.canonical);
        } else if (r.normalizedSearchText.includes(normalizedQuery)) {
          seen.add(r.canonical);
          contains.push(r.canonical);
        }
      }
    }

    // Fuzzy pass (typos, acronyms, synonyms) — appended after substring matches.
    const expanded = expandUserMotifQuery(trimmed);
    const hits = fuse.search(expanded);
    const fuzzy: string[] = [];
    for (const h of hits) {
      const c = h.item.canonical;
      if (!seen.has(c)) {
        seen.add(c);
        fuzzy.push(c);
      }
    }

    return [...startsWith, ...contains, ...fuzzy];
  }, [debouncedQuery, fuse, normalizedRecords]);

  return {
    inputQuery,
    setInputQuery,
    debouncedQuery,
    results,
  };
}
