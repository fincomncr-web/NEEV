import type { Metadata } from "next";
import ReportsGrid from "@/components/ReportsGrid";
import { listReports } from "@/lib/reports-db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "NEEV Library",
  description:
    "NEEV's formal document library for published research, investment records, performance reporting, portfolio reviews and disclosures.",
};

export default async function ReportsPage() {
  const reports = await listReports();
  const libraryReports = reports.filter((report) => report.publicationStatus !== "WITHDRAWN").filter(
    (report) =>
      report.type !== "monthly_review" &&
      !(
        report.title.trim().toLowerCase() === "kia motors" &&
        report.summary.trim().toLowerCase() === "kia motors industry research"
      )
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="font-label text-[11px] text-accent">RESEARCH &amp; LIBRARY</p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          NEEV Library
        </h1>
        <p className="mt-3 max-w-3xl text-muted">
          A single repository for NEEV&apos;s published documents. Depending on the stage of the
          investment process, you can expect investment decision memos, performance reports,
          portfolio reviews, Investment Committee records, annual reviews, methodology,
          disclosures and other formal research outputs. Each document is classified by type when
          it is uploaded.
        </p>
      </header>

      <ReportsGrid reports={libraryReports} showSectorFilters={false} />
    </div>
  );
}
