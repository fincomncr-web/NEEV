"use client";

import { useEffect, useRef } from "react";
import { createChart, LineSeries, type IChartApi, type UTCTimestamp } from "lightweight-charts";

interface Props {
  navHistory: { date: string; nav: number }[];
  benchmark?: { time: string; close: number }[];
}

function toTimestamp(date: string): UTCTimestamp {
  return Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 1000) as UTCTimestamp;
}

export default function PerformanceChart({ navHistory, benchmark = [] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || navHistory.length === 0) return;

    const nav = navHistory
      .slice()
      .filter((point) => Number.isFinite(point.nav) && point.nav > 0)
      .sort((a, b) => a.date.localeCompare(b.date));

    const tri = benchmark
      .slice()
      .filter((point) => Number.isFinite(point.close) && point.close > 0)
      .sort((a, b) => a.time.localeCompare(b.time));

    if (nav.length === 0) return;

    // Use the first date common to both series as the comparison base.
    // This avoids comparing NEEV's inception observation with a non-trading
    // day where the benchmark has no published value.
    let commonStart = nav[0].date;
    if (tri.length > 0) {
      commonStart = tri[0].time > commonStart ? tri[0].time : commonStart;
    }

    const navBasePoint =
      nav.find((point) => point.date >= commonStart) ?? nav[0];
    const triBasePoint =
      tri.find((point) => point.time >= navBasePoint.date) ?? tri[0];

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
        priceFormatter: (value: number) => value.toFixed(2),
      },
      autoSize: true,
    });

    const navSeries = chart.addSeries(LineSeries, {
      color: "#22c55e",
      lineWidth: 2,
      title: "NEEV",
      priceFormat: {
        type: "custom",
        formatter: (value: number) => value.toFixed(2),
      },
    });

    navSeries.setData(
      nav
        .filter((point) => point.date >= navBasePoint.date)
        .map((point) => ({
          time: toTimestamp(point.date),
          value: (point.nav / navBasePoint.nav) * 100,
        }))
    );

    if (tri.length > 0 && triBasePoint) {
      const benchmarkSeries = chart.addSeries(LineSeries, {
        color: "#93a39a",
        lineWidth: 2,
        title: "Nifty 500 TRI",
        priceFormat: {
          type: "custom",
          formatter: (value: number) => value.toFixed(2),
        },
      });

      benchmarkSeries.setData(
        tri
          .filter((point) => point.time >= navBasePoint.date)
          .map((point) => ({
            time: toTimestamp(point.time),
            value: (point.close / triBasePoint.close) * 100,
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
        No NAV history available yet.
      </p>
    );
  }

  return <div ref={containerRef} className="h-[320px] w-full" />;
}
