"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Decision, Holding } from "@/lib/portfolio-db";
import { SECTORS } from "@/lib/sectors";
import { formatCompact } from "@/lib/format";

const blankSell = { holdingId: "", quantity: "", price: "", date: "", decisionId: "", fees: "0", taxes: "0" };

export default function HoldingsAdminPanel({ passcode }: { passcode: string }) {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [sell, setSell] = useState(blankSell);

  async function load() {
    setLoading(true);
    try {
      const [h, d] = await Promise.all([
        fetch("/api/portfolio/holdings", { cache: "no-store" }),
        fetch("/api/portfolio/decisions", { cache: "no-store" }),
      ]);
      const [hd, dd] = await Promise.all([h.json(), d.json()]);
      setHoldings(hd.holdings ?? []);
      setDecisions((dd.decisions ?? []).filter((x: Decision) => x.status === "APPROVED"));
    } catch {
      setMessage({ type: "error", text: "Unable to load portfolio control data." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(load);
  }, []);

  const activeHoldings = useMemo(() => holdings.filter((h) => h.status === "active"), [holdings]);
  const selectedHolding = activeHoldings.find((h) => h.id === sell.holdingId);
  const buyDecisions = decisions.filter((d) => d.decision === "BUY" && d.symbol);
  const sellDecisions = decisions.filter((d) => d.decision === "SELL" && d.symbol);

  async function postBuy(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const r = await fetch("/api/portfolio/holdings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passcode,
          symbol: body.symbol,
          companyName: body.companyName,
          sector: body.sector,
          entryDate: body.entryDate,
          quantity: Number(body.quantity),
          avgCost: Number(body.avgCost),
          fees: Number(body.fees || 0),
          taxes: Number(body.taxes || 0),
          decisionId: body.decisionId,
          notes: body.notes,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to post buy trade." });
        return;
      }
      setMessage({ type: "success", text: "BUY trade posted. Cash and position were updated atomically." });
      e.currentTarget.reset();
      await load();
    } catch {
      setMessage({ type: "error", text: "Failed to post buy trade." });
    } finally {
      setSubmitting(false);
    }
  }

  async function postSell(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const r = await fetch("/api/portfolio/holdings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passcode,
          id: sell.holdingId,
          decisionId: sell.decisionId,
          exitPrice: Number(sell.price),
          quantity: sell.quantity === "" ? undefined : Number(sell.quantity),
          exitDate: sell.date,
          fees: Number(sell.fees || 0),
          taxes: Number(sell.taxes || 0),
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to post sell trade." });
        return;
      }
      setMessage({ type: "success", text: "SELL trade posted. Position and cash ledger were updated atomically." });
      setSell(blankSell);
      await load();
    } catch {
      setMessage({ type: "error", text: "Failed to post sell trade." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 rounded-md border border-accent/30 bg-accent/5 p-4 text-sm leading-6 text-muted">
        <span className="font-medium text-foreground">Transaction-controlled portfolio.</span> Positions
        are derived from the immutable trade ledger. BUYs require an approved BUY decision and
        available cash; SELLs require an approved SELL decision and cannot exceed the current position.
      </div>

      {message && (
        <div className={`mb-6 rounded-md border px-4 py-3 text-sm ${message.type === "error" ? "border-down/30 bg-down/5 text-down" : "border-up/30 bg-up/5 text-up"}`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={postBuy} className="card grid gap-4 p-6">
          <div>
            <p className="font-label text-[10px] text-accent">BUY</p>
            <h2 className="mt-1 text-xl font-semibold">Open / add to a position</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">Symbol<input name="symbol" required placeholder="RELIANCE.NS" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
            <label className="text-sm">Company<input name="companyName" required placeholder="Reliance Industries" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
            <label className="text-sm">Sector<select name="sector" required defaultValue="" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"><option value="" disabled>Select</option>{SECTORS.map((s) => <option key={s.slug} value={s.name}>{s.name}</option>)}</select></label>
            <label className="text-sm">Trade date<input name="entryDate" type="date" required className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
            <label className="text-sm">Quantity<input name="quantity" type="number" min="0.000001" step="any" required className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
            <label className="text-sm">Price<input name="avgCost" type="number" min="0.000001" step="any" required className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
            <label className="text-sm">Fees<input name="fees" type="number" min="0" step="any" defaultValue="0" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
            <label className="text-sm">Taxes<input name="taxes" type="number" min="0" step="any" defaultValue="0" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          </div>
          <label className="text-sm">Approved BUY decision<select name="decisionId" required defaultValue="" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"><option value="" disabled>Select decision</option>{buyDecisions.map((d) => <option key={d.id} value={d.id}>{d.companyName ?? d.symbol} · {d.date} · {d.proposedWeight != null ? `${(d.proposedWeight * 100).toFixed(1)}%` : "No weight"}</option>)}</select></label>
          <label className="text-sm">Trade note<textarea name="notes" rows={2} placeholder="Execution note / broker reference" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          <button disabled={submitting || !buyDecisions.length} className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#070908] disabled:opacity-50">{submitting ? "Posting…" : "Post BUY trade"}</button>
          {!buyDecisions.length && <p className="text-xs text-muted">Create and approve a BUY IC decision first.</p>}
        </form>

        <form onSubmit={postSell} className="card grid gap-4 p-6">
          <div>
            <p className="font-label text-[10px] text-accent">SELL</p>
            <h2 className="mt-1 text-xl font-semibold">Exit / partially exit</h2>
          </div>
          <label className="text-sm">Holding<select value={sell.holdingId} onChange={(e) => setSell((v) => ({ ...v, holdingId: e.target.value, decisionId: "" }))} required className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"><option value="">Select position</option>{activeHoldings.map((h) => <option key={h.id} value={h.id}>{h.companyName} · {h.symbol} · {h.quantity} shares</option>)}</select></label>
          {selectedHolding && <p className="rounded-md border border-border bg-surface-2/40 p-3 text-xs text-muted">Available: <span className="font-medium text-foreground">{selectedHolding.quantity}</span> shares · average cost {formatCompact(selectedHolding.avgCost * selectedHolding.quantity)}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">Quantity<input value={sell.quantity} onChange={(e) => setSell((v) => ({ ...v, quantity: e.target.value }))} type="number" min="0.000001" step="any" placeholder="Blank = full exit" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
            <label className="text-sm">Exit price<input value={sell.price} onChange={(e) => setSell((v) => ({ ...v, price: e.target.value }))} type="number" min="0.000001" step="any" required className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
            <label className="text-sm">Trade date<input value={sell.date} onChange={(e) => setSell((v) => ({ ...v, date: e.target.value }))} type="date" required className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
            <label className="text-sm">Approved SELL decision<select value={sell.decisionId} onChange={(e) => setSell((v) => ({ ...v, decisionId: e.target.value }))} required className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"><option value="">Select decision</option>{sellDecisions.filter((d) => d.symbol?.toUpperCase() === selectedHolding?.symbol.toUpperCase()).map((d) => <option key={d.id} value={d.id}>{d.date} · {d.companyName ?? d.symbol}</option>)}</select></label>
            <label className="text-sm">Fees<input value={sell.fees} onChange={(e) => setSell((v) => ({ ...v, fees: e.target.value }))} type="number" min="0" step="any" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
            <label className="text-sm">Taxes<input value={sell.taxes} onChange={(e) => setSell((v) => ({ ...v, taxes: e.target.value }))} type="number" min="0" step="any" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          </div>
          <button disabled={submitting || !activeHoldings.length} className="rounded-md border border-accent bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent disabled:opacity-50">{submitting ? "Posting…" : "Post SELL trade"}</button>
          {!activeHoldings.length && <p className="text-xs text-muted">There are no active positions to exit.</p>}
        </form>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Current positions</h3>
          <span className="text-xs text-muted">{activeHoldings.length} active</span>
        </div>
        {loading ? <p className="text-sm text-muted">Loading…</p> : !activeHoldings.length ? <p className="text-sm text-muted">No active positions.</p> : <div className="grid gap-3 md:grid-cols-2">{activeHoldings.map((h) => <div key={h.id} className="card p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{h.companyName}</p><p className="font-mono text-xs text-muted">{h.symbol}</p></div><span className="rounded-full bg-up/10 px-2 py-1 text-[10px] font-semibold text-up">ACTIVE</span></div><div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><p className="text-muted">Shares</p><p className="mt-1 font-mono">{h.quantity}</p></div><div><p className="text-muted">Avg cost</p><p className="mt-1 font-mono">{h.avgCost.toFixed(2)}</p></div><div><p className="text-muted">Cost basis</p><p className="mt-1 font-mono">{formatCompact(h.buyCash)}</p></div><div><p className="text-muted">Sector</p><p className="mt-1">{h.sector}</p></div></div></div>)}</div>}
      </section>
    </div>
  );
}
