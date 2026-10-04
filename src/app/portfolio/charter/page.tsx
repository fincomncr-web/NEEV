import type { Metadata } from "next";
import Link from "next/link";
import { getHoldings } from "@/lib/google-sheet-portfolio";
import { getQuotes } from "@/lib/yahoo";
import { computeCharterStatus, computeFundBreakdown } from "@/lib/fund-engine";
import { FUND_CONFIG } from "@/lib/sectors";
import { formatCompact } from "@/lib/format";

/** Plain (unsigned) percent for weight/allocation figures - formatPercent's "+" prefix reads as a gain/loss delta, not a share of NAV. */
function weightPct(value: number): string {
  return `${value.toFixed(2)}%`;
}

export const metadata: Metadata = {
  title: "Fund Charter",
  description:
    "The governing investment mandate for NEEV: objective, universe, investment philosophy, process, portfolio construction, risk management, governance and performance measurement.",
};

// Live compliance figures depend on current holdings + market quotes, so this
// page renders fresh on every request rather than serving a cached copy.
export const revalidate = 0;

function LimitCard({
  label,
  current,
  limit,
  detail,
  breach,
}: {
  label: string;
  current: string;
  limit: string;
  detail?: string;
  breach: boolean;
}) {
  return (
    <div className="card p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${breach ? "text-down" : "text-foreground"}`}>{current}</p>
      <p className="mt-1 text-xs text-muted">{limit}</p>
      {detail && <p className="mt-2 text-xs text-muted">{detail}</p>}
      <span
        className={`mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${
          breach ? "text-down" : "text-up"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${breach ? "bg-down" : "bg-up"}`} />
        {breach ? "Over limit" : "Within charter"}
      </span>
    </div>
  );
}

export default async function FundCharterPage() {
  const holdings = await getHoldings();
  const activeHoldings = holdings.filter((h) => h.status === "active");
  const symbols = activeHoldings.map((h) => h.symbol);
  const quotes = symbols.length > 0 ? await getQuotes(symbols).catch(() => []) : [];
  const breakdown = computeFundBreakdown(holdings, quotes);

  const maxInitialPositionPct = FUND_CONFIG.maxInitialPositionWeight * 100;
  const maxStockLimitPct = FUND_CONFIG.maxSingleStockWeight * 100;
  const maxSectorLimitPct = FUND_CONFIG.maxSingleSectorWeight * 100;
  const maxCashPct = FUND_CONFIG.maxCashBuffer * 100;
  const charter = computeCharterStatus(breakdown);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="font-label text-[11px] text-accent">Student Managed Fund</p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Fund Charter</h1>
        <p className="mt-3 max-w-2xl text-muted">
          The operating and risk rules behind every portfolio decision - so each one is
          auditable against a written standard rather than discretionary.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Fund Mandate</h2>
        <div className="card p-6 text-sm leading-relaxed text-muted">
          NEEV identifies and owns high-quality Indian businesses with sustainable long term growth
          potential, purchased at valuations that provide an attractive risk adjusted return, while
          maintaining disciplined portfolio construction, risk management and continuous investment review.
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Objective &amp; Investment Universe</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card p-5">
            <p className="text-xs text-muted">Objective</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              Long term capital appreciation through fundamentally strong Indian businesses at
              attractive valuations, with a 3–5 year investment horizon.
            </p>
          </div>
          <div className="card p-5">
            <p className="text-xs text-muted">Benchmark</p>
            <p className="mt-2 text-sm font-semibold text-foreground">{FUND_CONFIG.benchmarkName}</p>
            <p className="mt-1 text-xs text-muted">
              Performance is evaluated using absolute return, relative return, volatility,
              maximum drawdown and portfolio attribution.
            </p>
          </div>
          <div className="card p-5">
            <p className="text-xs text-muted">Universe</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              Equity and equity-related securities of companies listed in India, primarily on NSE
              and BSE, across large cap, mid cap and small cap segments.
            </p>
          </div>
          <div className="card p-5">
            <p className="text-xs text-muted">Mandate Boundaries</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              India only. Leverage is not permitted. Derivatives do not form part of the core
              investment strategy.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Investment Philosophy</h2>
        <div className="card grid gap-3 p-6 sm:grid-cols-2">
          {[
            "Sustainable competitive advantages",
            "Strong and consistent financial performance",
            "Attractive returns on capital",
            "Healthy cash flow generation",
            "Prudent capital allocation",
            "Sound corporate governance",
            "Sustainable long term growth opportunities",
            "Business quality and valuation considered together",
          ].map((item) => (
            <div key={item} className="flex gap-2 text-sm text-muted">
              <span className="text-accent">•</span><span>{item}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          A high-quality business is not considered investable solely because of its fundamentals;
          the market price must provide an attractive risk adjusted return.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Investment Process</h2>
        <div className="card p-6">
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
            {[
              "Sector Analysis",
              "Value Chain Analysis",
              "Company Screening",
              "Fundamental Research",
              "Valuation",
              "Investment Decision",
              "Portfolio Construction",
              "Monitoring",
            ].map((step, i, steps) => (
              <span key={step} className="inline-flex items-center gap-2">
                <span className="rounded-md border border-border px-3 py-2">{step}</span>
                {i < steps.length - 1 && <span className="text-accent">→</span>}
              </span>
            ))}
          </div>
          <p className="mt-5 text-sm text-muted">
            Company evaluation covers business quality, financial strength, competitive advantage,
            management and governance, growth potential, valuation and risk.
          </p>
          <p className="mt-2 text-sm text-muted">
            Appropriate valuation methods may include DCF, P/E, EV/EBITDA, P/B, Residual Income
            and Sum of the Parts. Major investment decisions incorporate Bear, Base and Bull cases.
          </p>
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground">Portfolio Construction &amp; Live Controls</h2>
        </div>
        <p className="mb-4 text-sm text-muted">
          Current portfolio exposures are checked against the charter's internal guidelines.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <LimitCard
            label="Largest initial position"
            current={`${maxInitialPositionPct}% guideline`}
            limit={`Maximum initial position: ${maxInitialPositionPct}%`}
            detail="Applied when capital is first allocated to a security."
            breach={false}
          />
          <LimitCard
            label="Largest individual position"
            current={weightPct(breakdown.maxSingleStockPct)}
            limit={`Maximum individual position: ${maxStockLimitPct}%`}
            detail={breakdown.maxSingleStockSymbol ? `Currently ${breakdown.maxSingleStockSymbol}` : "No active holdings yet"}
            breach={breakdown.maxSingleStockPct > maxStockLimitPct}
          />
          <LimitCard
            label="Largest sector exposure"
            current={weightPct(breakdown.maxSectorPct)}
            limit={`Maximum sector exposure: ${maxSectorLimitPct}%`}
            detail={breakdown.maxSector ? `Currently ${breakdown.maxSector}` : "No active holdings yet"}
            breach={breakdown.maxSectorPct > maxSectorLimitPct}
          />
          <LimitCard
            label="Cash allocation"
            current={weightPct(breakdown.cashPct)}
            limit={`Permitted range: 0–${maxCashPct}%`}
            detail={charter.leverage.status === "breach" ? "Negative cash would indicate leverage and is outside the Charter." : "Cash is determined by portfolio construction and available opportunities."}
            breach={charter.cash.status !== "within" || charter.leverage.status === "breach"}
          />
          <LimitCard
            label="Active holdings"
            current={String(breakdown.activeNames)}
            limit={`Target portfolio size: ${FUND_CONFIG.minNamesAtFullDeployment}–${FUND_CONFIG.maxNamesAtFullDeployment} securities`}
            detail="Position sizes reflect conviction, valuation, downside risk, liquidity and portfolio-level exposure."
            breach={charter.holdings.status === "above"}
          />
        </div>

        {breakdown.bySector.length > 0 && (
          <div className="card mt-4 divide-y divide-border">
            {breakdown.bySector.map((s) => (
              <div key={s.sector} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="text-foreground">{s.sector}</span>
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted">{formatCompact(s.value)}</span>
                  <span className={`font-mono text-xs font-medium ${s.weightPct > maxSectorLimitPct ? "text-down" : "text-muted"}`}>
                    {weightPct(s.weightPct)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Risk Management</h2>
        <div className="card grid gap-3 p-6 sm:grid-cols-2">
          {[
            "Business and industry risk",
            "Financial and liquidity risk",
            "Valuation risk",
            "Governance risk",
            "Concentration risk",
            "Regulatory and structural risks",
          ].map((risk) => (
            <div key={risk} className="text-sm text-muted">• {risk}</div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          Each investment must document its key risks and thesis-break conditions. Capital is
          allocated with the objective of limiting permanent loss of capital.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Investment Decision &amp; Governance</h2>
        <div className="card p-6 text-sm leading-relaxed text-muted">
          Every investment is supported by a documented thesis covering business rationale, industry
          and competitive position, financial performance, growth drivers, valuation, expected
          return, key risks, proposed allocation and conditions for review or exit. Material
          investment decisions are reviewed through the NEEV Investment Committee before capital
          deployment. See the <Link href="/portfolio/register" className="text-accent hover:underline">Decision Register</Link> for logged decisions.
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Monitoring &amp; Review</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Monthly", "Performance and portfolio review"],
            ["Quarterly", "Fundamental and valuation review"],
            ["Annually", "Comprehensive investment thesis and portfolio review"],
          ].map(([period, description]) => (
            <div key={period} className="card p-5">
              <p className="font-mono text-xs text-accent">{period}</p>
              <p className="mt-2 text-sm text-muted">{description}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          Positions may be increased, reduced or exited when the investment thesis, valuation, risk
          profile or portfolio considerations materially change.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Performance Measurement</h2>
        <div className="card grid gap-3 p-6 sm:grid-cols-2">
          {[
            "Absolute return",
            "Relative return vs. Nifty 500 TRI",
            "Volatility",
            "Maximum drawdown",
            "Portfolio attribution",
            "Sector and security-level contribution",
          ].map((metric) => (
            <div key={metric} className="text-sm text-muted">• {metric}</div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          Performance evaluation considers both investment outcomes and the quality of the
          underlying investment process.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Investment Principles</h2>
        <div className="card grid gap-3 p-6 sm:grid-cols-2">
          {[
            "Research before investment.",
            "Fundamentals over speculation.",
            "Valuation matters.",
            "Capital preservation is paramount.",
            "Long term thinking over short-term market movements.",
            "Disciplined diversification over excessive concentration.",
            "Continuous monitoring and accountability.",
            "Evidence-based decisions over emotion.",
          ].map((principle) => (
            <div key={principle} className="text-sm font-medium text-foreground">• {principle}</div>
          ))}
        </div>
      </section>

      <section className="border-t border-border pt-6 text-center">
        <p className="font-label text-[11px] text-accent">NEEV</p>
        <p className="mt-2 font-display text-xl font-semibold">Research. Value. Invest.</p>
      </section>
    </div>
  );
}
