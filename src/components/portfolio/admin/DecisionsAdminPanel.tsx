"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Decision, InvestmentCase } from "@/lib/portfolio-db";
import { SECTORS } from "@/lib/sectors";

export default function DecisionsAdminPanel({ passcode }: { passcode: string }) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [cases, setCases] = useState<InvestmentCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [dRes, cRes] = await Promise.all([
        fetch("/api/portfolio/decisions", { cache: "no-store" }),
        fetch("/api/portfolio/cases", { cache: "no-store" }),
      ]);
      const [d, c] = await Promise.all([dRes.json(), cRes.json()]);
      setDecisions(d.decisions ?? []);
      setCases(c.cases ?? []);
    } catch {
      setMessage({ type: "error", text: "Unable to load the IC register." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(load);
  }, []);

  const buyCases = useMemo(() => cases.filter((c) => c.status !== "WITHDRAWN"), [cases]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const form = e.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    const status = String(body.status ?? "DRAFT");
    const votesFor = body.votesFor === "" ? null : Number(body.votesFor);
    const votesAgainst = body.votesAgainst === "" ? null : Number(body.votesAgainst);
    const abstentions = body.abstentions === "" ? null : Number(body.abstentions);

    try {
      const r = await fetch("/api/portfolio/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passcode,
          date: body.date,
          sector: body.sector,
          companyName: body.companyName,
          symbol: body.symbol,
          decision: body.decision,
          status,
          caseId: body.caseId || null,
          meetingReference: body.meetingReference || null,
          proposedWeight: body.proposedWeight === "" ? null : Number(body.proposedWeight),
          votesFor,
          votesAgainst,
          abstentions,
          quorum: body.quorum === "" ? null : Number(body.quorum),
          voteCount: votesFor != null && votesAgainst != null ? `${votesFor}-${votesAgainst}` : null,
          riskNotes: body.riskNotes || null,
          thesisBreakers: body.thesisBreakers || null,
          rationale: body.rationale,
          approvedAt: status === "APPROVED" ? new Date().toISOString() : null,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to save decision." });
        return;
      }
      setMessage({ type: "success", text: "IC decision recorded in the controlled register." });
      form.reset();
      await load();
    } catch {
      setMessage({ type: "error", text: "Failed to save decision." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 rounded-md border border-accent/30 bg-accent/5 p-4 text-sm leading-6 text-muted">
        <span className="font-medium text-foreground">Controlled IC register.</span> A trade cannot
        be posted unless it references an APPROVED decision matching the trade symbol and direction.
        Decisions are append-only; use a new amended or superseding record rather than editing history.
      </div>

      {message && <div className={`mb-6 rounded-md border px-4 py-3 text-sm ${message.type === "error" ? "border-down/30 bg-down/5 text-down" : "border-up/30 bg-up/5 text-up"}`}>{message.text}</div>}

      <form onSubmit={submit} className="card grid gap-4 p-6">
        <div className="grid gap-4 sm:grid-cols-4">
          <label className="text-sm">Decision date<input type="date" name="date" required className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          <label className="text-sm">Sector<select name="sector" required defaultValue="" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"><option value="" disabled>Select</option>{SECTORS.map((s) => <option key={s.slug} value={s.name}>{s.name}</option>)}</select></label>
          <label className="text-sm">Company<input name="companyName" required className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          <label className="text-sm">Symbol<input name="symbol" required placeholder="RELIANCE.NS" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <label className="text-sm">Decision<select name="decision" required defaultValue="" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"><option value="" disabled>Select</option><option>BUY</option><option>HOLD</option><option>SELL</option></select></label>
          <label className="text-sm">Status<select name="status" required defaultValue="DRAFT" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"><option>DRAFT</option><option>UNDER_REVIEW</option><option>APPROVED</option><option>REJECTED</option><option>AMENDED</option><option>SUPERSEDED</option></select></label>
          <label className="text-sm">Investment case<select name="caseId" defaultValue="" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"><option value="">No linked case</option>{buyCases.map((c) => <option key={c.id} value={c.id}>{c.companyName} · {c.symbol} · {c.status}</option>)}</select></label>
          <label className="text-sm">Proposed weight<input name="proposedWeight" type="number" min="0" max="1" step="0.001" placeholder="0.08" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
        </div>

        <div className="grid gap-4 sm:grid-cols-5">
          <label className="text-sm">Meeting ref<input name="meetingReference" placeholder="IC-2026-10-01" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          <label className="text-sm">Quorum<input name="quorum" type="number" min="1" step="1" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          <label className="text-sm">Votes for<input name="votesFor" type="number" min="0" step="1" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          <label className="text-sm">Votes against<input name="votesAgainst" type="number" min="0" step="1" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          <label className="text-sm">Abstentions<input name="abstentions" type="number" min="0" step="1" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
        </div>

        <label className="text-sm">Rationale<textarea name="rationale" required rows={5} placeholder="Decision rationale, variant perception and portfolio action." className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Risk notes<textarea name="riskNotes" rows={3} className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          <label className="text-sm">Thesis-break conditions<textarea name="thesisBreakers" rows={3} className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
        </div>

        <button disabled={submitting} className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#070908] disabled:opacity-60">{submitting ? "Recording…" : "Record IC decision"}</button>
      </form>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">Decision register</h3><span className="text-xs text-muted">{decisions.length} records</span></div>
        {loading ? <p className="text-sm text-muted">Loading…</p> : !decisions.length ? <p className="text-sm text-muted">No decisions recorded yet.</p> : <div className="space-y-3">{decisions.map((d) => <div key={d.id} className="card p-4 text-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-medium">{d.decision} · {d.companyName ?? d.symbol ?? d.sector}</p><p className="mt-1 text-xs text-muted">{d.date} · {d.sector}{d.meetingReference ? ` · ${d.meetingReference}` : ""}{d.voteCount ? ` · ${d.voteCount}` : ""}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${d.status === "APPROVED" ? "bg-up/10 text-up" : d.status === "REJECTED" ? "bg-down/10 text-down" : "bg-accent/10 text-accent"}`}>{d.status}</span></div><p className="mt-2 leading-6 text-muted">{d.rationale}</p></div>)}</div>}
      </section>
    </div>
  );
}
