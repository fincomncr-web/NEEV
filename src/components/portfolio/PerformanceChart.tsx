"use client";

import { useEffect, useRef } from "react";
import { createChart, LineSeries, type IChartApi, type UTCTimestamp } from "lightweight-charts";

interface Props {
  navHistory: { date: string; nav: number }[];
  benchmark?: { time: string; close: number }[];
}

export default function PerformanceChart({ navHistory, benchmark = [] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || navHistory.length === 0) return;

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
      rightPriceScale: {
        borderColor: "#212b24",
      },
      timeScale: {
        borderColor: "#212b24",
      },
      localization: {
        priceFormatter: (value: number) => `${value.toFixed(2)}%`,
      },
      autoSize: true,
    });

    const navSeries = chart.addSeries(LineSeries, {
      color: "#22c55e",
      lineWidth: 2,
      title: "NEEV NAV return",
      priceFormat: {
        type: "custom",
        formatter: (value: number) => `${value.toFixed(2)}%`,
      },
    });

    navSeries.setData(
      navHistory
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((n) => ({
          time: Math.floor(new Date(n.date).getTime() / 1000) as UTCTimestamp,
          value: n.nav,
        }))
    );

    if (benchmark.length > 0) {
      const benchmarkSeries = chart.addSeries(LineSeries, {
        color: "#93a39a",
        lineWidth: 2,
        title: "Nifty 500 TRI return",
        priceFormat: {
          type: "custom",
          formatter: (value: number) => `${value.toFixed(2)}%`,
        },
      });

      benchmarkSeries.setData(
        benchmark
          .slice()
          .sort((a, b) => a.time.localeCompare(b.time))
          .map((b) => ({
            time: Math.floor(new Date(b.time).getTime() / 1000) as UTCTimestamp,
            value: b.close,
          }))
      );
    }

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [navHistory, benchmark]);

  return <div ref={containerRef} className="h-[320px] w-full" />;
}
