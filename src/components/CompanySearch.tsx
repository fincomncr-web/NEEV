"use client";

import { useState, type FormEvent } from "react";
import PriceChart from "@/components/finance/PriceChart";
import QuoteCard from "@/components/finance/QuoteCard";
import CompanyProfileCard from "@/components/finance/CompanyProfileCard";
import FinancialsCard from "@/components/finance/FinancialsCard";
import TechnicalsCard from "@/components/finance/TechnicalsCard";
import { POPULAR_COMPANIES } from "@/lib/symbols";
import { useSymbolSearch } from "@/lib/use-finance";

export default function CompanySearch() {
  const [symbol, setSymbol] = useState("RELIANCE.NS");
  const [input, setInput] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { results, loading } = useSymbolSearch(input);

  const activeCompany = POPULAR_COMPANIES.find((c) => c.symbol === symbol);
  const activeName = activeCompany?.name ?? symbol;

  function selectResult(sym: string) {
    setSymbol(sym);
    setInput("");
    setShowResults(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (results[0]) selectResult(results[0].symbol);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 150)}
            placeholder="Search a company e.g. TCS, HDFC Bank, or Apple"
            className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
          {showResults && input.trim() && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-border bg-surface shadow-lg">
              {loading ? (
                <p className="px-4 py-3 text-sm text-muted">Searching…</p>
              ) : results.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted">No matches found.</p>
              ) : (
                results.map((r) => (
                  <button
                    key={r.symbol}
                    type="button"
                    onMouseDown={() => selectResult(r.symbol)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-surface-2"
                  >
                    <span className="truncate text-foreground">{r.name}</span>
                    <span className="shrink-0 font-mono text-xs text-muted">
                      {r.symbol} &middot; {r.exchange}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#070908] transition-opacity hover:opacity-90"
        >
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {POPULAR_COMPANIES.map((company) => (
          <button
            key={company.symbol}
            type="button"
            onClick={() => setSymbol(company.symbol)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              company.symbol === symbol
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:border-accent hover:text-foreground"
            }`}
          >
            {company.name}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-6">
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-foreground">{activeName}</h2>
            <span className="font-mono text-xs text-muted">{symbol}</span>
          </div>
          <QuoteCard symbol={symbol} />
        </div>

        <div className="card p-4">
          <h2 className="mb-3 px-1 text-sm font-semibold text-foreground">Price Chart</h2>
          <PriceChart symbol={symbol} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-4">
            <h2 className="mb-3 px-1 text-sm font-semibold text-foreground">Company Profile</h2>
            <CompanyProfileCard symbol={symbol} />
          </div>
          <div className="card p-4">
            <h2 className="mb-3 px-1 text-sm font-semibold text-foreground">
              Technical Snapshot
            </h2>
            <p className="mb-3 px-1 text-xs leading-5 text-muted">Market indicators are informational only and are not NEEV investment recommendations.</p>
            <TechnicalsCard symbol={symbol} />
          </div>
        </div>

        <div className="card p-4">
          <h2 className="mb-3 px-1 text-sm font-semibold text-foreground">
            Financials &amp; Fundamentals
          </h2>
          <FinancialsCard symbol={symbol} />
        </div>
      </div>
    </div>
  );
}
