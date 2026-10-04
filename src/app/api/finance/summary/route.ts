import { NextRequest, NextResponse } from "next/server";
import { getCompanyProfile, getFinancialHighlights } from "@/lib/yahoo";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol") ?? "";
  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol query param." }, { status: 400 });
  }

  try {
    const [profile, financials] = await Promise.all([
      getCompanyProfile(symbol),
      getFinancialHighlights(symbol),
    ]);
    return NextResponse.json({ profile, financials });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch summary." },
      { status: 502 }
    );
  }
}
