import Image from "next/image";
import Link from "next/link";
import { IconInstagram, IconLinkedin } from "@/components/icons/FinanceIcons";

const CONTACT_EMAIL = "fincom.ncr@greatlakes.edu.in";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <span className="inline-flex items-center rounded-md px-3 py-2.5">
              <Image
                src="/logo.png"
                alt="Finception, Great Lakes Institute of Management, Gurgaon"
                width={876}
                height={412}
                className="h-12 w-auto"
              />
            </span>
            <p className="mt-4 max-w-xs text-sm text-muted">
              The official Finance Club of Great Lakes Institute of Management, Gurgaon, running a student managed investment fund with the discipline of an equity research
              desk.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://in.linkedin.com/company/finception"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent/50 hover:text-accent"
              >
                <IconLinkedin className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/finception.in/"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent/50 hover:text-accent"
              >
                <IconInstagram className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-4 text-sm text-muted">
              For any query, mail us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
            <div className="mt-5 flex flex-wrap gap-2 font-mono text-[10px] text-muted">
              <span className="rounded-full border border-border px-2.5 py-1">Benchmark: Nifty 500 TRI</span>

            </div>
          </div>

          <div>
            <h3 className="font-label text-xs text-accent">Fund &amp; Research</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li><Link href="/portfolio" className="inline-block transition-transform hover:translate-x-0.5 hover:text-accent">Portfolio</Link></li>
              <li><Link href="/portfolio/register" className="inline-block transition-transform hover:translate-x-0.5 hover:text-accent">Decision Register</Link></li>
              <li><Link href="/portfolio/charter" className="inline-block transition-transform hover:translate-x-0.5 hover:text-accent">Fund Charter</Link></li>
              <li><Link href="/industries" className="inline-block transition-transform hover:translate-x-0.5 hover:text-accent">Industries</Link></li>
              <li><Link href="/reports" className="inline-block transition-transform hover:translate-x-0.5 hover:text-accent">Research Library</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-label text-xs text-accent">Markets &amp; About</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li><Link href="/markets" className="inline-block transition-transform hover:translate-x-0.5 hover:text-accent">Live Markets</Link></li>
              <li><Link href="/search" className="inline-block transition-transform hover:translate-x-0.5 hover:text-accent">Company Search</Link></li>
              <li><Link href="/news" className="inline-block transition-transform hover:translate-x-0.5 hover:text-accent">Finance News</Link></li>
              <li><Link href="/neev" className="inline-block transition-transform hover:translate-x-0.5 hover:text-accent">Neev by Finception</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Finception, Great Lakes Institute of Management, Gurgaon. All rights reserved.</p>
          <p>Market data powered by Yahoo Finance.</p>
        </div>
      </div>
    </footer>
  );
}
