import { NextRequest, NextResponse } from "next/server";
import { getChart } from "@/lib/yahoo";
import { FUND_CONFIG } from "@/lib/sectors";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!FUND_CONFIG.benchmarkSymbol) {
    return NextResponse.json(
      { error: "A verified Nifty 500 TRI market-data series is not configured yet." },
      { status: 503 }
    );
  }

  const since =
    req.nextUrl.searchParams.get("since") ??
    new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  try {
    const candles = await getChart(FUND_CONFIG.benchmarkSymbol, since, "1d");
    return NextResponse.json({ candles });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch benchmark data." },
      { status: 502 }
    );
  }
}
