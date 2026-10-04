import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { addReport, deleteReport, listReports, uploadReportFile, type ReportType } from "@/lib/reports-db";

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25MB

export async function GET() {
  const reports = await listReports();
  return NextResponse.json({ reports });
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  if (!isAdminRequest(req, formData.get("passcode"))) {
    return NextResponse.json({ error: "Invalid upload passcode." }, { status: 401 });
  }

  const title = String(formData.get("title") ?? "").trim();
  const sector = String(formData.get("sector") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const authors = String(formData.get("authors") ?? "").trim() || "Finception Research Desk";
  const date = String(formData.get("date") ?? "").trim() || new Date().toISOString().slice(0, 10);
  const allowedTypes: ReportType[] = [
    "monthly_review",
    "industry_report",
    "investment_memo",
    "performance_report",
    "portfolio_review",
    "ic_record",
    "annual_review",
    "methodology",
    "disclosure",
    "other",
  ];
  const requestedType = String(formData.get("type") ?? "other");
  const type: ReportType = allowedTypes.includes(requestedType as ReportType)
    ? (requestedType as ReportType)
    : "other";
  const file = formData.get("file");

  if (!title || !sector || !summary) {
    return NextResponse.json(
      { error: "Title, sector and summary are required." },
      { status: 400 }
    );
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "A PDF file is required." }, { status: 400 });
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF files are accepted." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File exceeds the 25MB limit." }, { status: 400 });
  }

  try {
    const { fileName, fileUrl } = await uploadReportFile(file);
    const report = await addReport({
      title,
      sector,
      summary,
      date,
      authors,
      fileName,
      fileUrl,
      fileSizeBytes: file.size,
      type,
      issueNumber: formData.get("issueNumber") ? Number(formData.get("issueNumber")) : null,
      version: formData.get("version") ? Number(formData.get("version")) : 1,
      publicationStatus: (String(formData.get("publicationStatus") ?? "IN_REVIEW")) as "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "SUPERSEDED" | "WITHDRAWN",
      dataCutoff: formData.get("dataCutoff") ? String(formData.get("dataCutoff")) : null,
    });
    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const id = body?.id ? String(body.id) : "";

  if (!isAdminRequest(req, body?.passcode)) {
    return NextResponse.json({ error: "Invalid upload passcode." }, { status: 401 });
  }
  if (!id) {
    return NextResponse.json({ error: "Missing report id." }, { status: 400 });
  }

  try {
    const deleted = await deleteReport(id);
    if (!deleted) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Withdraw failed." },
      { status: 500 }
    );
  }
}
