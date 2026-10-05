import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getCashBalance, listHoldings, listNavHistory } from "@/lib/portfolio-db";
import { getQuotes } from "@/lib/yahoo";
import { computeFundBreakdown, computeFundNav, computeFundValue } from "@/lib/fund-engine";
import { FUND_CONFIG } from "@/lib/sectors";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const holdings = await listHoldings();
    const active = holdings.filter((h) => h.status === "active");
    const quotes = active.length
      ? await getQuotes(active.map((h) => h.symbol)).catch(() => [])
      : [];
    const cashBalance = await getCashBalance();
    const currentValue = computeFundValue(holdings, quotes, cashBalance ?? undefined);
    const currentNav = computeFundNav(currentValue);
    const breakdown = computeFundBreakdown(holdings, quotes, cashBalance ?? undefined);
    const history = await listNavHistory();

    return NextResponse.json({
      current: {
        nav: currentNav,
        fundValue: currentValue,
        baseCapital: FUND_CONFIG.notionalAum,
        cash: breakdown.cash,
        holdingsValue: breakdown.holdingsValue,
        activeNames: breakdown.activeNames,
        quoteCoveragePct: breakdown.quoteCoveragePct,
        valuationStatus: breakdown.valuationStatus,
      },
      history,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to calculate NAV." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json(
    { error: "NAV is calculated automatically. Manual NAV entries are disabled." },
    { status: 405 }
  );
}
