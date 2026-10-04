"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCompact } from "@/lib/format";

type Summary = {
  cashBalance: number | null;
  holdings: { active: number; exited: number };
  transactions: number;
  decisions: { total: number; draft: number; approved: number };
  cases: { total: number; draft: number; approved: number };
  reports: { total: number; published: number; inReview: number };
  industryContent: number;
  readiness: { supabase: boolean; auth: boolean; adminSession: boolean; ledger: boolean };
};

const KPI = [
  { key: "cash", label: "Cash", note: "Controlled cash ledger" },
  { key: "holdings", label: "Active holdings", note: "Derived from posted trades" },
  { key: "decisions", label: "Approved IC", note: "Governed trade approvals" },
  { key: "cases", label: "Investment cases", note: "Research → thesis bridge" },
] as const;

export default function AdminOverviewPanel({ passcode }: { passcode: string }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portfolio/admin/summary", { cache: "no-store", headers: { "x-neev-admin": passcode } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to load admin summary.");
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load admin summary.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(load);
  }, []);

  if (loading) return <p className="text-sm text-muted">Loading control room…</p>;

  if (error) {
    return (
      <div className="rounded-md border border-down/30 bg-down/5 p-4 text-sm text-down">
        {error}
      </div>
    );
  }

  if (!summary) return null;

  const checklist = [
    { label: "Supabase", ok: summary.readiness.supabase, detail: "Database connection" },
    { label: "Admin session", ok: summary.readiness.adminSession, detail: "Server-side passcode session" },
    { label: "Member auth", ok: summary.readiness.auth, detail: "Supabase member sign-in" },
    { label: "Trade ledger", ok: summary.readiness.ledger, detail: "Database transaction tables" },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI.map((kpi) => {
          const value =
            kpi.key === "cash"
              ? summary.cashBalance == null ? "—" : formatCompact(summary.cashBalance)
              : kpi.key === "holdings"
                ? String(summary.holdings.active)
                : kpi.key === "decisions"
                  ? String(summary.decisions.approved)
                  : String(summary.cases.total);
          return (
            <div key={kpi.key} className="card p-5">
              <p className="text-xs text-muted">{kpi.label}</p>
              <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
              <p className="mt-1 text-xs text-muted">{kpi.note}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-label text-[10px] text-accent">OPERATING QUEUE</p>
              <h2 className="mt-1 text-xl font-semibold">What needs attention</h2>
            </div>
            <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] text-muted">
              Admin control room
            </span>
          </div>

          <div className="mt-5 divide-y divide-border">
            <div className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium">Draft IC decisions</p>
                <p className="text-xs text-muted">Complete governance before trading.</p>
              </div>
              <Link href="/portfolio/admin" className="font-mono text-sm text-accent">
                {summary.decisions.draft}
              </Link>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium">Cases awaiting approval</p>
                <p className="text-xs text-muted">Thesis and valuation inputs still in workflow.</p>
              </div>
              <span className="font-mono text-sm text-accent">{summary.cases.draft}</span>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium">Reports in review</p>
                <p className="text-xs text-muted">Research files not yet published.</p>
              </div>
              <span className="font-mono text-sm text-accent">{summary.reports.inReview}</span>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium">Industry sections</p>
                <p className="text-xs text-muted">Published research layer cells.</p>
              </div>
              <span className="font-mono text-sm text-accent">{summary.industryContent}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <p className="font-label text-[10px] text-accent">SYSTEM READINESS</p>
          <h2 className="mt-1 text-xl font-semibold">Control checks</h2>
          <div className="mt-5 space-y-3">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-[11px] text-muted">{item.detail}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${item.ok ? "bg-up/10 text-up" : "bg-down/10 text-down"}`}>
                  {item.ok ? "READY" : "CHECK"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs text-muted">Posted trades</p>
          <p className="mt-2 text-xl font-semibold">{summary.transactions}</p>
          <p className="mt-1 text-xs text-muted">Immutable transaction records</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-muted">Published reports</p>
          <p className="mt-2 text-xl font-semibold">{summary.reports.published}</p>
          <p className="mt-1 text-xs text-muted">Visible in the NEEV Library</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-muted">Exited positions</p>
          <p className="mt-2 text-xl font-semibold">{summary.holdings.exited}</p>
          <p className="mt-1 text-xs text-muted">Historical positions retained</p>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={load}
          className="rounded-md border border-border px-4 py-2 text-sm text-muted hover:border-accent hover:text-foreground"
        >
          Refresh control room
        </button>
      </div>
    </div>
  );
}
