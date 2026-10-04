"use client";

import { useSummary } from "@/lib/use-finance";
import { formatCompact, formatPercent } from "@/lib/format";

export default function FinancialsCard({ symbol }: { symbol: string }) {
  const { financials, loading, error } = useSummary(symbol);

  if (error) return <p className="text-sm text-down">Failed to load financials.</p>;
  if (loading && !financials) return <p className="text-sm text-muted">Loading financials…</p>;
  if (!financials) return <p className="text-sm text-muted">No financial data available.</p>;

  const rows: [string, string][] = [
    ["Market Cap", financials.marketCap ? formatCompact(financials.marketCap) : "-"],
    ["Revenue (TTM)", financials.revenue ? formatCompact(financials.revenue) : "-"],
    ["Revenue Growth", formatPercent(financials.revenueGrowth)],
    ["Profit Margin", formatPercent(financials.profitMargin)],
    ["Return on Equity", formatPercent(financials.returnOnEquity)],
    ["EPS (TTM)", financials.eps !== null ? financials.eps.toFixed(2) : "-"],
    ["P/E Ratio", financials.peRatio !== null ? financials.peRatio.toFixed(2) : "-"],
    ["Forward P/E", financials.forwardPE !== null ? financials.forwardPE.toFixed(2) : "-"],
    ["Dividend Yield", formatPercent(financials.dividendYield)],
    ["Debt / Equity", financials.debtToEquity !== null ? financials.debtToEquity.toFixed(2) : "-"],
    ["Beta", financials.beta !== null ? financials.beta.toFixed(2) : "-"],
  ];

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label}>
          <p className="text-xs text-muted">{label}</p>
          <p className="mt-0.5 font-mono text-sm text-foreground">{value}</p>
        </div>
      ))}
    </div>
  );
}
