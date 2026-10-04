import type { Metadata } from "next";
import { listNavHistory } from "@/lib/portfolio-db";
import { computePerformanceStats } from "@/lib/performance";
import { FUND_CONFIG } from "@/lib/sectors";
import { formatCompact, formatPercent } from "@/lib/format";
import PerformanceChart from "@/components/portfolio/PerformanceChart";

export const metadata: Metadata = {
  title: "Performance",
  description: "NEEV portfolio performance, methodology and risk statistics.",
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
  const history = await listNavHistory();
  const stats = computePerformanceStats(history.map((x) => ({ date: x.date, value: x.nav })));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="font-label text-[11px] text-accent">PORTFOLIO</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Performance</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Performance is shown from the available NEEV valuation history. Benchmark-relative
          statistics will be published once a verified Nifty 500 TRI data series is connected.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Published NAV / valuation" value={history.length ? formatCompact(history[history.length - 1].nav) : "Not available"} note={history.length ? `As of ${history[history.length - 1].date}` : "No approved valuation history"} />
        <Metric label="Total return" value={stats.totalReturnPct === null ? "Not available" : formatPercent(stats.totalReturnPct, false)} note="From first recorded valuation" />
        <Metric label="Annualized return" value={stats.annualizedReturnPct === null ? "Building history" : formatPercent(stats.annualizedReturnPct, false)} />
        <Metric label="Maximum drawdown" value={stats.maxDrawdownPct === null ? "Building history" : formatPercent(stats.maxDrawdownPct, false)} /><Metric label="Annualized volatility" value={stats.annualizedVolatilityPct === null ? "Not available" : formatPercent(stats.annualizedVolatilityPct, false)} note={stats.frequency ? `Calculated from ${stats.frequency} observations` : undefined} />
      </div>

      <section className="mt-8 card p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold">NEEV performance history</h2>
          <p className="mt-1 text-xs text-muted">{stats.observations} valuation observations</p>
        </div>
        <PerformanceChart navHistory={history} benchmark={[]} />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Benchmark</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Governing benchmark: <span className="font-medium text-foreground">{FUND_CONFIG.benchmarkName}</span>.
            The website deliberately does not substitute the Nifty 500 price index for TRI because
            a price index excludes constituent dividends.
          </p>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Methodology</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Return statistics are based only on published, approved valuation observations. TWR/MWR, benchmark-relative attribution, corporate-action treatment and external-flow adjustments are withheld until the controlled transaction and cash ledgers contain sufficient history.
          </p>
        </div>
      </section>
    </div>
  );
}
