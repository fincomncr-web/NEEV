import type { Metadata } from "next";
import { listDecisions } from "@/lib/portfolio-db";
import DecisionRegisterList from "@/components/portfolio/DecisionRegisterList";

export const metadata: Metadata = {
  title: "IC Decision Register",
  description: "The published Investment Committee decision register for NEEV.",
};

// Decisions can come from a live Google Sheet, so this page renders fresh on
// every request rather than serving a cached copy.
export const revalidate = 0;

export default async function DecisionRegisterPage() {
  const decisions = (await listDecisions()).filter((d) => d.status !== "DRAFT");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="font-label text-[11px] text-accent">STUDENT MANAGED FUND</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Decision Register</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Published Investment Committee decisions with date, rationale and voting information. Detailed investment memos will be added as the governance system matures.
        </p>
      </header>

      <DecisionRegisterList decisions={decisions} />
    </div>
  );
}
