"use client";

import { useEffect, useState } from "react";
import type { NavEntry } from "@/lib/portfolio-db";
import { formatCompact } from "@/lib/format";

type CurrentNav = {
  nav: number;
  fundValue: number;
  baseCapital: number;
  cash: number;
  holdingsValue: number;
  activeNames: number;
  quoteCoveragePct: number;
  valuationStatus: "COMPLETE" | "INCOMPLETE";
};

export default function NavAdminPanel({ passcode }: { passcode: string }) {
  const [current, setCurrent] = useState<CurrentNav | null>(null);
  const [history, setHistory] = useState<NavEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/portfolio/nav", {
        cache: "no-store",
        headers: { "x-neev-admin": passcode },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Unable to calculate NAV.");

      setCurrent(data.current ?? null);
      setHistory((data.history ?? []).slice().reverse());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to calculate NAV.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(load);
  }, []);

  return (
    <div className="space-y-8">
      <div className="rounded-md border border-accent/30 bg-accent/5 p-5">
        <p className="font-label text-[10px] text-accent">AUTOMATED NAV ENGINE</p>
        <h2 className="mt-1 text-xl font-semibold">NAV is never entered manually</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          The live NAV is derived from the current fund value. Base capital is the configured
          ₹10 lakh starting capital:
        </p>
        <p className="mt-3 rounded-md border border-border bg-background px-4 py-3 font-mono text-sm text-foreground">
          NAV = Current Fund Value ÷ ₹10,00,000
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-down/30 bg-down/5 p-4 text-sm text-down">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted">Calculating current NAV…</p>
      ) : current ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card p-5">
              <p className="text-xs text-muted">Current NAV</p>
              <p className="mt-2 text-3xl font-bold tracking-tight">{current.nav.toFixed(4)}</p>
              <p className="mt-1 text-xs text-muted">1.0000 at ₹10 lakh base</p>
            </div>
            <div className="card p-5">
              <p className="text-xs text-muted">Current fund value</p>
              <p className="mt-2 text-2xl font-bold">{formatCompact(current.fundValue)}</p>
              <p className="mt-1 text-xs text-muted">Live equity + cash</p>
            </div>
            <div className="card p-5">
              <p className="text-xs text-muted">Cash</p>
              <p className="mt-2 text-2xl font-bold">{formatCompact(current.cash)}</p>
              <p className="mt-1 text-xs text-muted">From controlled cash ledger</p>
            </div>
            <div className="card p-5">
              <p className="text-xs text-muted">Valuation coverage</p>
              <p className="mt-2 text-2xl font-bold">{current.quoteCoveragePct.toFixed(1)}%</p>
              <p className="mt-1 text-xs text-muted">{current.valuationStatus === "COMPLETE" ? "All active positions quoted" : "Some positions use cost fallback"}</p>
            </div>
          </section>

          <section className="card p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-label text-[10px] text-accent">LIVE COMPOSITION</p>
                <h3 className="mt-1 text-lg font-semibold">What drives today's NAV</h3>
              </div>
              <button
                type="button"
                onClick={load}
                className="rounded-md border border-border px-3 py-2 text-xs text-muted hover:border-accent hover:text-foreground"
              >
                Refresh
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-md border border-border bg-surface-2/40 p-4">
                <p className="text-xs text-muted">Base capital</p>
                <p className="mt-1 font-mono text-sm">{formatCompact(current.baseCapital)}</p>
              </div>
              <div className="rounded-md border border-border bg-surface-2/40 p-4">
                <p className="text-xs text-muted">Equity / holdings</p>
                <p className="mt-1 font-mono text-sm">{formatCompact(current.holdingsValue)}</p>
              </div>
              <div className="rounded-md border border-border bg-surface-2/40 p-4">
                <p className="text-xs text-muted">Active holdings</p>
                <p className="mt-1 font-mono text-sm">{current.activeNames}</p>
              </div>
            </div>
          </section>
        </>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-label text-[10px] text-accent">HISTORY</p>
            <h3 className="mt-1 text-sm font-semibold">Legacy valuation history</h3>
          </div>
          <span className="text-xs text-muted">Read-only</span>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-muted">
            No legacy manual valuation entries exist. Future NAV history will come from the automated
            snapshot process rather than manual entry.
          </p>
        ) : (
          <div className="space-y-2">
            {history.map((entry) => (
              <div key={entry.id} className="card flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="font-mono text-xs text-muted">{entry.date}</span>
                <span className="font-mono">{formatCompact(entry.nav)}</span>
                {entry.note && <span className="text-xs text-muted">{entry.note}</span>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
