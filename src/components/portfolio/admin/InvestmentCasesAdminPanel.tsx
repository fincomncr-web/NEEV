"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { IndustryReport } from "@/lib/reports-db";
import type { InvestmentCase } from "@/lib/portfolio-db";
import { REPORT_SECTOR_OPTIONS, SECTORS } from "@/lib/sectors";
import { formatPrice } from "@/lib/format";

const STATUSES = ["DRAFT", "UNDER_REVIEW", "APPROVED", "ARCHIVED", "WITHDRAWN"];

function sectorCodeForName(name: string) {
  return SECTORS.find((s) => s.name === name)?.slug ?? name;
}

export default function InvestmentCasesAdminPanel({ passcode }: { passcode: string }) {
  const [cases, setCases] = useState<InvestmentCase[]>([]);
  const [reports, setReports] = useState<IndustryReport[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [casesRes, reportsRes] = await Promise.all([
        fetch("/api/portfolio/cases", { cache: "no-store" }),
        fetch("/api/reports", { cache: "no-store" }),
      ]);
      const [casesData, reportsData] = await Promise.all([casesRes.json(), reportsRes.json()]);
      setCases(casesData.cases ?? []);
      setReports(reportsData.reports ?? []);
    } catch {
      setMessage({ type: "error", text: "Unable to load investment cases." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(load);
  }, []);

  function clearForm(form?: HTMLFormElement) {
    setEditingId(null);
    form?.reset();
  }

  function editCase(item: InvestmentCase) {
    setEditingId(item.id);
    const form = document.getElementById("investment-case-form") as HTMLFormElement | null;
    if (!form) return;
    const set = (name: string, value: string) => {
      const field = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
      if (field) field.value = value;
    };
    set("symbol", item.symbol);
    set("companyName", item.companyName);
    set("sectorCode", item.sectorCode);
    set("status", item.status);
    set("thesis", item.thesis);
    set("keyRisks", item.keyRisks ?? "");
    set("thesisBreakers", item.thesisBreakers ?? "");
    set("valuationMethod", item.valuationMethod ?? "");
    set("bearCase", item.bearCase ?? "");
    set("baseCase", item.baseCase ?? "");
    set("bullCase", item.bullCase ?? "");
    set("bearValue", item.bearValue == null ? "" : String(item.bearValue));
    set("baseValue", item.baseValue == null ? "" : String(item.baseValue));
    set("bullValue", item.bullValue == null ? "" : String(item.bullValue));
    set("proposedWeight", item.proposedWeight == null ? "" : String(item.proposedWeight));
    set("sourceReportId", item.sourceReportId ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const form = e.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    const payload = {
      passcode,
      id: editingId,
      symbol: String(body.symbol ?? "").trim().toUpperCase(),
      companyName: String(body.companyName ?? "").trim(),
      sectorCode: sectorCodeForName(String(body.sectorCode ?? "").trim()),
      status: String(body.status ?? "DRAFT").trim().toUpperCase(),
      thesis: String(body.thesis ?? "").trim(),
      keyRisks: String(body.keyRisks ?? "").trim() || null,
      thesisBreakers: String(body.thesisBreakers ?? "").trim() || null,
      valuationMethod: String(body.valuationMethod ?? "").trim() || null,
      bearCase: String(body.bearCase ?? "").trim() || null,
      baseCase: String(body.baseCase ?? "").trim() || null,
      bullCase: String(body.bullCase ?? "").trim() || null,
      bearValue: body.bearValue === "" ? null : Number(body.bearValue),
      baseValue: body.baseValue === "" ? null : Number(body.baseValue),
      bullValue: body.bullValue === "" ? null : Number(body.bullValue),
      proposedWeight: body.proposedWeight === "" ? null : Number(body.proposedWeight),
      sourceReportId: String(body.sourceReportId ?? "").trim() || null,
    };

    try {
      const res = await fetch("/api/portfolio/cases", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to save investment case." });
        return;
      }
      setMessage({ type: "success", text: editingId ? "Investment case updated." : "Investment case created." });
      clearForm(form);
      await load();
    } catch {
      setMessage({ type: "error", text: "Unable to save investment case." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {message && <div className={`mb-6 rounded-md border px-4 py-3 text-sm ${message.type === "error" ? "border-down/30 bg-down/5 text-down" : "border-up/30 bg-up/5 text-up"}`}>{message.text}</div>}

      <form id="investment-case-form" onSubmit={submit} className="card grid gap-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-label text-[10px] text-accent">INVESTMENT CASE</p>
            <h2 className="mt-1 text-xl font-semibold">{editingId ? "Edit case" : "Create a case"}</h2>
            <p className="mt-1 text-xs text-muted">This is the research object that can later anchor an IC decision.</p>
          </div>
          {editingId && <button type="button" onClick={() => clearForm(document.getElementById("investment-case-form") as HTMLFormElement | null ?? undefined)} className="text-sm text-muted hover:text-foreground">Cancel edit</button>}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm">Symbol<input name="symbol" required placeholder="RELIANCE.NS" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          <label className="text-sm">Company<input name="companyName" required placeholder="Reliance Industries" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          <label className="text-sm">Sector<select name="sectorCode" required defaultValue="" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"><option value="" disabled>Select</option>{REPORT_SECTOR_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Status<select name="status" defaultValue="DRAFT" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="text-sm">Valuation method<input name="valuationMethod" placeholder="DCF / SOTP / Relative valuation" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
        </div>

        <label className="text-sm">Core thesis<textarea name="thesis" required rows={5} placeholder="Why this company, why now, and why the market is mispricing it." className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Key risks<textarea name="keyRisks" rows={3} className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          <label className="text-sm">Thesis breakers<textarea name="thesisBreakers" rows={3} className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm">Bear case<textarea name="bearCase" rows={3} className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          <label className="text-sm">Base case<textarea name="baseCase" rows={3} className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          <label className="text-sm">Bull case<textarea name="bullCase" rows={3} className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <label className="text-sm">Bear value<input name="bearValue" type="number" step="any" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          <label className="text-sm">Base value<input name="baseValue" type="number" step="any" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          <label className="text-sm">Bull value<input name="bullValue" type="number" step="any" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          <label className="text-sm">Proposed weight<input name="proposedWeight" type="number" min="0" max="1" step="0.001" placeholder="0.08" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
        </div>

        <label className="text-sm">Source report<select name="sourceReportId" defaultValue="" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"><option value="">No linked report</option>{reports.filter((r) => r.publicationStatus !== "WITHDRAWN").map((r) => <option key={r.id} value={r.id}>{r.title} · {r.date}</option>)}</select></label>

        <button disabled={saving} className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#070908] disabled:opacity-60">{saving ? "Saving…" : editingId ? "Update Investment Case" : "Create Investment Case"}</button>
      </form>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">Investment case register</h3><span className="text-xs text-muted">{cases.length} records</span></div>
        {loading ? <p className="text-sm text-muted">Loading…</p> : !cases.length ? <p className="text-sm text-muted">No investment cases yet.</p> : <div className="space-y-3">{cases.map((item) => <div key={item.id} className="card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-medium">{item.companyName} <span className="font-mono text-xs text-muted">{item.symbol}</span></p><p className="mt-1 text-xs text-muted">{item.sectorCode} · {item.status}</p></div><button type="button" onClick={() => editCase(item)} className="text-sm text-accent hover:underline">Edit</button></div><p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{item.thesis}</p><div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">{item.bearValue != null && <span>Bear {formatPrice(item.bearValue)}</span>}{item.baseValue != null && <span>Base {formatPrice(item.baseValue)}</span>}{item.bullValue != null && <span>Bull {formatPrice(item.bullValue)}</span>}{item.proposedWeight != null && <span>Weight {(item.proposedWeight * 100).toFixed(1)}%</span>}</div></div>)}</div>}
      </section>
    </div>
  );
}
