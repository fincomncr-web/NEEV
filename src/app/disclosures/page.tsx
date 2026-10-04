import type { Metadata } from "next";
import Link from "next/link";
import { listReports } from "@/lib/reports-db";

export const metadata: Metadata = {
  title: "Reports & Disclosures",
  description: "NEEV factsheets, portfolio disclosures, research outputs and methodology.",
};

export default async function DisclosuresPage() {
  const reports = await listReports();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="font-label text-[11px] text-accent">REPORTS &amp; DISCLOSURES</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Documents that explain the fund</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          A professional fund website should make its methodology, portfolio information and
          research outputs easy to find. NEEV will use this section as the permanent disclosure
          center as the fund evolves.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Monthly Factsheets", "Recurring fund snapshot covering portfolio, performance, risk and research updates."],
          ["Portfolio Disclosures", "Historical holdings and allocation snapshots, published with an as-of date."],
          ["Investment Committee Memos", "Documented decisions with thesis, valuation, risks and vote outcome as the system matures."],
          ["Quarterly Reviews", "Fundamental and valuation review of the portfolio."],
          ["Annual Review", "Performance, attribution, process review and lessons from the fund's ongoing investment process."],
          ["Methodology & Disclosures", "Definitions, calculation methods, data sources and limitations."],
        ].map(([title, text]) => (
          <div key={title} className="card p-6">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
          </div>
        ))}
      </div>

      <section className="mt-10 card p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold">Published research library</h2>
            <p className="mt-1 text-sm text-muted">{reports.length} published document{reports.length === 1 ? "" : "s"} currently available.</p>
          </div>
          <Link href="/reports" className="text-sm font-medium text-accent hover:underline">Open Research Library →</Link>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-border bg-surface p-6">
        <p className="font-label text-[10px] text-accent">IMPORTANT</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          NEEV is a student-managed investment initiative and is not a SEBI-registered mutual fund,
          portfolio management service or investment adviser. Its disclosures are educational and
          institutional-process records, not an offer to invest.
        </p>
      </section>
    </div>
  );
}
