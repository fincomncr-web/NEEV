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
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChecking(true);
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
      setChecking(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="font-label text-[11px] text-accent">{eyebrow}</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-muted">{description}</p>

      <form onSubmit={handleSubmit} className="mt-6 w-full">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Passcode"
          autoFocus
          className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-center text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
        {error && <p className="mt-2 text-sm text-down">{error}</p>}
        <button
          type="submit"
          disabled={checking || !value}
          className="mt-4 w-full rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#070908] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {checking ? "Checking..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
