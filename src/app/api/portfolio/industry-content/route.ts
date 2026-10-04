import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { checkPasscode } from "@/lib/admin-auth";
import {
  listAllIndustryContent,
  listIndustryContent,
  upsertIndustryContent,
} from "@/lib/portfolio-db";
import { getLayer, getSector } from "@/lib/sectors";

export async function GET(req: NextRequest) {
  const sector = req.nextUrl.searchParams.get("sector");
  const content = sector ? await listIndustryContent(sector) : await listAllIndustryContent();
  return NextResponse.json({ content });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!checkPasscode(body?.passcode)) {
    return NextResponse.json({ error: "Invalid upload passcode." }, { status: 401 });
  }

  const sectorSlug = String(body?.sectorSlug ?? "").trim();
  const layer = String(body?.layer ?? "").trim();
  const title = String(body?.title ?? "").trim();
  const content = String(body?.content ?? "").trim();

  if (!getSector(sectorSlug)) {
    return NextResponse.json({ error: "Unknown sector." }, { status: 400 });
  }
  if (!getLayer(layer)) {
    return NextResponse.json({ error: "Unknown layer." }, { status: 400 });
  }
  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
  }

  try {
    const entry = await upsertIndustryContent({ sectorSlug, layer, title, content });
    revalidatePath("/");
    revalidatePath("/portfolio");
    revalidatePath("/industries");
    revalidatePath(`/industries/${sectorSlug}`);
    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save content." },
      { status: 500 }
    );
  }
}
