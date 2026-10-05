"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { IndustryReport, ReportType } from "@/lib/reports-db";
import { REPORT_SECTOR_OPTIONS } from "@/lib/sectors";

const TYPES: { value: ReportType; label: string }[] = [
  { value: "industry_report", label: "Industry Report" },
  { value: "monthly_review", label: "Monthly Investment Review" },
  { value: "investment_memo", label: "Investment Memo" },
  { value: "performance_report", label: "Performance Report" },
  { value: "portfolio_review", label: "Portfolio Review" },
  { value: "ic_record", label: "IC Record" },
  { value: "annual_review", label: "Annual Review" },
  { value: "methodology", label: "Methodology" },
  { value: "disclosure", label: "Disclosure" },
  { value: "other", label: "Other" },
];

const STATUSES = ["DRAFT", "IN_REVIEW", "PUBLISHED", "SUPERSEDED", "WITHDRAWN"];

export default function ReportsAdminPanel({ passcode }: { passcode: string }) {
  const [reports, setReports] = useState<IndustryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/reports", { cache: "no-store", headers: { "x-neev-admin": passcode } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to load reports.");
      setReports(data.reports ?? []);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Unable to load reports." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(load);
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("passcode", passcode);
    try {
      const res = await fetch("/api/reports", { method: "POST", body: data });
      const body = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: body.error ?? "Upload failed." });
        return;
      }
      setMessage({ type: "success", text: "Research document uploaded." });
      form.reset();
      await load();
    } catch {
      setMessage({ type: "error", text: "Upload failed. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function withdraw(id: string) {
    if (!window.confirm("Withdraw this report from the public library?")) return;
    setMessage(null);
    try {
      const res = await fetch("/api/reports", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, passcode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Unable to withdraw report." });
        return;
      }
      setMessage({ type: "success", text: "Report withdrawn. The PDF remains in storage." });
      await load();
    } catch {
      setMessage({ type: "error", text: "Unable to withdraw report." });
    }
  }

  return (
    <div>
      {message && <div className={`mb-6 rounded-md border px-4 py-3 text-sm ${message.type === "error" ? "border-down/30 bg-down/5 text-down" : "border-up/30 bg-up/5 text-up"}`}>{message.text}</div>}

      <form onSubmit={submit} className="card grid gap-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="font-label text-[10px] text-accent">RESEARCH LIBRARY</p><h2 className="mt-1 text-xl font-semibold">Publish a document</h2><p className="mt-1 text-xs text-muted">PDFs are uploaded to the NEEV research bucket and catalogued in the database.</p></div>
          <span className="rounded-full border border-border px-2.5 py-1 text-[10px] text-muted">25MB max</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Document type<select name="type" defaultValue="industry_report" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2">{TYPES.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select></label>
          <label className="text-sm">Publication status<select name="publicationStatus" defaultValue="PUBLISHED" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Title<input name="title" required placeholder="Indian Banking Sector Outlook FY27" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          <label className="text-sm">Sector<select name="sector" required defaultValue="" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2"><option value="" disabled>Select a sector</option>{REPORT_SECTOR_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <label className="text-sm">Publish date<input name="date" type="date" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          <label className="text-sm">Data cutoff<input name="dataCutoff" type="date" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          <label className="text-sm">Issue #<input name="issueNumber" type="number" min="1" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
          <label className="text-sm">Version<input name="version" type="number" min="1" defaultValue="1" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
        </div>

        <label className="text-sm">Authors<input name="authors" placeholder="Finception Research Desk" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
        <label className="text-sm">Summary<textarea name="summary" required rows={4} placeholder="One-paragraph public summary." className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2" /></label>
        <label className="text-sm">PDF<input type="file" name="file" required accept="application/pdf" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 file:mr-4 file:rounded file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#070908]" /></label>
        <button disabled={saving} className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#070908] disabled:opacity-60">{saving ? "Uploading…" : "Upload & catalogue"}</button>
      </form>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">Document register</h3><span className="text-xs text-muted">{reports.length} records</span></div>
        {loading ? <p className="text-sm text-muted">Loading…</p> : !reports.length ? <p className="text-sm text-muted">No reports uploaded yet.</p> : <div className="space-y-3">{reports.map((r) => <div key={r.id} className="card p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="font-medium">{r.title}</p><p className="mt-1 text-xs text-muted">{r.sector} · {r.type} · {r.date}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${r.publicationStatus === "PUBLISHED" ? "bg-up/10 text-up" : r.publicationStatus === "WITHDRAWN" ? "bg-down/10 text-down" : "bg-accent/10 text-accent"}`}>{r.publicationStatus}</span></div><p className="mt-2 text-sm leading-6 text-muted">{r.summary}</p><div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted"><span>{(r.fileSizeBytes / 1024 / 1024).toFixed(1)} MB · v{r.version}{r.issueNumber ? ` · Issue #${r.issueNumber}` : ""}</span><div className="flex gap-3"><a href={r.fileUrl} target="_blank" rel="noreferrer noopener" className="text-accent hover:underline">View PDF</a>{r.publicationStatus !== "WITHDRAWN" && <button type="button" onClick={() => withdraw(r.id)} className="text-down hover:underline">Withdraw</button>}</div></div></div>)}</div>}
      </section>
    </div>
  );
}
