"use client";

import { useState, type FormEvent } from "react";

export default function PasscodeGate({
  eyebrow,
  title,
  description,
  onUnlock,
}: {
  eyebrow: string;
  title: string;
  description: string;
  onUnlock: (passcode: string) => void;
}) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: value }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Incorrect passcode.");
        return;
      }
      onUnlock(value);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <div className="card overflow-hidden">
        <div className="border-b border-border bg-surface-2/50 p-6 text-center">
          <p className="font-label text-[11px] text-accent">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-sm font-medium text-foreground">
            Admin passcode
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter passcode"
              autoFocus
              disabled={submitting}
              className="mt-1.5 w-full rounded-md border border-border bg-surface px-4 py-2.5 text-center text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none disabled:opacity-60"
            />
          </label>
          {error && <p className="mt-2 text-sm text-down">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !value}
            className="mt-4 w-full rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#070908] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Authenticating…" : "Enter control room"}
          </button>
          <p className="mt-4 text-center text-[11px] leading-5 text-muted">
            Session expires automatically. Use “Lock admin” when leaving the console.
          </p>
        </form>
      </div>
    </div>
  );
}
