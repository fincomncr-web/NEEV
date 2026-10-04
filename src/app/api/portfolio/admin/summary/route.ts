import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getCashBalance, listAllIndustryContent, listDecisions, listHoldings, listInvestmentCases, listTransactions } from "@/lib/portfolio-db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { listReports } from "@/lib/reports-db";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const [cashBalance, holdings, transactions, decisions, cases, reports, industryContent] = await Promise.all([
      getCashBalance(),
      listHoldings(),
      listTransactions(),
      listDecisions(),
      listInvestmentCases(),
      listReports(),
      listAllIndustryContent(),
    ]);

    const summary = {
      cashBalance,
      holdings: {
        active: holdings.filter((h) => h.status === "active").length,
        exited: holdings.filter((h) => h.status === "exited").length,
      },
      transactions: transactions.length,
      decisions: {
        total: decisions.length,
        draft: decisions.filter((d) => d.status === "DRAFT").length,
        approved: decisions.filter((d) => d.status === "APPROVED").length,
      },
      cases: {
        total: cases.length,
        draft: cases.filter((c) => c.status === "DRAFT" || c.status === "UNDER_REVIEW").length,
        approved: cases.filter((c) => c.status === "APPROVED").length,
      },
      reports: {
        total: reports.length,
        published: reports.filter((r) => r.publicationStatus === "PUBLISHED").length,
        inReview: reports.filter((r) => r.publicationStatus === "IN_REVIEW").length,
      },
      industryContent,
      readiness: {
        supabase: isSupabaseConfigured,
        auth: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        adminSession: !!process.env.REPORTS_UPLOAD_PASSCODE,
        ledger: isSupabaseConfigured,
      },
    };

    return NextResponse.json({ summary });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to build admin summary." }, { status: 500 });
  }
}
