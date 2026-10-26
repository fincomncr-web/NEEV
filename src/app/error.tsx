"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="card max-w-lg p-8 text-center">
        <p className="font-label text-[11px] text-accent">NEEV · TEMPORARY ERROR</p>
        <h1 className="mt-2 text-2xl font-bold">This module could not load</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          A server-side data or rendering issue interrupted this page. The rest of NEEV is still
          available.
        </p>
        {error.digest ? (
          <p className="mt-3 font-mono text-[11px] text-muted">Error reference: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-[#070908]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-accent"
          >
            Back to NEEV
          </Link>
        </div>
      </div>
    </main>
  );
}
