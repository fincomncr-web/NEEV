import type { Metadata } from "next";
import { FUND_CONFIG } from "@/lib/sectors";

export const metadata: Metadata = {
  title: "Methodology & Disclosures",
  description: "NEEV performance, portfolio, benchmark and data methodology.",
};

const items = [
  ["Portfolio valuation", "Active positions are derived from the controlled transaction ledger and marked to the latest available market quote where supplied. Missing quotes are disclosed and cost is retained only as an explicitly identified fallback estimate."],
  ["Performance", "Published return statistics use approved valuation observations. Transaction, cash and corporate-action ledgers are the foundation for the next stage of TWR/MWR and attribution reporting; incomplete history is not presented as a fully reconciled institutional track record."],
  ["Benchmark", "The governing benchmark is Nifty 500 TRI. The site will not substitute the Nifty 500 price index for TRI merely because a convenient market-data ticker is available."],
  ["Risk controls", "Pre-trade checks and portfolio monitoring use the Fund Charter limits: 8% initial position, 10% individual position, 30% sector exposure, 15–25 holdings at full deployment and 0–5% cash. The system distinguishes pre-deployment from an actual limit breach."],
  ["Market data", "Live market information is provided through the site's configured market-data provider and may be delayed, unavailable or subject to provider limitations."],
  ["Research publication", "Each document carries a type, issue, version and publication status. Documents in review remain identifiable and are not represented as approved publication merely because a file has been uploaded. Known corrections are retained in the publication workflow rather than silently overwritten."],
  ["Governance", "Material trades require an approved Investment Committee decision. Decision and transaction records are immutable; amendments are represented as new records so the historical decision trail remains reconstructable."],
  ["Recordkeeping", "Supabase is the production book of record for portfolio, cash, decision and research metadata. Legacy Google Sheet environment variables no longer override production portfolio data."],
];

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="font-label text-[11px] text-accent">DISCLOSURES</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Methodology &amp; disclosures</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Transparency is part of the NEEV process. This page documents what the website calculates,
          what it does not yet calculate and where users should exercise caution.
        </p>
      </header>
      <div className="space-y-3">
        {items.map(([title, text]) => (
          <section key={title} className="card p-6">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-muted">{text}</p>
          </section>
        ))}
      </div>
      <section className="mt-8 card p-6">
        <h2 className="font-semibold">Fund mandate</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          NEEV operates on a {FUND_CONFIG.horizonLabel} horizon, with India-only listed equity as
          its universe and {FUND_CONFIG.benchmarkName} as its governing benchmark.
        </p>
      </section>
    </div>
  );
}
