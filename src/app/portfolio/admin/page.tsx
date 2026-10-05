"use client";

import { useState } from "react";
import PasscodeGate from "@/components/PasscodeGate";
import AdminOverviewPanel from "@/components/portfolio/admin/AdminOverviewPanel";
import NavAdminPanel from "@/components/portfolio/admin/NavAdminPanel";
import CashAdminPanel from "@/components/portfolio/admin/CashAdminPanel";
import HoldingsAdminPanel from "@/components/portfolio/admin/HoldingsAdminPanel";
import TransactionsAdminPanel from "@/components/portfolio/admin/TransactionsAdminPanel";
import DecisionsAdminPanel from "@/components/portfolio/admin/DecisionsAdminPanel";
import InvestmentCasesAdminPanel from "@/components/portfolio/admin/InvestmentCasesAdminPanel";
import ReportsAdminPanel from "@/components/portfolio/admin/ReportsAdminPanel";
import IndustryContentAdminPanel from "@/components/portfolio/admin/IndustryContentAdminPanel";
import AuditAdminPanel from "@/components/portfolio/admin/AuditAdminPanel";

const TABS = [
  { key: "overview", label: "Control Room" },
  { key: "nav", label: "Live NAV" },
  { key: "cash", label: "Cash Ledger" },
  { key: "holdings", label: "Holdings" },
  { key: "transactions", label: "Trade Ledger" },
  { key: "decisions", label: "IC Decisions" },
  { key: "cases", label: "Investment Cases" },
  { key: "reports", label: "Research Library" },
  { key: "content", label: "Industry Content" },
  { key: "audit", label: "Audit Trail" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function PortfolioAdminPage() {
  const [passcode, setPasscode] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("overview");

  async function lockAdmin() {
    await fetch("/api/reports/verify", { method: "DELETE" }).catch(() => {});
    setPasscode(null);
    setTab("overview");
  }

  if (passcode === null) {
    return (
      <PasscodeGate
        eyebrow="CORE COMMITTEE · NEEV"
        title="Portfolio Admin"
        description="Restricted operating console for the portfolio, Investment Committee register, research library and audit trail."
        onUnlock={setPasscode}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-label text-[11px] text-accent">CORE COMMITTEE · NEEV CONTROL ROOM</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Portfolio Admin</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            One operating layer for NAV, cash, trades, Investment Committee decisions, investment
            cases, research publication, industry coverage and immutable audit history.
          </p>
        </div>
        <button
          type="button"
          onClick={lockAdmin}
          className="rounded-md border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-down/50 hover:text-down"
        >
          Lock admin
        </button>
      </header>

      <div className="sticky top-0 z-20 -mx-1 mb-7 overflow-x-auto bg-background/95 px-1 py-2 backdrop-blur">
        <div className="flex min-w-max gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                tab === t.key
                  ? "border-accent bg-accent text-[#070908]"
                  : "border-border text-muted hover:border-accent hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <section key={tab}>
        {tab === "overview" && <AdminOverviewPanel passcode={passcode} />}
        {tab === "nav" && <NavAdminPanel passcode={passcode} />}
        {tab === "cash" && <CashAdminPanel passcode={passcode} />}
        {tab === "holdings" && <HoldingsAdminPanel passcode={passcode} />}
        {tab === "transactions" && <TransactionsAdminPanel passcode={passcode} />}
        {tab === "decisions" && <DecisionsAdminPanel passcode={passcode} />}
        {tab === "cases" && <InvestmentCasesAdminPanel passcode={passcode} />}
        {tab === "reports" && <ReportsAdminPanel passcode={passcode} />}
        {tab === "content" && <IndustryContentAdminPanel passcode={passcode} />}
        {tab === "audit" && <AuditAdminPanel passcode={passcode} />}
      </section>
    </div>
  );
}
