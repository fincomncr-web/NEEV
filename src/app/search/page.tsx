import type { Metadata } from "next";
import CompanySearch from "@/components/CompanySearch";

export const metadata: Metadata = {
  title: "Company Search | Finception",
  description: "Search any listed company for live charts, financials and fundamentals.",
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="font-label text-[11px] text-accent">RESEARCH</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Company Search</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Search any listed company by name - Indian or global - to view its live
          chart, company profile, technicals and financial statements.
        </p>
      </header>

      <CompanySearch />
    </div>
  );
}
