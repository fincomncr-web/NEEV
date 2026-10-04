import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { listTransactions } from "@/lib/portfolio-db";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    return NextResponse.json({ transactions: await listTransactions() });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unable to load transactions." }, { status: 500 });
  }
}
