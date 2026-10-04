"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { IndustryReport } from "@/lib/reports-db";
import { REPORT_SECTOR_OPTIONS } from "@/lib/sectors";
import PasscodeGate from "@/components/PasscodeGate";

export default function UploadReportPage() {
  const [passcode, setPasscode] = useState<string | null>(null);
  const [reports, setReports] = useState<IndustryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(
    null
  );

  async function loadReports() {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      setReports(data.reports ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (passcode === null) return;
    queueMicrotask(() => loadReports());
  }, [passcode]);

  if (passcode === null) {
    return (
      <PasscodeGate
        eyebrow="RESEARCH LIBRARY"
        title="Report Uploads"
        description="This area is for Finception research leads only. Enter the shared passcode to continue."
        onUnlock={setPasscode}
      />
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("passcode", passcode ?? "");

    try {
      const res = await fetch("/api/reports", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Upload failed." });
        return;
      }
      setMessage({ type: "success", text: "Report uploaded successfully." });
      form.reset();
      await loadReports();
    } catch {
      setMessage({ type: "error", text: "Upload failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this report? This cannot be undone.")) return;

    try {
      const res = await fetch("/api/reports", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, passcode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Delete failed." });
        return;
      }
      await loadReports();
    } catch {
      setMessage({ type: "error", text: "Delete failed. Please try again." });
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="font-label text-[11px] text-accent">RESEARCH LIBRARY</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Upload a Report</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Publish a new document PDF. It will appear on the{" "}
          <Link href="/reports" className="text-accent hover:underline">
            NEEV Library
          </Link>{" "}
          page immediately.
        </p>
      </header>

      {message && (
        <div
          className={`mb-6 rounded-md border px-4 py-3 text-sm ${
            message.type === "error"
              ? "border-down/30 bg-down/5 text-down"
              : "border-up/30 bg-up/5 text-up"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card grid gap-4 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Document Type</label>
          <select
            name="type"
            defaultValue="industry_report"
            className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            <option value="industry_report">Industry Report</option>
            <option value="monthly_review">Monthly Investment Review</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Title</label>
          <input
            type="text"
            name="title"
            required
            placeholder="e.g. Indian Banking Sector Outlook FY26"
            className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Sector</label>
            <select
              name="sector"
              required
              defaultValue=""
              className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
            >
              <option value="" disabled>
                Select a sector
              </option>
              {REPORT_SECTOR_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Publish Date
            </label>
            <input
              type="date"
              name="date"
              className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Authors</label>
          <input
            type="text"
            name="authors"
            placeholder="e.g. Finception Research Desk"
            className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Summary</label>
          <textarea
            name="summary"
            required
            rows={3}
            placeholder="A short summary shown on the report card."
            className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Report PDF (max 25MB)
          </label>
          <input
            type="file"
            name="file"
            accept="application/pdf"
            required
            className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground file:mr-4 file:rounded file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#070908]"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#070908] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Uploading..." : "Upload Report"}
        </button>
      </form>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Published Reports</h2>
        {loading ? (
          <p className="mt-3 text-sm text-muted">Loading...</p>
        ) : reports.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No reports uploaded yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="card flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{r.title}</p>
                    {r.type === "monthly_review" && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                        Monthly Review
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted">
                    {r.sector} &middot; {new Date(r.date).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={r.fileUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm text-accent hover:underline"
                  >
                    View
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    className="text-sm text-down hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
