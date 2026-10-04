import type { Metadata } from "next";
import TickerTape from "@/components/finance/TickerTape";
import MarketOverview from "@/components/finance/MarketOverview";
import PriceChart from "@/components/finance/PriceChart";

export const metadata: Metadata = {
  title: "Live Markets | Finception",
  description: "Live NIFTY, SENSEX, Bank Nifty and market overview data.",
};

export default function MarketsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="font-label text-[11px] text-accent">LIVE DATA</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Markets</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Real-time tracking of Indian indices, large-cap movers and global cues, powered by
          Yahoo Finance.
        </p>
      </header>

      <div className="card mb-8 overflow-hidden p-3">
        <TickerTape />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="card p-4 lg:col-span-3">
          <h2 className="mb-3 px-1 text-sm font-semibold text-foreground">SENSEX</h2>
          <PriceChart symbol="^BSESN" />
        </div>
        <div className="card p-4 lg:col-span-2">
          <h2 className="mb-3 px-1 text-sm font-semibold text-foreground">Market Overview</h2>
          <MarketOverview />
        </div>
      </div>
    </div>
  );
}
