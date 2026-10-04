"use client";

import { useEffect, useState } from "react";
import type {
  CandlePoint,
  CompanyProfile,
  FinancialHighlights,
  QuoteData,
  SearchResult,
} from "./finance-types";

export function useQuotes(symbols: string[], pollMs = 30000) {
  const key = symbols.join(",");
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/finance/quote?symbols=${encodeURIComponent(key)}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Failed to load quotes.");
          return;
        }
        setQuotes(data.quotes ?? []);
        setError(null);
      } catch {
        if (!cancelled) setError("Failed to load quotes.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = pollMs > 0 ? setInterval(load, pollMs) : undefined;
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [key, pollMs]);

  return { quotes, loading, error };
}

export function useChart(symbol: string, range: string) {
  const [candles, setCandles] = useState<CandlePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setLoading(true);
    });

    fetch(`/api/finance/chart?symbol=${encodeURIComponent(symbol)}&range=${range}`)
      .then(async (res) => ({ ok: res.ok, data: await res.json() }))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) {
          setError(data.error ?? "Failed to load chart.");
          setCandles([]);
          return;
        }
        setCandles(data.candles ?? []);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load chart.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol, range]);

  return { candles, loading, error };
}

export function useSummary(symbol: string) {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [financials, setFinancials] = useState<FinancialHighlights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setLoading(true);
    });

    fetch(`/api/finance/summary?symbol=${encodeURIComponent(symbol)}`)
      .then(async (res) => ({ ok: res.ok, data: await res.json() }))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) {
          setError(data.error ?? "Failed to load summary.");
          return;
        }
        setProfile(data.profile ?? null);
        setFinancials(data.financials ?? null);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load summary.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return { profile, financials, loading, error };
}

export function useSymbolSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      queueMicrotask(() => setResults([]));
      return;
    }
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setLoading(true);
    });

    const timeout = setTimeout(() => {
      fetch(`/api/finance/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setResults(data.results ?? []);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  return { results, loading };
}
