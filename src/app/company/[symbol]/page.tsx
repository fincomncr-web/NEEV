import type { Metadata } from "next";
import Link from "next/link";
import QuoteCard from "@/components/finance/QuoteCard";
import PriceChart from "@/components/finance/PriceChart";
import CompanyProfileCard from "@/components/finance/CompanyProfileCard";
import FinancialsCard from "@/components/finance/FinancialsCard";
import TechnicalsCard from "@/components/finance/TechnicalsCard";
import { getQuote } from "@/lib/yahoo";
import { listDecisions, listHoldings, listInvestmentCases } from "@/lib/portfolio-db";
import { formatCompact, formatPrice, formatSigned } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Company Terminal | NEEV",
  description: "Market data, fundamentals and NEEV investment intelligence for a listed company.",
};

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const symbol = decodeURIComponent((await params).symbol).trim().toUpperCase();
  const [quote, holdings, decisions, cases] = await Promise.all([
    getQuote(symbol).catch(() => null),
    listHoldings(),
    listDecisions(),
    listInvestmentCases(),
  ]);

  const position = holdings.find((h) => h.status === "active" && h.symbol.toUpperCase() === symbol);
  const positionValue = position && quote?.price != null ? position.quantity * quote.price : null;
  const positionPnl =
    position &&
    positionValue != null &&
    quote?.price != null &&
    position.avgCost > 0
      ? ((quote.price / position.avgCost) - 1) * 100
      : null;
  const publishedDecisions = decisions
    .filter((d) => d.symbol?.toUpperCase() === symbol && d.status !== "DRAFT")
    .slice(0, 6);
  const investmentCase = cases.find((c) => c.symbol.toUpperCase() === symbol && c.status !== "WITHDRAWN") ?? null;
  const name = position?.companyName ?? quote?.name ?? symbol;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/search" className="text-sm text-muted hover:text-accent">← Company Search</Link>
        <span className="font-mono text-xs text-muted">NEEV COMPANY TERMINAL</span>
      </div>

      <section className="border-b border-border pb-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-mono text-xs text-accent">{symbol}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Market intelligence and, where applicable, NEEV's internal investment record.
            </p>
          </div>
          <div className="min-w-[260px]">
            <QuoteCard symbol={symbol} />
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="card p-4">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-label text-[10px] text-accent">MARKET DATA</p>
              <h2 className="mt-1 text-xl font-semibold">Price &amp; history</h2>
            </div>
            <p className="text-xs text-muted">Yahoo Finance market data · historical observations</p>
          </div>
          <PriceChart symbol={symbol} />
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <p className="font-label text-[10px] text-accent">FUNDAMENTALS</p>
          <h2 className="mt-1 text-xl font-semibold">Financials &amp; valuation inputs</h2>
          <div className="mt-5"><FinancialsCard symbol={symbol} /></div>
        </div>
        <div className="card p-5">
          <p className="font-label text-[10px] text-accent">TECHNICALS</p>
          <h2 className="mt-1 text-xl font-semibold">Technical snapshot</h2>
          <div className="mt-5"><TechnicalsCard symbol={symbol} /></div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-5">
          <p className="font-label text-[10px] text-accent">COMPANY</p>
          <h2 className="mt-1 text-xl font-semibold">Profile</h2>
          <div className="mt-5"><CompanyProfileCard symbol={symbol} /></div>
        </div>

        <div className="card p-5">
          <p className="font-label text-[10px] text-accent">NEEV POSITION</p>
          <h2 className="mt-1 text-xl font-semibold">{position ? "Portfolio holding" : "Not currently held"}</h2>
          {position ? (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div><p className="text-xs text-muted">Quantity</p><p className="mt-1 font-mono text-sm">{position.quantity}</p></div>
              <div><p className="text-xs text-muted">Average cost</p><p className="mt-1 font-mono text-sm">{formatPrice(position.avgCost)}</p></div>
              <div><p className="text-xs text-muted">Current value</p><p className="mt-1 font-mono text-sm">{positionValue == null ? "Unavailable" : formatCompact(positionValue)}</p></div>
              <div><p className="text-xs text-muted">P&amp;L</p><p className={`mt-1 font-mono text-sm ${positionPnl == null ? "text-muted" : positionPnl >= 0 ? "text-up" : "text-down"}`}>{positionPnl == null ? "Unavailable" : formatSigned(positionPnl) + "%"}</p></div>
              <div><p className="text-xs text-muted">Entry date</p><p className="mt-1 font-mono text-sm">{position.entryDate}</p></div>
              <div><p className="text-xs text-muted">Sector</p><p className="mt-1 text-sm">{position.sector}</p></div>
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-muted">
              This company is not in the current NEEV portfolio. Market research remains available;
              NEEV-specific thesis and governance records appear only when published.
            </p>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <p className="font-label text-[10px] text-accent">INVESTMENT CASE</p>
          <h2 className="mt-1 text-xl font-semibold">NEEV thesis</h2>
          {investmentCase ? (
            <div className="mt-5 space-y-4 text-sm">
              <div><p className="text-xs text-muted">Status</p><p className="mt-1 font-medium">{investmentCase.status}</p></div>
              <div><p className="text-xs text-muted">Thesis</p><p className="mt-1 leading-6 text-muted">{investmentCase.thesis}</p></div>
              {investmentCase.valuationMethod && <div><p className="text-xs text-muted">Valuation method</p><p className="mt-1">{investmentCase.valuationMethod}</p></div>}
              {investmentCase.thesisBreakers && <div><p className="text-xs text-muted">Thesis breakers</p><p className="mt-1 leading-6 text-muted">{investmentCase.thesisBreakers}</p></div>}
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-muted">No published NEEV investment case is linked to this company yet.</p>
          )}
        </div>

        <div className="card p-5">
          <p className="font-label text-[10px] text-accent">GOVERNANCE</p>
          <h2 className="mt-1 text-xl font-semibold">IC decision history</h2>
          <div className="mt-5 divide-y divide-border">
            {publishedDecisions.length ? publishedDecisions.map((d) => (
              <div key={d.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`font-medium ${d.decision === "BUY" ? "text-up" : d.decision === "SELL" ? "text-down" : "text-foreground"}`}>{d.decision}</span>
                  <span className="font-mono text-xs text-muted">{d.date}</span>
                </div>
                <p className="mt-1 text-sm leading-5 text-muted">{d.rationale}</p>
                {d.proposedWeight != null && <p className="mt-1 text-xs text-muted">Proposed weight: {(d.proposedWeight * 100).toFixed(1)}%</p>}
              </div>
            )) : <p className="text-sm text-muted">No published IC decisions for this company.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
