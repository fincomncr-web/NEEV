import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";
import { addInvestmentCase, listInvestmentCases } from "@/lib/portfolio-db";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const STATUSES = ["DRAFT", "UNDER_REVIEW", "APPROVED", "ARCHIVED", "WITHDRAWN"];

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function normaliseBody(body: any) {
  return {
    symbol: String(body?.symbol ?? "").trim().toUpperCase(),
    companyName: String(body?.companyName ?? "").trim(),
    sectorCode: String(body?.sectorCode ?? "").trim(),
    status: String(body?.status ?? "DRAFT").trim().toUpperCase(),
    thesis: String(body?.thesis ?? "").trim(),
    keyRisks: body?.keyRisks ? String(body.keyRisks).trim() : null,
    thesisBreakers: body?.thesisBreakers ? String(body.thesisBreakers).trim() : null,
    valuationMethod: body?.valuationMethod ? String(body.valuationMethod).trim() : null,
    bearCase: body?.bearCase ? String(body.bearCase).trim() : null,
    baseCase: body?.baseCase ? String(body.baseCase).trim() : null,
    bullCase: body?.bullCase ? String(body.bullCase).trim() : null,
    bearValue: numberOrNull(body?.bearValue),
    baseValue: numberOrNull(body?.baseValue),
    bullValue: numberOrNull(body?.bullValue),
    proposedWeight: numberOrNull(body?.proposedWeight),
    sourceReportId: body?.sourceReportId ? String(body.sourceReportId).trim() : null,
  };
}

function validate(input: ReturnType<typeof normaliseBody>) {
  if (!input.symbol || !input.companyName || !input.sectorCode || !input.thesis) return "Symbol, company, sector and thesis are required.";
  if (!STATUSES.includes(input.status)) return "Invalid investment case status.";
  if ([input.bearValue, input.baseValue, input.bullValue, input.proposedWeight].some((n) => typeof n === "number" && Number.isNaN(n))) return "Scenario values must be valid numbers.";
  if (input.proposedWeight !== null && (input.proposedWeight < 0 || input.proposedWeight > 1)) return "Proposed weight must be between 0 and 1.";
  return null;
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    return NextResponse.json({ cases: await listInvestmentCases() });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unable to load cases." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!isAdminRequest(req, body?.passcode)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSupabaseConfigured) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const input = normaliseBody(body);
  const validation = validate(input);
  if (validation) return NextResponse.json({ error: validation }, { status: 400 });

  try {
    const item = await addInvestmentCase(input);
    revalidatePath("/company/" + input.symbol);
    return NextResponse.json({ case: item }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to create investment case." }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!isAdminRequest(req, body?.passcode)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSupabaseConfigured) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const id = String(body?.id ?? "").trim();
  if (!id) return NextResponse.json({ error: "Investment case id is required." }, { status: 400 });

  const input = normaliseBody(body);
  const validation = validate(input);
  if (validation) return NextResponse.json({ error: validation }, { status: 400 });

  const { data, error } = await supabase
    .from("investment_cases")
    .update({
      symbol: input.symbol,
      company_name: input.companyName,
      sector_code: input.sectorCode,
      status: input.status,
      thesis: input.thesis,
      key_risks: input.keyRisks,
      thesis_breakers: input.thesisBreakers,
      valuation_method: input.valuationMethod,
      bear_case: input.bearCase,
      base_case: input.baseCase,
      bull_case: input.bullCase,
      bear_value: input.bearValue,
      base_value: input.baseValue,
      bull_value: input.bullValue,
      proposed_weight: input.proposedWeight,
      source_report_id: input.sourceReportId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  revalidatePath("/company/" + input.symbol);
  return NextResponse.json({ case: {
    id: data.id,
    symbol: data.symbol,
    companyName: data.company_name,
    sectorCode: data.sector_code,
    status: data.status,
    thesis: data.thesis,
    keyRisks: data.key_risks,
    thesisBreakers: data.thesis_breakers,
    valuationMethod: data.valuation_method,
    bearCase: data.bear_case,
    baseCase: data.base_case,
    bullCase: data.bull_case,
    bearValue: data.bear_value == null ? null : Number(data.bear_value),
    baseValue: data.base_value == null ? null : Number(data.base_value),
    bullValue: data.bull_value == null ? null : Number(data.bull_value),
    proposedWeight: data.proposed_weight == null ? null : Number(data.proposed_weight),
    sourceReportId: data.source_report_id,
  } satisfies Record<string, unknown> });
}
