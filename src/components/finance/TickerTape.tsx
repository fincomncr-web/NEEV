"use client";

import { TICKER_SYMBOLS } from "@/lib/symbols";
import { useQuotes } from "@/lib/use-finance";
import { formatPercent, formatPrice } from "@/lib/format";

export default function TickerTape() {
  const symbols = TICKER_SYMBOLS.map((s) => s.symbol);
  const { quotes, loading, error } = useQuotes(symbols, 30000);

  if (error) {
    return (
      <p className="px-2 py-3 text-center text-xs text-muted">Live ticker unavailable right now.</p>
    );
  }

  const renderItems = (keyPrefix: string) =>
    TICKER_SYMBOLS.map((item) => {
      const q = quotes.find((x) => x.symbol === item.symbol);
      const up = (q?.change ?? 0) >= 0;
      return (
        <span
          key={`${keyPrefix}-${item.symbol}`}
          className="mx-4 inline-flex items-center gap-2 whitespace-nowrap text-sm"
        >
          <span className="font-medium text-foreground">{item.name}</span>
          {q ? (
            <>
              <span className="font-mono text-muted">{formatPrice(q.price, q.currency)}</span>
              <span className={up ? "text-up" : "text-down"}>
                {formatPercent(q.changePercent, false)}
              </span>
            </>
          ) : (
            <span className="text-muted">{loading ? "…" : "-"}</span>
          )}
        </span>
      );
    });

  return (
    <div className="overflow-hidden">
      <div className="flex w-max animate-[ticker_35s_linear_infinite] hover:[animation-play-state:paused]">
        {renderItems("a")}
        {renderItems("b")}
      </div>
    </div>
  );
}
