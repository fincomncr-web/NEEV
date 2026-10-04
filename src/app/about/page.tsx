import type { Metadata } from "next";
import Link from "next/link";
import { FUND_CONFIG } from "@/lib/sectors";

export const metadata: Metadata = {
  title: "About NEEV",
  description: "About NEEV, Finception and Great Lakes Institute of Management.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-12">
        <p className="font-label text-[11px] text-accent">ABOUT</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">NEEV is the investment initiative. Finception is the institution behind it.</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
          {FUND_CONFIG.fundLongName} is a student-managed Indian equity investment initiative
          operated through Finception, the Finance Club of Great Lakes Institute of Management, Gurgaon.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          ["NEEV", "Investment research, portfolio construction, valuation and monitoring."],
          ["Finception", "Finance Club responsible for the broader student finance ecosystem and NEEV initiative."],
          ["Great Lakes", "The academic institution under which the student initiative operates."],
        ].map(([title, text]) => (
          <div key={title} className="card p-6">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
          </div>
        ))}
      </div>

      <section className="mt-10 card p-7">
        <h2 className="text-xl font-semibold">How to explore NEEV</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link href="/fund" className="rounded-lg border border-border p-4 hover:border-accent"><span className="font-medium">Understand the Fund</span><p className="mt-1 text-xs text-muted">Objective, philosophy and process.</p></Link>
          <Link href="/portfolio" className="rounded-lg border border-border p-4 hover:border-accent"><span className="font-medium">View Portfolio</span><p className="mt-1 text-xs text-muted">Holdings, allocation and current fund information.</p></Link>
          <Link href="/industries" className="rounded-lg border border-border p-4 hover:border-accent"><span className="font-medium">Explore Research</span><p className="mt-1 text-xs text-muted">Sector work and published research.</p></Link>
          <Link href="/methodology" className="rounded-lg border border-border p-4 hover:border-accent"><span className="font-medium">Read Methodology</span><p className="mt-1 text-xs text-muted">Definitions, limitations and calculation methods.</p></Link>
        </div>
      </section>
    </div>
  );
}
