"use client";

import { useMemo, useState } from "react";
import type { IndustryReport } from "@/lib/reports-db";
import { SECTORS } from "@/lib/sectors";
import { IconSearch } from "@/components/icons/FinanceIcons";

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  monthly_review: "Monthly NEEV Research",
  industry_report: "Industry Research",
  investment_memo: "Investment Decision Memo",
  performance_report: "Performance Report",
  portfolio_review: "Portfolio Review",
  ic_record: "Investment Committee Record",
  annual_review: "Annual Review",
  methodology: "Methodology",
  disclosure: "Disclosure",
  other: "Other",
};

function formatSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ReportsGrid({
  reports,
  showSectorFilters = true,
}: {
  reports: IndustryReport[];
  showSectorFilters?: boolean;
}) {
  const [sector, setSector] = useState("All Reports");
  const [query, setQuery] = useState("");
  const sectorFilters = ["All Reports", ...SECTORS.map((s) => s.name)];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports
      .filter((r) => !showSectorFilters || sector === "All Reports" || r.sector === sector)
      .filter(
        (r) =>
          q === "" ||
          r.title.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          r.authors.toLowerCase().includes(q) ||
          r.sector.toLowerCase().includes(q)
      );
  }, [reports, sector, query, showSectorFilters]);

  if (reports.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-muted">
        No reports have been published yet. Once uploaded, they&apos;ll appear here.
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search reports by title, summary or author&hellip;"
          className="w-full rounded-md border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      {showSectorFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {sectorFilters.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSector(s)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${s === sector ? "border-accent bg-accent/10 text-accent" : "border-border text-muted hover:border-accent hover:text-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card mt-6 p-8 text-center text-sm text-muted">
          No reports match these filters.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((report) => (
            <div key={report.id} className="card flex flex-col p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-fit rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-accent">
                  {report.sector}
                </span>
                <span className="w-fit rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent">{DOCUMENT_TYPE_LABELS[report.type] ?? DOCUMENT_TYPE_LABELS.other}</span>{report.issueNumber ? <span className="w-fit rounded-full border border-border px-2.5 py-1 text-[11px] text-muted">Issue {report.issueNumber}</span> : null}<span className={"w-fit rounded-full border px-2.5 py-1 text-[11px] "+(report.publicationStatus==="PUBLISHED"?"border-accent/30 text-accent":"border-yellow-500/30 text-yellow-400")}>{report.publicationStatus==="PUBLISHED"?"Published":report.publicationStatus.replace("_"," ")}</span>
              </div>
              <h3 className="mt-3 text-base font-semibold text-foreground">{report.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{report.summary}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted">
                <span>
                  {new Date(report.date).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span>{formatSize(report.fileSizeBytes)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">{report.authors}</p>
              <a
                href={report.fileUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-4 rounded-md border border-accent/40 py-2 text-center text-sm font-medium text-accent transition-colors hover:bg-accent/10"
              >
                View Report
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
