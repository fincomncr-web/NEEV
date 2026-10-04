"use client";

import { useEffect, useMemo, useState } from "react";
import type { Transaction } from "@/lib/portfolio-db";
import { formatCompact, formatPrice } from "@/lib/format";

export default function TransactionsAdminPanel({ passcode }: { passcode: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState<"ALL" | "BUY" | "SELL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portfolio/transactions", { cache: "no-store", headers: { "x-neev-admin": passcode } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to load transaction ledger.");
      setTransactions(data.transactions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load transaction ledger.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(load);
  }, []);

  const filtered = useMemo(() => {
    const needle = symbol.trim().toUpperCase();
    return transactions.filter((t) => (!needle || t.symbol.toUpperCase().includes(needle)) && (type === "ALL" || t.transactionType === type));
  }, [transactions, symbol, type]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-xs text-muted">Filter symbol</label>
          <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="RELIANCE.NS" className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="rounded-md border border-border bg-surface px-3 py-2 text-sm">
            <option value="ALL">All trades</option>
            <option value="BUY">Buys</option>
            <option value="SELL">Sells</option>
          </select>
        </div>
        <button onClick={load} type="button" className="rounded-md border border-border px-4 py-2 text-sm text-muted hover:border-accent hover:text-foreground">Refresh</button>
      </div>

      {error && <div className="mb-5 rounded-md border border-down/30 bg-down/5 p-4 text-sm text-down">{error}</div>}

      <div className="card overflow-x-auto">
        {loading ? <p className="p-6 text-sm text-muted">Loading transaction ledger…</p> : !filtered.length ? <p className="p-6 text-sm text-muted">No transactions match the current filter.</p> : (
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="border-b border-border bg-surface-2">
              <tr>
                {["Trade date","Symbol","Side","Qty","Price","Gross","Fees + taxes","Net cash","Decision"].map((h) => <th key={h} className="px-4 py-3 font-medium text-muted">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-surface-2/50">
                  <td className="px-4 py-3 font-mono text-muted">{t.tradeDate}</td>
                  <td className="px-4 py-3"><span className="font-medium">{t.symbol}</span><br /><span className="text-[10px] text-muted">{t.companyName}</span></td>
                  <td className={`px-4 py-3 font-semibold ${t.transactionType === "BUY" ? "text-up" : "text-down"}`}>{t.transactionType}</td>
                  <td className="px-4 py-3 font-mono">{t.quantity}</td>
                  <td className="px-4 py-3 font-mono">{formatPrice(t.price)}</td>
                  <td className="px-4 py-3 font-mono">{formatCompact(t.grossAmount)}</td>
                  <td className="px-4 py-3 font-mono">{formatCompact(t.fees + t.taxes)}</td>
                  <td className={`px-4 py-3 font-mono ${t.netCashFlow >= 0 ? "text-up" : "text-down"}`}>{t.netCashFlow >= 0 ? "+" : ""}{formatCompact(t.netCashFlow)}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-muted">{t.decisionId ? t.decisionId.slice(0, 8) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
