"use client";

import { useEffect, useRef } from "react";
import { createChart, LineSeries, type IChartApi, type UTCTimestamp } from "lightweight-charts";

interface Props {
  navHistory: { date: string; nav: number }[];
  benchmark: { time: string; close: number }[];
}

export default function PerformanceChart({ navHistory, benchmark }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart: IChartApi = createChart(containerRef.current, {
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

    if (navHistory.length > 0) {
      const base = navHistory[0].nav;
      const navSeries = chart.addSeries(LineSeries, {
        color: "#22c55e",
        lineWidth: 2,
        title: "Fund",
      });
      navSeries.setData(
        navHistory.map((n) => ({
          time: Math.floor(new Date(n.date).getTime() / 1000) as UTCTimestamp,
          value: (n.nav / base) * 100,
        }))
      );
    }

    if (benchmark.length > 0) {
      const base = benchmark[0].close;
      const benchSeries = chart.addSeries(LineSeries, {
        color: "#93a39a",
        lineWidth: 2,
        title: "Nifty 500 TRI",
      });
      benchSeries.setData(
        benchmark.map((b) => ({
          time: Math.floor(new Date(b.time).getTime() / 1000) as UTCTimestamp,
          value: (b.close / base) * 100,
        }))
      );
    }

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [navHistory, benchmark]);

  if (navHistory.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted">
        No NAV history logged yet. Once the fund launches, performance will chart here.
      </p>
    );
  }

  return <div ref={containerRef} className="h-[320px] w-full" />;
}
