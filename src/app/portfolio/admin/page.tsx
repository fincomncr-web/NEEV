"use client";

import { useState } from "react";
import PasscodeGate from "@/components/PasscodeGate";
import NavAdminPanel from "@/components/portfolio/admin/NavAdminPanel";
import HoldingsAdminPanel from "@/components/portfolio/admin/HoldingsAdminPanel";
import DecisionsAdminPanel from "@/components/portfolio/admin/DecisionsAdminPanel";
import IndustryContentAdminPanel from "@/components/portfolio/admin/IndustryContentAdminPanel";

const TABS = [
  { key: "nav", label: "NAV" },
  { key: "holdings", label: "Holdings" },
  { key: "decisions", label: "Decisions" },
  { key: "content", label: "Industry Content" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function PortfolioAdminPage() {
  const [passcode, setPasscode] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("nav");

  if (passcode === null) {
    return (
      <PasscodeGate
        eyebrow="STUDENT MANAGED FUND"
        title="Portfolio Admin"
        description="This area is for the Core Committee only. Enter the shared passcode to continue."
        onUnlock={setPasscode}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="font-label text-[11px] text-accent">STUDENT MANAGED FUND</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Portfolio Admin</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Log NAV updates, manage holdings, record Investment Committee decisions, and publish
          monthly industry research layers.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-accent bg-accent text-[#070908]"
                : "border-border text-muted hover:border-accent hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "nav" && <NavAdminPanel passcode={passcode} />}
      {tab === "holdings" && <HoldingsAdminPanel passcode={passcode} />}
      {tab === "decisions" && <DecisionsAdminPanel passcode={passcode} />}
      {tab === "content" && <IndustryContentAdminPanel passcode={passcode} />}
    </div>
  );
}
