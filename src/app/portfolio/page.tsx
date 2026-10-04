import type { Metadata } from "next";
import Link from "next/link";
import { getQuotes } from "@/lib/yahoo";
import { getNavTimeline } from "@/lib/google-sheet-nav";
import { listDecisions, listHoldings } from "@/lib/portfolio-db";
import { computeFundBreakdown, totalReturnPct, withLiveMetrics } from "@/lib/fund-engine";
import { FUND_CONFIG, SECTORS } from "@/lib/sectors";
import { formatCompact, formatPercent, formatPrice, formatSigned } from "@/lib/format";
import PerformanceChart from "@/components/portfolio/PerformanceChart";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "NEEV portfolio overview, holdings, allocation and Investment Committee activity.",
};
export const revalidate = 0;

export default async function PortfolioPage() {
  const [holdings, decisions] = await Promise.all([listHoldings(), listDecisions()]);
  const activeHoldings = holdings.filter((h) => h.status === "active");
  const quotes = activeHoldings.length
    ? await getQuotes(activeHoldings.map((h) => h.symbol)).catch(() => [])
    : [];
  const { history, liveValue } = await getNavTimeline(holdings, quotes);
  const breakdown = computeFundBreakdown(holdings, quotes);
  const totalReturn = history.length > 1 ? totalReturnPct(liveValue) : null;
  const holdingsWithLive = withLiveMetrics(activeHoldings, quotes);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="font-label text-[11px] text-accent">PORTFOLIO</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Portfolio Overview</h1>
        <p className="mt-3 max-w-3xl text-muted">
          NEEV's student-managed Indian equity portfolio, governed by the Fund Charter and supported
          by fundamental research, valuation discipline and Investment Committee oversight.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs text-muted">
          <span className="rounded-md border border-border px-3 py-1.5">Benchmark: {FUND_CONFIG.benchmarkName}</span>
          <span className="rounded-md border border-border px-3 py-1.5">Horizon: {FUND_CONFIG.horizonLabel}</span>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Fund value", formatCompact(liveValue)],
          ["Since inception", formatPercent(totalReturn, false)],
          ["Equity value", formatCompact(breakdown.holdingsValue)],
          ["Cash", formatPercent(breakdown.cashPct, false)],
          ["Holdings", String(breakdown.activeNames)],
        ].map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-2 text-xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Link href="/performance" className="card p-5 hover:border-accent"><p className="font-semibold">Performance</p><p className="mt-1 text-xs text-muted">Returns, drawdown and valuation history.</p></Link>
        <Link href="/risk" className="card p-5 hover:border-accent"><p className="font-semibold">Risk &amp; Compliance</p><p className="mt-1 text-xs text-muted">Charter limits and live exposure checks.</p></Link>
        <Link href="/portfolio/register" className="card p-5 hover:border-accent"><p className="font-semibold">IC Decision Register</p><p className="mt-1 text-xs text-muted">Published Investment Committee decisions.</p></Link>
      </div>

      <section className="mt-8 card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-label text-[10px] text-accent">PERFORMANCE</p>
            <h2 className="mt-1 text-xl font-semibold">NEEV valuation history</h2>
          </div>
          <span className="text-xs text-muted">Nifty 500 TRI comparison withheld until a verified total-return series is connected</span>
        </div>
        <div className="mt-4">
          <PerformanceChart navHistory={history} benchmark={[]} />
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="font-label text-[10px] text-accent">EXPOSURE</p>
            <h2 className="mt-1 text-xl font-semibold">Sector allocation</h2>
          </div>
          <Link href="/risk" className="text-sm text-accent hover:underline">Risk center →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {SECTORS.map((sector) => {
            const item = breakdown.bySector.find((x) => x.sector === sector.name);
            return (
              <Link key={sector.slug} href="/industries" className="card p-5 hover:border-accent">
                <p className="text-sm font-medium text-foreground">{sector.name}</p>
                <p className="mt-3 text-2xl font-bold">{item ? formatPercent(item.weightPct) : "0.0%"}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="font-label text-[10px] text-accent">HOLDINGS</p>
            <h2 className="mt-1 text-xl font-semibold">Current positions</h2>
          </div>
          <span className="text-xs text-muted">Market prices where available · valuation status is disclosed below</span>
        </div>
        <div className="card overflow-x-auto p-0">
          {holdingsWithLive.length ? (
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-border text-xs text-muted">
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Sector</th>
                <th className="px-4 py-3 font-medium text-right">Weight</th>
                <th className="px-4 py-3 font-medium text-right">Avg Cost</th>
                <th className="px-4 py-3 font-medium text-right">LTP</th>
                <th className="px-4 py-3 font-medium text-right">P&amp;L</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {holdingsWithLive.map((h) => {
                  const weight = liveValue > 0 ? (h.currentValue / liveValue) * 100 : 0;
                  return (
                    <tr key={h.id}>
                      <td className="px-4 py-3"><p className="font-medium">{h.companyName}</p><p className="font-mono text-xs text-muted">{h.symbol}</p></td>
                      <td className="px-4 py-3 text-muted">{h.sector}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatPercent(weight, false)}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatPrice(h.avgCost)}</td>
                      <td className="px-4 py-3 text-right font-mono">{h.ltp !== null ? formatPrice(h.ltp) : "Unavailable"}</td>
                      <td className={`px-4 py-3 text-right font-mono ${h.pnlPct === null ? "text-muted" : h.pnlPct >= 0 ? "text-up" : "text-down"}`}>
                        {h.pnlPct !== null ? formatSigned(h.pnlPct) + "%" : "Unavailable"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="p-8 text-center text-sm text-muted">No active holdings have been published yet.</p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div><p className="font-label text-[10px] text-accent">GOVERNANCE</p><h2 className="mt-1 text-xl font-semibold">Recent IC decisions</h2></div>
          <Link href="/portfolio/register" className="text-sm text-accent hover:underline">Full register →</Link>
        </div>
        <div className="card divide-y divide-border">
          {decisions.slice(0, 6).map((d) => (
            <div key={d.id} className="flex flex-wrap items-center gap-3 px-4 py-4 text-sm">
              <span className="w-24 font-mono text-xs text-muted">{d.date}</span>
              <span className={d.decision === "BUY" ? "text-up" : d.decision === "SELL" ? "text-down" : "text-muted"}>{d.decision}</span>
              <span className="font-medium">{d.companyName ?? d.sector}</span>
              <span className="min-w-[200px] flex-1 truncate text-muted">{d.rationale || "Rationale not published."}</span>
            </div>
          ))}
          {!decisions.length ? <p className="p-6 text-sm text-muted">No Investment Committee decisions have been published yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
