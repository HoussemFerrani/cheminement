"use client";

import { useEffect, useState } from "react";

export interface PublicMotif {
  id: string;
  labelFr: string;
  labelEn: string;
  aliases: string[];
}

interface CacheEntry {
  promise: Promise<PublicMotif[]>;
  data: PublicMotif[] | null;
  ts: number;
}

let cache: CacheEntry | null = null;
const TTL_MS = 5 * 60 * 1000;

async function fetchMotifs(): Promise<PublicMotif[]> {
  const res = await fetch("/api/motifs", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load motifs (${res.status})`);
  }
  const body = (await res.json()) as { motifs: PublicMotif[] };
  return body.motifs ?? [];
}

function getCached(): Promise<PublicMotif[]> {
  const now = Date.now();
  if (cache && now - cache.ts < TTL_MS) {
    return cache.promise;
  }
  const promise = fetchMotifs();
  cache = { promise, data: null, ts: now };
  promise
    .then((d) => {
      if (cache) cache.data = d;
    })
    .catch(() => {
      cache = null;
    });
  return promise;
}

export interface UseMotifsResult {
  motifs: PublicMotif[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useMotifs(): UseMotifsResult {
  const [motifs, setMotifs] = useState<PublicMotif[]>(
    () => cache?.data ?? [],
  );
  const [loading, setLoading] = useState<boolean>(!cache?.data);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getCached()
      .then((data) => {
        if (cancelled) return;
        setMotifs(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load motifs");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  return {
    motifs,
    loading,
    error,
    reload: () => {
      cache = null;
      setNonce((n) => n + 1);
    },
  };
}

/**
 * Return the locale-preferred label for a motif, falling back to FR when EN is missing.
 */
export function pickMotifLabel(
  motif: PublicMotif,
  locale: string | undefined,
): string {
  if (locale === "en" && motif.labelEn.trim()) return motif.labelEn;
  return motif.labelFr;
}
