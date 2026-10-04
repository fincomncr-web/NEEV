import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getCashBalance, listCashLedger, recordCashEntry, type CashEntryType } from "@/lib/portfolio-db";

const TYPES: CashEntryType[] = [
  "INITIAL_CAPITAL","CONTRIBUTION","WITHDRAWAL","DIVIDEND",
  "EXPENSE","FEE","TAX","CORPORATE_ACTION","ADJUSTMENT",
];

function signedTypeOk(type: CashEntryType, amount: number): boolean {
  if (["INITIAL_CAPITAL","CONTRIBUTION","DIVIDEND","CORPORATE_ACTION"].includes(type)) return amount > 0;
  if (["WITHDRAWAL","EXPENSE","FEE","TAX"].includes(type)) return amount < 0;
  return amount !== 0;
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const [entries, balance] = await Promise.all([listCashLedger(), getCashBalance()]);
  return NextResponse.json({ entries, balance });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!isAdminRequest(req, body?.passcode)) {
    return NextResponse.json({ error: "Invalid admin passcode." }, { status: 401 });
  }

  const entryType = String(body?.entryType ?? "").trim().toUpperCase() as CashEntryType;
  const entryDate = String(body?.entryDate ?? "").trim();
  const amount = Number(body?.amount);
  const reference = body?.reference ? String(body.reference).trim() : undefined;
  const notes = body?.notes ? String(body.notes).trim() : undefined;

  if (!TYPES.includes(entryType) || !entryDate || !Number.isFinite(amount) || !signedTypeOk(entryType, amount)) {
    return NextResponse.json({ error: "Invalid cash ledger entry." }, { status: 400 });
  }

  try {
    const entry = await recordCashEntry({ entryDate, entryType, amount, reference, notes });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record cash entry." },
      { status: 400 }
    );
  }
}
