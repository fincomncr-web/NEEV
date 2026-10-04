import type { Metadata } from "next";
import Link from "next/link";
import { FUND_CONFIG } from "@/lib/sectors";

export const metadata: Metadata = {
  title: "The Fund",
  description: "NEEV investment objective, philosophy, process, portfolio construction and governance.",
};

const process = [
  ["01", "Sector Analysis", "Understand structural growth, industry economics and competitive intensity."],
  ["02", "Value Chain", "Identify where economic value accrues and which positions can sustain it."],
  ["03", "Company Screening", "Narrow the universe using business quality, financial strength and governance."],
  ["04", "Fundamental Research", "Study financial statements, management, competitive advantages and risks."],
  ["05", "Valuation", "Use DCF and relevant market-based methods to establish a valuation range."],
  ["06", "Investment Committee", "Document the thesis, valuation, risks and decision before capital deployment."],
  ["07", "Portfolio Construction", "Build a diversified portfolio within the Fund Charter limits."],
  ["08", "Monitoring", "Review performance, fundamentals, valuation and thesis-break conditions."],
];

export default function FundPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-12">
        <p className="font-label text-[11px] text-accent">THE FUND</p>
        <h1 className="mt-2 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
          A documented investment process, not just a portfolio.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-muted">
          NEEV is a student-managed Indian equity investment initiative focused on long-term
          capital appreciation through fundamentally strong businesses at attractive valuations.
          The governing Fund Charter sets the mandate, limits and review discipline.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Horizon", FUND_CONFIG.horizonLabel],
          ["Benchmark", FUND_CONFIG.benchmarkName],
          ["Target holdings", "15–25"],
          ["Cash range", "0–5%"],
        ].map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="card p-7">
          <p className="font-label text-[11px] text-accent">OBJECTIVE</p>
          <h2 className="mt-2 text-2xl font-semibold">Long-term capital appreciation</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            NEEV seeks to own Indian listed businesses with durable competitive advantages,
            consistent financial performance, attractive returns on capital, healthy cash flows,
            prudent capital allocation and sound governance.
          </p>
        </div>
        <div className="card p-7">
          <p className="font-label text-[11px] text-accent">PHILOSOPHY</p>
          <h2 className="mt-2 text-2xl font-semibold">Business quality plus valuation</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Quality alone is not enough. The process explicitly combines business fundamentals
            with valuation discipline and documents the downside, base and upside cases before a
            material investment decision.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-6">
          <p className="font-label text-[11px] text-accent">INVESTMENT PROCESS</p>
          <h2 className="mt-2 text-2xl font-semibold">From industry question to monitored position</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {process.map(([number, title, text]) => (
            <div key={number} className="card flex gap-4 p-5">
              <span className="font-mono text-xs text-accent">{number}</span>
              <div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 card p-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="font-label text-[11px] text-accent">GOVERNANCE</p>
            <h2 className="mt-2 text-2xl font-semibold">The Fund Charter is the source of truth</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Position limits, sector concentration, cash requirements, review cadence and
              decision governance are documented before the portfolio is evaluated.
            </p>
          </div>
          <Link href="/portfolio/charter" className="inline-flex rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-accent hover:text-accent">
            Read the Charter
          </Link>
        </div>
      </section>
    </div>
  );
}
