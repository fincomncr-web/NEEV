import type { Holding } from "./portfolio-db";
import { getCashBalance, listNavHistory, type NavEntry } from "./portfolio-db";
import type { QuoteData } from "./finance-types";
import { computeFundValue } from "./fund-engine";

export interface NavTimeline {
  history: NavEntry[];
  liveValue: number;
  source: "manual" | "computed";
  authoritative: boolean;
  cashBalance: number | null;
}

/**
 * Production NAV source of truth is the controlled Supabase ledger.
 * A live mark is shown separately and is never silently inserted into history.
 */
export async function getNavTimeline(holdings: Holding[], quotes: QuoteData[]): Promise<NavTimeline> {
  const [history, cashBalance] = await Promise.all([listNavHistory(), getCashBalance()]);
  const liveValue = computeFundValue(holdings, quotes, cashBalance ?? undefined);
  return {
    history,
    liveValue,
    source: history.length ? "manual" : "computed",
    authoritative: history.length > 0,
    cashBalance,
  };
}
