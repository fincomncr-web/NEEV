"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { CashLedgerEntry, CashEntryType } from "@/lib/portfolio-db";
import { formatCompact } from "@/lib/format";

const ENTRY_TYPES: { value: CashEntryType; label: string }[] = [
  { value: "CONTRIBUTION", label: "Contribution" },
  { value: "WITHDRAWAL", label: "Withdrawal" },
  { value: "DIVIDEND", label: "Dividend" },
  { value: "EXPENSE", label: "Expense" },
  { value: "FEE", label: "Fee" },
  { value: "TAX", label: "Tax" },
  { value: "CORPORATE_ACTION", label: "Corporate action" },
  { value: "ADJUSTMENT", label: "Adjustment" },
];

export default function CashAdminPanel({ passcode }: { passcode: string }) {
  const [entries, setEntries] = useState<CashLedgerEntry[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/portfolio/cash", { headers: { "x-neev-admin": passcode } });
      const d = await r.json();
      setEntries(d.entries ?? []);
      setBalance(typeof d.balance === "number" ? d.balance : null);
      if (!r.ok) setMessage(d.error ?? "Unable to load cash ledger.");
    } catch {
      setMessage("Unable to load cash ledger.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { queueMicrotask(load); }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());
    try {
      const r = await fetch("/api/portfolio/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode, ...body, amount: Number(body.amount) }),
      });
      const d = await r.json();
      if (!r.ok) {
        setMessage(d.error ?? "Failed to record cash movement.");
        return;
      }
      setMessage("Cash movement recorded in the immutable ledger.");
      e.currentTarget.reset();
      await load();
    } catch {
      setMessage("Failed to record cash movement.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs text-muted">Current cash</p>
          <p className="mt-2 text-2xl font-bold">{balance == null ? "Unavailable" : formatCompact(balance)}</p>
          <p className="mt-1 text-xs text-muted">From the controlled cash ledger</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-muted">Ledger entries</p>
          <p className="mt-2 text-2xl font-bold">{entries.length}</p>
          <p className="mt-1 text-xs text-muted">Posted cash movements</p>
        </div>
      </div>

      {message && <div className="mb-6 rounded-md border border-border bg-surface p-4 text-sm text-muted">{message}</div>}

      <form onSubmit={submit} className="card grid gap-4 p-6 sm:grid-cols-2">
        <label className="text-sm">Entry date<input name="entryDate" type="date" required className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
        <label className="text-sm">Type<select name="entryType" required defaultValue="" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"><option value="" disabled>Select</option>{ENTRY_TYPES.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select></label>
        <label className="text-sm">Amount<input name="amount" type="number" step="0.01" required placeholder="Positive inflow / negative outflow" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
        <label className="text-sm">Reference<input name="reference" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
        <label className="sm:col-span-2 text-sm">Notes<textarea name="notes" rows={3} className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
        <button disabled={submitting} className="sm:col-span-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#070908] disabled:opacity-60">{submitting ? "Recording…" : "Record Cash Movement"}</button>
      </form>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">Posted cash ledger</h3><span className="text-xs text-muted">Immutable entries</span></div>
        <div className="card overflow-hidden">
          {loading ? <p className="p-6 text-sm text-muted">Loading…</p> : !entries.length ? <p className="p-6 text-sm text-muted">No cash movements recorded yet.</p> : (
            <div className="divide-y divide-border">
              {entries.map((entry) => (
                <div key={entry.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                  <span className="w-28 font-mono text-xs text-muted">{entry.entryDate}</span>
                  <span className="w-32 text-xs text-muted">{entry.entryType}</span>
                  <span className={`ml-auto font-mono ${entry.amount >= 0 ? "text-up" : "text-down"}`}>{entry.amount >= 0 ? "+" : ""}{formatCompact(entry.amount)}</span>
                  {entry.reference && <span className="w-full truncate text-xs text-muted sm:w-48">{entry.reference}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
