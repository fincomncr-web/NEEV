"use client";

import { useState } from "react";
import type { Decision } from "@/lib/portfolio-db";
import { SECTORS } from "@/lib/sectors";

export default function DecisionRegisterList({ decisions }: { decisions: Decision[] }) {
  const [sector, setSector] = useState("All");

  const filtered =
    sector === "All" ? decisions : decisions.filter((d) => d.sector === sector);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {["All", ...SECTORS.map((s) => s.name)].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSector(s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              s === sector
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:border-accent hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card mt-6 p-8 text-center text-sm text-muted">
          No decisions logged{sector !== "All" ? ` for ${sector}` : ""} yet.
        </div>
      ) : (
        <div className="card mt-6 divide-y divide-border">
          {filtered.map((d) => (
            <div key={d.id} className="flex flex-wrap items-start gap-x-4 gap-y-1 px-4 py-4 text-sm">
              <span className="w-24 shrink-0 font-mono text-xs text-muted">{d.date}</span>
              <span
                className={`w-14 shrink-0 font-mono text-xs font-medium ${
                  d.decision === "BUY"
                    ? "text-up"
                    : d.decision === "SELL"
                      ? "text-down"
                      : "text-muted"
                }`}
              >
                {d.decision}
              </span>
              <div className="min-w-0 sm:min-w-[160px] flex-1 break-words">
                <p className="font-medium text-foreground">
                  {d.companyName ?? d.sector}
                  {d.symbol && <span className="ml-2 font-mono text-xs text-muted">{d.symbol}</span>}
                </p>
                <p className="mt-0.5 text-xs text-accent">{d.sector}</p>
                <p className="mt-1 text-muted">{d.rationale}</p>
              </div>
              {d.voteCount && (
                <span className="shrink-0 font-mono text-xs text-muted">{d.voteCount}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
