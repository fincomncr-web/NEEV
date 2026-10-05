import type { Holding, NavEntry } from "./portfolio-db";
import { getCashBalance, listNavHistory } from "./portfolio-db";
import type { QuoteData } from "./finance-types";
import { computeFundNav, computeFundValue } from "./fund-engine";
import { FUND_CONFIG } from "./sectors";

export interface NavTimeline {
  history: NavEntry[];
  liveValue: number;
  liveNav: number;
  source: "computed";
  authoritative: boolean;
  cashBalance: number | null;
}

/**
 * Live NEEV NAV:
 *
 *     NAV = Current Fund Value / Base Capital
 *
 * Historical rows are normalised to unit NAV as well, so every performance chart
 * and return calculation uses the same NAV series. The current live point is
 * appended to the in-memory timeline and is not written to the database here.
 */
export async function getNavTimeline(
  holdings: Holding[],
  quotes: QuoteData[]
): Promise<NavTimeline> {
  const [rawHistory, cashBalance] = await Promise.all([
    listNavHistory(),
    getCashBalance(),
  ]);

  const liveValue = computeFundValue(holdings, quotes, cashBalance ?? undefined);
  const liveNav = computeFundNav(liveValue);

  const history = rawHistory
    .map((entry) => ({
      ...entry,
      nav: entry.unitNav ?? entry.nav / FUND_CONFIG.notionalAum,
      unitNav: entry.unitNav ?? entry.nav / FUND_CONFIG.notionalAum,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const existingToday = history.find((entry) => entry.date === today);
  const livePoint: NavEntry = {
    id: "live-nav",
    date: today,
    nav: liveNav,
    note: "Live NAV",
    unitNav: liveNav,
    totalAssets: liveValue,
    cash: cashBalance,
    liabilities: 0,
    valuationStatus: "LIVE",
    priceCoveragePct: null,
  };

  const combined = existingToday
    ? history.map((entry) => (entry.date === today ? livePoint : entry))
    : [...history, livePoint];

  return {
    history: combined.sort((a, b) => a.date.localeCompare(b.date)),
    liveValue,
    liveNav,
    source: "computed",
    authoritative: true,
    cashBalance,
  };
}
