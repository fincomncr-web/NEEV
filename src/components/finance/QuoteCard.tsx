"use client";

import { useQuotes } from "@/lib/use-finance";
import { formatCompact, formatNumber, formatPercent, formatPrice, formatSigned } from "@/lib/format";

export default function QuoteCard({ symbol }: { symbol: string }) {
  const { quotes, loading, error } = useQuotes([symbol], 15000);
  const q = quotes[0];

  if (error) return <p className="text-sm text-down">Failed to load quote.</p>;
  if (!q) return <p className="text-sm text-muted">{loading ? "Loading quote…" : "No data."}</p>;

  const up = (q.change ?? 0) >= 0;
  const stats: [string, string][] = [
    ["Open", formatPrice(q.open, q.currency)],
    ["Prev. Close", formatPrice(q.previousClose, q.currency)],
    ["Day Range", `${formatPrice(q.dayLow, q.currency)} - ${formatPrice(q.dayHigh, q.currency)}`],
    [
      "52W Range",
      `${formatPrice(q.fiftyTwoWeekLow, q.currency)} - ${formatPrice(q.fiftyTwoWeekHigh, q.currency)}`,
    ],
    ["Volume", formatNumber(q.volume)],
    ["Market Cap", q.marketCap ? formatCompact(q.marketCap) : "-"],
  ];

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-foreground">{formatPrice(q.price, q.currency)}</span>
        <span className={`text-sm font-medium ${up ? "text-up" : "text-down"}`}>
          {formatSigned(q.change)} ({formatPercent(q.changePercent, false)})
        </span>
      </div>
      {q.marketState && (
        <p className="mt-1 text-xs uppercase tracking-wide text-muted">{q.marketState}</p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-0.5 font-mono text-sm text-foreground">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
