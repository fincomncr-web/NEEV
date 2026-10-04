"use client";

import { INDEX_SYMBOLS } from "@/lib/symbols";
import { useQuotes } from "@/lib/use-finance";
import { formatPercent, formatPrice, formatSigned } from "@/lib/format";

export default function MarketOverview() {
  const symbols = INDEX_SYMBOLS.map((s) => s.symbol);
  const { quotes, loading, error } = useQuotes(symbols, 30000);

  if (error) {
    return <p className="text-sm text-muted">Market overview unavailable right now.</p>;
  }

  return (
    <div className="space-y-3">
      {INDEX_SYMBOLS.map((idx) => {
        const q = quotes.find((x) => x.symbol === idx.symbol);
        const up = (q?.change ?? 0) >= 0;
        return (
          <div
            key={idx.symbol}
            className="flex items-center justify-between rounded-md border border-border px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{idx.name}</p>
              <p className="font-mono text-xs text-muted">{idx.symbol}</p>
            </div>
            <div className="text-right">
              {q ? (
                <>
                  <p className="font-mono text-sm text-foreground">
                    {formatPrice(q.price, q.currency)}
                  </p>
                  <p className={`text-xs ${up ? "text-up" : "text-down"}`}>
                    {formatSigned(q.change)} ({formatPercent(q.changePercent, false)})
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted">{loading ? "Loading…" : "-"}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
