"use client";

import { useMemo, useState } from "react";
import type { IndustryReport } from "@/lib/reports-db";
import { SECTORS } from "@/lib/sectors";
import ReportsGrid from "@/components/ReportsGrid";

export default function ResearchSectorView({
  reports,
}: {
  reports: IndustryReport[];
}) {
  const [selectedSector, setSelectedSector] = useState(SECTORS[0]?.slug ?? "");

  const selected = SECTORS.find((sector) => sector.slug === selectedSector) ?? SECTORS[0];
  const sectorReports = useMemo(
    () =>
      reports.filter(
        (report) =>
          (report.type === "monthly_review" || report.type === "industry_report") &&
          report.publicationStatus === "PUBLISHED" &&
          report.sector.trim().toLowerCase() === selected?.name.trim().toLowerCase()
      )
        .sort((a, b) => {
          const dateOrder = b.date.localeCompare(a.date);
          return dateOrder || b.uploadedAt.localeCompare(a.uploadedAt);
        })
        .slice(0, MAX_SECTOR_REPORTS),
    [reports, selected]
  );

  if (!selected) return null;

  return (
    <section>
      <div className="rounded-xl border border-border bg-surface p-2">
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-5">
          {SECTORS.map((sector) => {
            const active = sector.slug === selected.slug;
            const tabClass =
              "rounded-lg px-3 py-3 text-center text-sm font-medium transition-colors " +
              (active
                ? "bg-accent/10 text-accent"
                : "text-muted hover:bg-accent/5 hover:text-foreground");

            return (
              <button
                key={sector.slug}
                type="button"
                onClick={() => setSelectedSector(sector.slug)}
                className={tabClass}
                aria-pressed={active}
              >
                {sector.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-label text-[10px] text-accent">SECTOR RESEARCH</p>
          <h2 className="mt-1 text-2xl font-semibold">{selected.name}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Published NEEV research for this sector. New work will appear here as it is completed
            and reviewed.
          </p>
        </div>
      </div>

      <div className="mt-5">
        {sectorReports.length > 0 ? (
          <ReportsGrid reports={sectorReports} showSectorFilters={false} />
        ) : (
          <div className="card p-8 text-center">
            <h3 className="text-lg font-semibold">Research is being developed</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
              No published research is available for {selected.name} yet. Developing work is
              intentionally not presented as completed research.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
