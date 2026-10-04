"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  IconBuilding,
  IconCompass,
  IconMarkets,
  IconNews,
  IconPortfolio,
  IconReports,
  IconSearch,
  IconShield,
  IconSprout,
} from "@/components/icons/FinanceIcons";

const NAV_GROUPS = [
  {
    label: "Overview",
    links: [{ href: "/", label: "Home", icon: IconCompass }],
  },
  {
    label: "The Fund",
    links: [
      { href: "/fund", label: "Fund Overview", icon: IconBuilding },
      { href: "/portfolio/charter", label: "Fund Charter", icon: IconShield },
    ],
  },
  {
    label: "Portfolio",
    links: [
      { href: "/portfolio", label: "Portfolio Overview", icon: IconPortfolio },
      { href: "/performance", label: "Performance", icon: IconReports },
      { href: "/risk", label: "Risk & Compliance", icon: IconShield },
      { href: "/portfolio/register", label: "IC Decision Register", icon: IconBuilding },
    ],
  },
  {
    label: "Research & Library",
    links: [
      { href: "/industries", label: "NEEV Research", icon: IconCompass },
      { href: "/reports", label: "NEEV Library", icon: IconReports },
    ],
  },
  {
    label: "Markets",
    links: [
      { href: "/markets", label: "Live Markets", icon: IconMarkets },
      { href: "/search", label: "Company Search", icon: IconSearch },
      { href: "/news", label: "Finance News", icon: IconNews },
    ],
  },
  {
    label: "About",
    links: [{ href: "/about", label: "About NEEV", icon: IconSprout }],
  },
];

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const { user, loading, configured } = useAuth();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 max-w-[78vw] flex-col overflow-hidden border-r border-border bg-background shadow-2xl transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        } lg:translate-x-0 lg:pointer-events-auto ${collapsed ? "lg:w-[76px]" : "lg:w-64"}`}
      >
        <div className={`flex items-center gap-2 border-b border-border px-4 py-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          <Link
            href="/"
            onClick={onCloseMobile}
            className={`flex min-w-0 shrink flex-col gap-1.5 ${collapsed ? "lg:hidden" : ""}`}
          >
            {/* Full logo - legible "GREAT LAKES GURGAON / FINCEPTION" text, shown whenever there's room. */}
            <span className="inline-flex w-fit shrink-0 items-center justify-center rounded-md px-2 py-1.5">
              <Image
                src="/logo.png"
                alt="Great Lakes Institute of Management, Gurgaon - Finception"
                width={876}
                height={412}
                priority
                className="h-10 w-auto"
              />
            </span>
            <span className="font-label truncate text-[9px] text-muted">
              NEEV by Finception
            </span>
          </Link>

          <button
            type="button"
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted transition-colors hover:text-foreground lg:inline-flex"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
            >
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-foreground lg:hidden"
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div
                className={`font-label px-3 pb-1.5 text-[10px] text-accent/80 ${
                  collapsed ? "lg:hidden" : ""
                }`}
              >
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.links.map((link) => {
                  const active = pathname === link.href.split("?")[0] && !link.href.includes("?");
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onCloseMobile}
                      title={collapsed ? link.label : undefined}
                      className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                        active
                          ? "bg-surface-2 text-accent"
                          : "text-muted hover:translate-x-0.5 hover:bg-surface-2 hover:text-foreground"
                      } ${collapsed ? "lg:justify-center" : ""}`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent shadow-[0_0_8px_1px_rgba(34,197,94,0.6)]" />
                      )}
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className={collapsed ? "lg:hidden" : ""}>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={`border-t border-border p-3 ${collapsed ? "lg:px-2" : ""}`}>
          {!configured || loading ? null : user ? (
            <div className={`flex items-center gap-2.5 rounded-md px-2 py-2 ${collapsed ? "lg:justify-center" : ""}`}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
                {user.email?.[0]?.toUpperCase() ?? "?"}
              </span>
              <div className={`min-w-0 flex-1 ${collapsed ? "lg:hidden" : ""}`}>
                <p className="truncate text-xs font-medium text-foreground">{user.email}</p>
                <Link href="/account" className="text-[11px] text-muted hover:text-accent">
                  My account
                </Link>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={onCloseMobile}
              className={`flex items-center justify-center gap-2 rounded-md border border-accent/40 px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 ${
                collapsed ? "lg:px-0" : ""
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className={collapsed ? "lg:hidden" : ""}>Sign in</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
