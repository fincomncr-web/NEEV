import type { Holding } from "./portfolio-db";
import { listNavHistory, type NavEntry } from "./portfolio-db";
import type { QuoteData } from "./finance-types";
import { computeFundValue } from "./fund-engine";

export interface NavTimeline {
  history: NavEntry[];
  liveValue: number;
  source: "manual" | "computed";
  authoritative: boolean;
}

/**
 * Production NAV source of truth is the controlled Supabase ledger.
 * A live mark is shown separately and is never silently inserted into history.
 */
export async function getNavTimeline(holdings: Holding[], quotes: QuoteData[]): Promise<NavTimeline> {
  const history = await listNavHistory();
  const liveValue = computeFundValue(holdings, quotes);
  return { history, liveValue, source: history.length ? "manual" : "computed", authoritative: history.length > 0 };
}
