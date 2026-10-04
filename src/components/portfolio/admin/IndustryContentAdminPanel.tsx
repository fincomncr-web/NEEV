"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { IndustryContentEntry } from "@/lib/portfolio-db";
import { LAYERS, SECTORS } from "@/lib/sectors";

export default function IndustryContentAdminPanel({ passcode }: { passcode: string }) {
  const [content, setContent] = useState<IndustryContentEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [sectorSlug, setSectorSlug] = useState(SECTORS[0].slug);
  const [layer, setLayer] = useState(LAYERS[0].key);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function load() {
    const res = await fetch("/api/portfolio/industry-content");
    const data = await res.json();
    setContent(data.content ?? []);
  }

  useEffect(() => {
    queueMicrotask(() => load());
  }, []);

  useEffect(() => {
    const existing = content.find((c) => c.sectorSlug === sectorSlug && c.layer === layer);
    queueMicrotask(() => {
      setTitle(existing?.title ?? "");
      setBody(existing?.content ?? "");
    });
  }, [sectorSlug, layer, content]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/portfolio/industry-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode, sectorSlug, layer, title, content: body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to save." });
        return;
      }
      setMessage({ type: "success", text: "Content saved." });
      await load();
    } catch {
      setMessage({ type: "error", text: "Failed to save. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
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

      <div className="card overflow-x-auto p-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr>
              <th className="px-2 py-2 font-medium text-muted">Sector</th>
              {LAYERS.map((l) => (
                <th key={l.key} className="px-2 py-2 text-center font-medium text-muted">
                  {l.month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SECTORS.map((s) => (
              <tr key={s.slug}>
                <td className="whitespace-nowrap px-2 py-2 text-foreground">{s.name}</td>
                {LAYERS.map((l) => {
                  const published = content.some(
                    (c) => c.sectorSlug === s.slug && c.layer === l.key
                  );
                  const active = sectorSlug === s.slug && layer === l.key;
                  return (
                    <td key={l.key} className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSectorSlug(s.slug);
                          setLayer(l.key);
                        }}
                        className={`h-5 w-5 rounded-full border transition-colors ${
                          active
                            ? "border-accent bg-accent"
                            : published
                              ? "border-accent bg-accent/30"
                              : "border-border bg-transparent hover:border-accent"
                        }`}
                        title={`${s.name} · ${l.label}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleSubmit} className="card mt-6 grid gap-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Sector</label>
            <select
              value={sectorSlug}
              onChange={(e) => setSectorSlug(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
            >
              {SECTORS.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Layer</label>
            <select
              value={layer}
              onChange={(e) => setLayer(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
            >
              {LAYERS.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.month} - {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Section Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Should we invest in Indian Banking?"
            className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Content</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={10}
            placeholder="Write this month's research for this layer..."
            className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#070908] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save Section"}
        </button>
      </form>
    </div>
  );
}
