"use client";

import { useEffect, useState } from "react";
import { formatCompact } from "@/lib/format";

type AuditEvent = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  beforeData: Record<string, unknown> | null;
  afterData: Record<string, unknown> | null;
  createdAt: string;
};

function pretty(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export default function AuditAdminPanel() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portfolio/audit", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to load audit events.");
      setEvents(data.events ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load audit events.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(load);
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-accent/30 bg-accent/5 p-4">
        <div><p className="text-sm font-medium">Append-only audit trail</p><p className="mt-1 text-xs text-muted">Database triggers record inserts, updates and deletes across the fund-control tables.</p></div>
        <button type="button" onClick={load} className="rounded-md border border-border px-3 py-2 text-xs text-muted hover:border-accent hover:text-foreground">Refresh</button>
      </div>

      {error && <div className="mb-5 rounded-md border border-down/30 bg-down/5 p-4 text-sm text-down">{error}</div>}

      <div className="card overflow-hidden">
        {loading ? <p className="p-6 text-sm text-muted">Loading audit trail…</p> : !events.length ? <p className="p-6 text-sm text-muted">No audit events yet.</p> : (
          <div className="divide-y divide-border">
            {events.map((event) => (
              <details key={event.id} className="group">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-4 py-4 hover:bg-surface-2/50">
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${event.action === "INSERT" ? "bg-up/10 text-up" : event.action === "DELETE" ? "bg-down/10 text-down" : "bg-accent/10 text-accent"}`}>{event.action}</span>
                  <span className="font-medium text-sm">{event.entityType}</span>
                  <span className="font-mono text-[10px] text-muted">{event.entityId ? event.entityId.slice(0, 12) : "—"}</span>
                  <span className="ml-auto text-[10px] text-muted">{new Date(event.createdAt).toLocaleString("en-IN")}</span>
                </summary>
                <div className="grid gap-4 border-t border-border bg-surface-2/40 p-4 lg:grid-cols-2">
                  <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">Before</p><pre className="max-h-72 overflow-auto rounded-md border border-border bg-background p-3 text-[10px] leading-5 text-muted">{pretty(event.beforeData)}</pre></div>
                  <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">After</p><pre className="max-h-72 overflow-auto rounded-md border border-border bg-background p-3 text-[10px] leading-5 text-muted">{pretty(event.afterData)}</pre></div>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
