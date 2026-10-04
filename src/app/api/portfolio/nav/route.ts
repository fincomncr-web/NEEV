import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";
import { addNavEntry, listNavHistory } from "@/lib/portfolio-db";

export async function GET() {
  const nav = await listNavHistory();
  return NextResponse.json({ nav });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!isAdminRequest(req, body?.passcode)) {
    return NextResponse.json({ error: "Invalid upload passcode." }, { status: 401 });
  }

  const date = String(body?.date ?? "").trim();
  const navValue = Number(body?.nav);
  const note = body?.note ? String(body.note).trim() : undefined;

  if (!date || !Number.isFinite(navValue) || navValue <= 0) {
    return NextResponse.json({ error: "A valid date and NAV value are required." }, { status: 400 });
  }

  try {
    const entry = await addNavEntry({ date, nav: navValue, note });
    revalidatePath("/");
    revalidatePath("/portfolio");
    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save NAV entry." },
      { status: 500 }
    );
  }
}
