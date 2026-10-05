import type { Holding } from "./portfolio-db";
import { getCashBalance, listNavHistory, type NavEntry } from "./portfolio-db";
import type { QuoteData } from "./finance-types";
import { computeFundNav, computeFundValue } from "./fund-engine";

export interface NavTimeline {
  history: NavEntry[];
  liveValue: number;
  liveNav: number;
  source: "computed";
  authoritative: boolean;
  cashBalance: number | null;
}

/**
 * Live NEEV NAV is always calculated from the current portfolio value.
 * Base capital is the configured notional capital (currently ₹10 lakh):
 *
 * NAV = Current Fund Value / Base Capital
 *
 * Historical nav_history rows are retained only for legacy/history display and
 * are never used to override the live NAV.
 */
export async function getNavTimeline(holdings: Holding[], quotes: QuoteData[]): Promise<NavTimeline> {
  const [history, cashBalance] = await Promise.all([listNavHistory(), getCashBalance()]);
  const liveValue = computeFundValue(holdings, quotes, cashBalance ?? undefined);
  const liveNav = computeFundNav(liveValue);

  return {
    history,
    liveValue,
    liveNav,
    source: "computed",
    authoritative: true,
    cashBalance,
  };
}
