"use client";

import { useEffect, useRef, useState } from "react";
import {
  AreaSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { useChart } from "@/lib/use-finance";

const RANGES = ["1D", "5D", "1M", "6M", "1Y", "5Y"] as const;
type Range = (typeof RANGES)[number];

export default function PriceChart({ symbol }: { symbol: string }) {
  const [range, setRange] = useState<Range>("6M");
  const { candles, loading, error } = useChart(symbol, range);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#93a39a",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(242,247,244,0.04)" },
        horzLines: { color: "rgba(242,247,244,0.04)" },
      },
      rightPriceScale: { borderColor: "#212b24" },
      timeScale: { borderColor: "#212b24" },
      autoSize: true,
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: "#22c55e",
      topColor: "rgba(34,197,94,0.35)",
      bottomColor: "rgba(34,197,94,0.02)",
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;
    const data = candles.map((c) => ({
      time: Math.floor(new Date(c.time).getTime() / 1000) as UTCTimestamp,
      value: c.close,
    }));
    seriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                r === range
                  ? "bg-accent text-[#070908]"
                  : "text-muted hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        {error && <span className="text-xs text-down">{error}</span>}
      </div>
      <div ref={containerRef} className="h-[360px] w-full" />
      {loading && candles.length === 0 && (
        <p className="mt-2 text-center text-xs text-muted">Loading chart…</p>
      )}
    </div>
  );
}
