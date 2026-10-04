"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { NavEntry } from "@/lib/portfolio-db";

export default function NavAdminPanel({ passcode }: { passcode: string }) {
  const [entries, setEntries] = useState<NavEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio/nav");
      const data = await res.json();
      setEntries((data.nav ?? []).slice().reverse());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => load());
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/portfolio/nav", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passcode,
          date: formData.get("date"),
          nav: formData.get("nav"),
          note: formData.get("note"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to save." });
        return;
      }
      setMessage({ type: "success", text: "NAV entry saved." });
      form.reset();
      await load();
    } catch {
      setMessage({ type: "error", text: "Failed to save. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 rounded-md border border-accent/30 bg-accent/5 p-4 text-sm text-muted">
        <span className="font-medium text-foreground">Current NAV is now computed automatically</span>{" "}
        from live holdings and market quotes - it updates the moment a position is added,
        edited, or exited (see <code className="font-mono text-accent">src/lib/fund-engine.ts</code>).
        Entries logged here fill in the historical trend line and are used only when no{" "}
        <code className="font-mono text-accent">FUND_NAV_SHEET_CSV_URL</code> is configured.
      </div>
      {message && (
        <div
          className={`mb-6 rounded-md border px-4 py-3 text-sm ${
            message.type === "error"
              ? "border-down/30 bg-down/5 text-down"
              : "border-up/30 bg-up/5 text-up"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card grid gap-4 p-6 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Date</label>
          <input
            type="date"
            name="date"
            required
            className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">NAV Value</label>
          <input
            type="number"
            name="nav"
            step="any"
            required
            placeholder="e.g. 1023450"
            className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Note (optional)</label>
          <input
            type="text"
            name="note"
            placeholder="e.g. Post-rebalance"
            className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="sm:col-span-3 mt-1 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#070908] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save NAV Entry"}
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-foreground">Logged NAV History</h3>
        {loading ? (
          <p className="mt-3 text-sm text-muted">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No NAV entries yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {entries.map((e) => (
              <div key={e.id} className="card flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-mono text-xs text-muted">{e.date}</span>
                <span className="font-mono text-foreground">{e.nav.toLocaleString("en-IN")}</span>
                {e.note && <span className="text-xs text-muted">{e.note}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
