import type { Metadata } from "next";
import { getQuotes } from "@/lib/yahoo";
import { listHoldings } from "@/lib/portfolio-db";
import { computeCharterStatus, computeFundBreakdown } from "@/lib/fund-engine";
import { FUND_CONFIG } from "@/lib/sectors";
import { formatPercent, formatCompact } from "@/lib/format";

export const metadata: Metadata = {
  title: "Risk",
  description: "NEEV portfolio concentration, cash and Fund Charter risk controls.",
};
export const revalidate = 0;

function Status({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={ok ? "rounded-full bg-accent/10 px-2.5 py-1 text-xs text-accent" : "rounded-full bg-red-500/10 px-2.5 py-1 text-xs text-red-400"}>
      {label}
    </span>
  );
}

export default async function RiskPage() {
  const holdings = await listHoldings();
  const active = holdings.filter((h) => h.status === "active");
  const quotes = active.length ? await getQuotes(active.map((h) => h.symbol)).catch(() => []) : [];
  const breakdown = computeFundBreakdown(holdings, quotes);
  const status = computeCharterStatus(breakdown);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="font-label text-[11px] text-accent">PORTFOLIO</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Risk &amp; Compliance</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          A live view of portfolio exposures against the limits documented in the NEEV Fund Charter.
          These are monitoring controls, not regulatory risk ratings.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5"><p className="text-xs text-muted">Holdings</p><p className="mt-2 text-2xl font-bold">{breakdown.activeNames}</p><p className="mt-1 text-xs text-muted">Target {FUND_CONFIG.minNamesAtFullDeployment}–{FUND_CONFIG.maxNamesAtFullDeployment}</p><Status ok={status.holdings.status === "within"} label={status.holdings.status === "within" ? "Within range" : "Review"} /></div>
        <div className="card p-5"><p className="text-xs text-muted">Largest position</p><p className="mt-2 text-2xl font-bold">{formatPercent(breakdown.maxSingleStockPct, false).replace("+","")}</p><p className="mt-1 text-xs text-muted">{breakdown.maxSingleStockSymbol ?? "No active holdings"}</p><Status ok={status.singleStock.status === "within"} label={status.singleStock.status === "within" ? "Within 10%" : "Above limit"} /></div>
        <div className="card p-5"><p className="text-xs text-muted">Largest sector</p><p className="mt-2 text-2xl font-bold">{formatPercent(breakdown.maxSectorPct, false).replace("+","")}</p><p className="mt-1 text-xs text-muted">{breakdown.maxSector ?? "No active holdings"}</p><Status ok={status.sector.status === "within"} label={status.sector.status === "within" ? "Within 30%" : "Above limit"} /></div>
        <div className="card p-5"><p className="text-xs text-muted">Cash</p><p className="mt-2 text-2xl font-bold">{formatPercent(breakdown.cashPct, false).replace("+","")}</p><p className="mt-1 text-xs text-muted">{formatCompact(breakdown.cash)}</p><Status ok={status.cash.status === "within" && status.leverage.status === "within"} label={status.leverage.status === "breach" ? "Leverage breach" : status.cash.status === "within" ? "Within range" : "Review"} /></div>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card overflow-hidden">
          <div className="border-b border-border p-5"><h2 className="font-semibold">Sector exposure</h2></div>
          <div className="divide-y divide-border">
            {breakdown.bySector.length === 0 ? (
              <p className="p-5 text-sm text-muted">No active holdings yet.</p>
            ) : breakdown.bySector.map((item) => (
              <div key={item.sector} className="flex items-center justify-between gap-4 p-5">
                <span className="text-sm text-foreground">{item.sector}</span>
                <span className="font-mono text-sm">{formatPercent(item.weightPct, false).replace("+","")}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold">Data quality</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Live market prices are required for precise exposure calculations.
          </p>
          {breakdown.missingQuoteSymbols.length ? (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
              Missing quotes: {breakdown.missingQuoteSymbols.join(", ")}
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-accent/20 bg-accent/5 p-4 text-sm text-accent">
              All active holdings have a current quote.
            </div>
          )}
          <div className="mt-6 space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted">Quote coverage</span><span>{breakdown.quoteCoveragePct.toFixed(1)}%</span></div>
            <div className="flex justify-between"><span className="text-muted">Initial position limit</span><span>8%</span></div>
            <div className="flex justify-between"><span className="text-muted">Single stock limit</span><span>10%</span></div>
            <div className="flex justify-between"><span className="text-muted">Sector limit</span><span>30%</span></div>
            <div className="flex justify-between"><span className="text-muted">Cash range</span><span>0–5%</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}
