"use client";

import { useMemo } from "react";
import { useChart } from "@/lib/use-finance";
import { computeTechnicalSummary, type Rating } from "@/lib/indicators";

const RATING_STYLES: Record<Rating, string> = {
  "Strong Sell": "text-down",
  Sell: "text-down",
  Neutral: "text-muted",
  Buy: "text-up",
  "Strong Buy": "text-up",
};

export default function TechnicalsCard({ symbol }: { symbol: string }) {
  const { candles, loading, error } = useChart(symbol, "1Y");

  const summary = useMemo(() => {
    if (candles.length < 20) return null;
    return computeTechnicalSummary(candles.map((c) => c.close));
  }, [candles]);

  if (error) return <p className="text-sm text-down">Failed to load technicals.</p>;
  if (loading && !summary) return <p className="text-sm text-muted">Loading technicals…</p>;
  if (!summary) return <p className="text-sm text-muted">Not enough price history yet.</p>;

  const rows: [string, string, boolean | null][] = [
    [
      "SMA 20",
      summary.sma20 !== null ? summary.sma20.toFixed(2) : "-",
      summary.sma20 !== null ? summary.price > summary.sma20 : null,
    ],
    [
      "SMA 50",
      summary.sma50 !== null ? summary.sma50.toFixed(2) : "-",
      summary.sma50 !== null ? summary.price > summary.sma50 : null,
    ],
    [
      "SMA 200",
      summary.sma200 !== null ? summary.sma200.toFixed(2) : "-",
      summary.sma200 !== null ? summary.price > summary.sma200 : null,
    ],
    [
      "RSI (14)",
      summary.rsi14 !== null ? summary.rsi14.toFixed(1) : "-",
      summary.rsi14 !== null ? summary.rsi14 < 50 : null,
    ],
    [
      "MACD Histogram",
      summary.macd ? summary.macd.histogram.toFixed(2) : "-",
      summary.macd ? summary.macd.histogram > 0 : null,
    ],
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs text-muted">Overall Signal</p>
          <p className={`text-2xl font-bold ${RATING_STYLES[summary.rating]}`}>{summary.rating}</p>
        </div>
        <p className="text-xs text-muted">
          {summary.bullishSignals} bullish &middot; {summary.bearishSignals} bearish of{" "}
          {summary.totalSignals}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {rows.map(([label, value, bullish]) => (
          <div key={label}>
            <p className="text-xs text-muted">{label}</p>
            <p
              className={`mt-0.5 font-mono text-sm ${
                bullish === null ? "text-foreground" : bullish ? "text-up" : "text-down"
              }`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted">
        Computed from daily closing prices over the last year. Not investment advice.
      </p>
    </div>
  );
}
