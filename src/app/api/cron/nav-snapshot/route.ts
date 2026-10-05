import { NextRequest, NextResponse } from "next/server";
import { getQuotes } from "@/lib/yahoo";
import { getCashBalance, listHoldings, recordNavSnapshot } from "@/lib/portfolio-db";
import { computeFundBreakdown, computeFundNav, computeFundValue } from "@/lib/fund-engine";

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function indiaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const holdings = await listHoldings();
    const active = holdings.filter((h) => h.status === "active");
    const quotes = active.length
      ? await getQuotes(active.map((h) => h.symbol))
      : [];
    const cash = await getCashBalance();

    if (cash === null) {
      return NextResponse.json(
        { error: "Cash ledger is unavailable; NAV snapshot was not created." },
        { status: 503 }
      );
    }

    const breakdown = computeFundBreakdown(holdings, quotes, cash);
    if (breakdown.valuationStatus !== "COMPLETE") {
      return NextResponse.json(
        {
          error: "NAV snapshot withheld because one or more active holdings do not have a reliable market quote.",
          missingQuoteSymbols: breakdown.missingQuoteSymbols,
        },
        { status: 409 }
      );
    }

    const fundValue = computeFundValue(holdings, quotes, cash);
    const unitNav = computeFundNav(fundValue);
    const entry = await recordNavSnapshot({
      date: indiaDate(),
      fundValue,
      unitNav,
      cash,
      valuationStatus: breakdown.valuationStatus,
      priceCoveragePct: breakdown.quoteCoveragePct,
    });

    return NextResponse.json({
      ok: true,
      snapshot: {
        date: entry.date,
        fundValue,
        nav: unitNav,
        cash,
        quoteCoveragePct: breakdown.quoteCoveragePct,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create NAV snapshot." },
      { status: 500 }
    );
  }
}
