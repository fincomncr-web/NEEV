import Link from "next/link";
import type { Metadata } from "next";
import PerformanceChart from "@/components/portfolio/PerformanceChart";
import { getQuotes } from "@/lib/yahoo";
import { getNavTimeline } from "@/lib/google-sheet-nav";
import { listDecisions, listHoldings } from "@/lib/portfolio-db";
import { computeFundBreakdown, totalReturnPct } from "@/lib/fund-engine";
import { FUND_CONFIG, SECTORS } from "@/lib/sectors";
import { formatCompact, formatPercent } from "@/lib/format";

export const metadata: Metadata = {
  title: "NEEV | Student Managed Indian Equity Initiative",
  description:
    "NEEV is Finception's student-managed Indian equity investment initiative at Great Lakes Institute of Management, Gurgaon.",
};
export const revalidate = 0;

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      {note ? <p className="mt-1 text-[11px] text-muted">{note}</p> : null}
    </div>
  );
}

export default async function Home() {
  const [holdings, decisions] = await Promise.all([listHoldings(), listDecisions()]);
  const active = holdings.filter((h) => h.status === "active");
  const quotes = active.length ? await getQuotes(active.map((h) => h.symbol)).catch(() => []) : [];
  const { history, liveValue } = await getNavTimeline(holdings, quotes);
  const breakdown = computeFundBreakdown(holdings, quotes);
  const returnPct = history.length > 1 ? totalReturnPct(liveValue) : null;

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-grid" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-4xl">
            <p className="font-label text-[11px] tracking-[0.18em] text-accent">
              NEEV · NEW-AGE EQUITY EVALUATION &amp; VALUATION
            </p>
            <h1 className="mt-4 text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Research first.
              <br />
              Value carefully.
              <br />
              Invest with discipline.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              A student-managed Indian equity investment initiative by Finception at Great Lakes
              Institute of Management, Gurgaon. NEEV combines fundamental research, valuation and
              documented Investment Committee governance for a 3–5 year horizon.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/portfolio" className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-black hover:brightness-105">
                Explore Portfolio
              </Link>
              <Link href="/fund" className="rounded-lg border border-border px-5 py-3 text-sm font-semibold text-foreground hover:border-accent hover:text-accent">
                Understand the Fund
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Notional portfolio value" value={history.length || active.length ? formatCompact(liveValue) : "Not available"} note="Indicative live mark; not a statement of AUM" />
          <Stat label="Since inception" value={returnPct === null ? "Not available" : formatPercent(returnPct, false)} note={returnPct === null ? "Requires approved valuation history" : "Against initial notional capital"} />
          <Stat label="Active holdings" value={String(breakdown.activeNames)} note="Charter target: 15–25 at full deployment" />
          <Stat label="Cash" value={formatPercent(breakdown.cashPct, false)} note="Charter range: 0–5%" />
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.45fr_0.55fr]">
          <div className="card p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-label text-[10px] text-accent">PORTFOLIO MONITOR</p>
                <h2 className="mt-1 text-xl font-semibold">NEEV valuation history</h2>
              </div>
              <span className="font-mono text-[11px] text-muted">Benchmark: {FUND_CONFIG.benchmarkName}</span>
            </div>
            <div className="mt-5">
              <PerformanceChart navHistory={history} benchmark={[]} />
            </div>
            <p className="mt-3 text-xs leading-5 text-muted">
              The benchmark series is intentionally withheld until a verified Nifty 500 TRI feed is
              connected. The site will not substitute a price index for the governing total-return benchmark.
            </p>
          </div>

          <div className="card p-6">
            <p className="font-label text-[10px] text-accent">CHARTER</p>
            <h2 className="mt-2 text-xl font-semibold">Portfolio controls</h2>
            <div className="mt-6 space-y-4 text-sm">
              {[
                ["Initial position", "8%"],
                ["Individual position", "10%"],
                ["Sector exposure", "30%"],
                ["Cash range", "0–5%"],
                ["Full deployment", "15–25 names"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-muted">{label}</span>
                  <span className="font-mono text-foreground">{value}</span>
                </div>
              ))}
            </div>
            <Link href="/risk" className="mt-6 inline-flex text-sm font-medium text-accent hover:underline">
              Open Risk &amp; Compliance →
            </Link>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-label text-[10px] text-accent">RESEARCH</p>
              <h2 className="mt-1 text-2xl font-semibold">Research coverage</h2>
              <p className="mt-1 text-sm text-muted">Sector work is published as it is completed and reviewed.</p>
            </div>
            <Link href="/industries" className="text-sm text-accent hover:underline">All research →</Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {SECTORS.map((sector) => (
              <Link key={sector.slug} href="/industries" className="card p-5 transition-colors hover:border-accent">
                <p className="text-sm font-semibold text-foreground">{sector.name}</p>
                <p className="mt-2 text-xs leading-5 text-muted">Sector thesis, value chain, financials, valuation and risks.</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-label text-[10px] text-accent">INVESTMENT COMMITTEE</p>
                <h2 className="mt-1 text-xl font-semibold">Recent decisions</h2>
              </div>
              <Link href="/portfolio/register" className="text-sm text-accent hover:underline">Register →</Link>
            </div>
            <div className="mt-5 divide-y divide-border">
              {decisions.slice(0, 5).map((d) => (
                <div key={d.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-foreground">{d.companyName ?? d.sector}</span>
                    <span className="font-mono text-xs text-muted">{d.date}</span>
                  </div>
                  <div className="mt-1 flex gap-3 text-xs">
                    <span className={d.decision === "BUY" ? "text-up" : d.decision === "SELL" ? "text-down" : "text-muted"}>{d.decision}</span>
                    <span className="truncate text-muted">{d.rationale || "Rationale not published."}</span>
                  </div>
                </div>
              ))}
              {!decisions.length ? <p className="py-4 text-sm text-muted">No decisions have been published yet.</p> : null}
            </div>
          </div>

          <div className="card p-6">
            <p className="font-label text-[10px] text-accent">PUBLIC RECORD</p>
            <h2 className="mt-1 text-xl font-semibold">Research, reports &amp; methodology</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              NEEV is being built with the information depth of a professional fund platform:
              portfolio disclosures, research reports, factsheets, methodology and annual review
              records will be added as the underlying work is completed.
            </p>
            <div className="mt-6 grid gap-2">
              <Link href="/reports" className="rounded-lg border border-border p-3 text-sm hover:border-accent">Research Library</Link>
              <Link href="/disclosures" className="rounded-lg border border-border p-3 text-sm hover:border-accent">Reports &amp; Disclosures</Link>
              <Link href="/methodology" className="rounded-lg border border-border p-3 text-sm hover:border-accent">Methodology &amp; Disclosures</Link>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-xl border border-border bg-surface p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="font-label text-[10px] text-accent">BY FINCEPTION</p>
              <h2 className="mt-2 text-2xl font-semibold">NEEV is the investment initiative. Finception is the student finance club supporting it.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                The investment process belongs to NEEV. The broader student finance ecosystem,
                club activities and financial-literacy outreach remain part of Finception.
              </p>
            </div>
            <Link href="/about" className="text-sm font-medium text-accent hover:underline">About NEEV →</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
