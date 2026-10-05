import type { Metadata } from "next";
import { getNavTimeline } from "@/lib/google-sheet-nav";
import { listHoldings } from "@/lib/portfolio-db";
import { getQuotes } from "@/lib/yahoo";
import { computePerformanceStats } from "@/lib/performance";
import { FUND_CONFIG } from "@/lib/sectors";
import { formatCompact, formatPercent } from "@/lib/format";
import PerformanceChart from "@/components/portfolio/PerformanceChart";
import { getNifty500TriHistory } from "@/lib/nifty-indices";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Performance",
  description: "NEEV portfolio performance, NAV returns and risk statistics.",
};
export const revalidate = 0;

function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {note ? <p className="mt-1 text-[11px] text-muted">{note}</p> : null}
    </div>
  );
}

export default async function PerformancePage() {
  const holdings = await listHoldings();
  const active = holdings.filter((h) => h.status === "active");
  const quotes = active.length
    ? await getQuotes(active.map((h) => h.symbol)).catch(() => [])
    : [];

  const navTimeline = await getNavTimeline(holdings, quotes);
  const { history, liveValue, liveNav } = navTimeline;
  const benchmark = await getNifty500TriHistory(history[0]?.date);
  const stats = computePerformanceStats(
    history.map((x) => ({ date: x.date, value: x.nav }))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="font-label text-[11px] text-accent">PORTFOLIO</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Performance</h1>
        <p className="mt-3 max-w-3xl text-muted">
          NEEV performance is measured from NAV. Base NAV is 1.0000 at the ₹10 lakh starting
          capital, so a NAV of 1.1200 represents a +12.00% return.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Metric
          label="Current NAV"
          value={liveNav.toFixed(4)}
          note="Current fund value ÷ ₹10 lakh base"
        />
        <Metric
          label="Current fund value"
          value={formatCompact(liveValue)}
          note="Live equity + cash"
        />
        <Metric
          label="NAV return"
          value={formatPercent((liveNav - 1) * 100, false)}
          note="Since ₹10 lakh base"
        />
        <Metric
          label="Maximum drawdown"
          value={stats.maxDrawdownPct === null ? "Building history" : formatPercent(stats.maxDrawdownPct, false)}
        />
        <Metric
          label="Annualized volatility"
          value={stats.annualizedVolatilityPct === null ? "Building history" : formatPercent(stats.annualizedVolatilityPct, false)}
          note={stats.frequency ? `Calculated from ${stats.frequency} NAV observations` : "Requires NAV history"}
        />
      </div>

      <section className="mt-8 card p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-label text-[10px] text-accent">NAV PERFORMANCE</p>
            <h2 className="mt-1 text-xl font-semibold">NEEV vs Nifty 500 TRI</h2>
          </div>
          <span className="font-mono text-xs text-muted">Both series rebased to 100 at the comparison start</span>
        </div>

        <PerformanceChart navHistory={history} benchmark={benchmark} />

        <p className="mt-3 text-xs leading-5 text-muted">
          The line chart uses daily NEEV NAV observations and the official Nifty 500 Total Return
          Index. Both series are independently rebased to 100 on the first common trading date, so
          the distance between the lines represents relative cumulative performance.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Benchmark</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Governing benchmark:{" "}
            <span className="font-medium text-foreground">{FUND_CONFIG.benchmarkName}</span>.
            The chart now uses daily Nifty 500 TRI observations from NSE Indices when the source is
            available. The benchmark is never substituted with the price index.
          </p>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold">Methodology</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Live NAV is current fund value divided by the fixed ₹10 lakh base. The performance
            curve therefore represents cumulative NAV return, while drawdown and volatility use
            the available daily NAV observations.
          </p>
        </div>
      </section>
    </div>
  );
}
