import type { Metadata } from "next";
import ResearchSectorView from "@/components/ResearchSectorView";
import { listReports } from "@/lib/reports-db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "NEEV Research",
  description:
    "NEEV's sector research workspace for recurring publications supporting the Indian equity investment process.",
};

export default async function IndustriesPage() {
  const reports = await listReports();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="font-label text-[11px] text-accent">RESEARCH &amp; LIBRARY</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">NEEV Research</h1>
        <p className="mt-3 max-w-3xl text-muted">
          The sector research workspace of NEEV. Select a sector to view its published research,
          including recurring sector, value-chain and company-level work as the investment process
          develops.
        </p>
      </header>

      <ResearchSectorView reports={reports} />
    </div>
  );
}
