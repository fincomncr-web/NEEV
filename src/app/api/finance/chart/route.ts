import { NextRequest, NextResponse } from "next/server";
import { getChart } from "@/lib/yahoo";

export const dynamic = "force-dynamic";

const RANGE_CONFIG: Record<
  string,
  { days: number; interval: "5m" | "15m" | "60m" | "1d" | "1wk" | "1mo" }
> = {
  "1D": { days: 1, interval: "5m" },
  "5D": { days: 5, interval: "15m" },
  "1M": { days: 30, interval: "60m" },
  "6M": { days: 182, interval: "1d" },
  "1Y": { days: 365, interval: "1d" },
  "5Y": { days: 365 * 5, interval: "1wk" },
};

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol") ?? "";
  const range = (req.nextUrl.searchParams.get("range") ?? "6M").toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol query param." }, { status: 400 });
  }

  const config = RANGE_CONFIG[range] ?? RANGE_CONFIG["6M"];
  const period1 = new Date(Date.now() - config.days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  try {
    const candles = await getChart(symbol, period1, config.interval);
    return NextResponse.json({ candles });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch chart data." },
      { status: 502 }
    );
  }
}
