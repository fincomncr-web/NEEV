import { randomUUID } from "crypto";
import { REPORTS_BUCKET, supabase } from "./supabase";

export type ReportType =
  | "monthly_review"
  | "industry_report"
  | "investment_memo"
  | "performance_report"
  | "portfolio_review"
  | "ic_record"
  | "annual_review"
  | "methodology"
  | "disclosure"
  | "other";

export interface IndustryReport {
  id: string;
  title: string;
  sector: string;
  summary: string;
  date: string;
  authors: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  uploadedAt: string;
  type: ReportType;
  issueNumber: number | null;
  version: number;
  publicationStatus: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "SUPERSEDED" | "WITHDRAWN";
  dataCutoff: string | null;
}

interface ReportRow {
  id: string;
  title: string;
  sector: string;
  summary: string;
  date: string;
  authors: string;
  file_name: string;
  file_url: string;
  file_size_bytes: number;
  uploaded_at: string;
  type: string;
  issue_number: number | null;
  version: number;
  publication_status: string;
  data_cutoff: string | null;
}

function fromRow(row: ReportRow): IndustryReport {
  return {
    id: row.id,
    title: row.title,
    sector: row.sector,
    summary: row.summary,
    date: row.date,
    authors: row.authors,
    fileName: row.file_name,
    fileUrl: row.file_url,
    fileSizeBytes: row.file_size_bytes,
    uploadedAt: row.uploaded_at,
    issueNumber: row.issue_number ?? null,
    version: row.version ?? 1,
    publicationStatus: ["DRAFT","IN_REVIEW","PUBLISHED","SUPERSEDED","WITHDRAWN"].includes(row.publication_status) ? row.publication_status as IndustryReport["publicationStatus"] : "IN_REVIEW",
    dataCutoff: row.data_cutoff ?? null,
    type: [
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
    ].includes(row.type)
      ? (row.type as ReportType)
      : "other",
  };
}

export async function listReports(): Promise<IndustryReport[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("date", { ascending: false })
    .order("uploaded_at", { ascending: false });

  if (error) throw new Error(`Failed to list reports: ${error.message}`);
  return (data as ReportRow[]).map(fromRow);
}

let bucketReady: Promise<void> | null = null;

function ensureBucket(): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) throw new Error(`Failed to list storage buckets: ${error.message}`);
      if (buckets.some((b) => b.name === REPORTS_BUCKET)) return;

      const { error: createError } = await supabase.storage.createBucket(REPORTS_BUCKET, {
        public: true,
        fileSizeLimit: "25MB",
        allowedMimeTypes: ["application/pdf"],
      });
      if (createError) throw new Error(`Failed to create storage bucket: ${createError.message}`);
    })().catch((err) => {
      bucketReady = null;
      throw err;
    });
  }
  return bucketReady;
}

export async function uploadReportFile(
  file: File
): Promise<{ fileName: string; fileUrl: string }> {
  await ensureBucket();

  const safeBase =
    file.name
      .toLowerCase()
      .replace(/\.pdf$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-+|-+$)/g, "")
      .slice(0, 60) || "report";
  const fileName = `${Date.now()}-${safeBase}.pdf`;

  const { error } = await supabase.storage
    .from(REPORTS_BUCKET)
    .upload(fileName, file, { contentType: "application/pdf" });
  if (error) throw new Error(`Failed to upload PDF: ${error.message}`);

  const { data } = supabase.storage.from(REPORTS_BUCKET).getPublicUrl(fileName);
  return { fileName, fileUrl: data.publicUrl };
}

export async function addReport(
  input: Omit<IndustryReport, "id" | "uploadedAt">
): Promise<IndustryReport> {
  const row = {
    id: randomUUID(),
    title: input.title,
    sector: input.sector,
    summary: input.summary,
    date: input.date,
    authors: input.authors,
    file_name: input.fileName,
    file_url: input.fileUrl,
    file_size_bytes: input.fileSizeBytes,
    uploaded_at: new Date().toISOString(),
    type: input.type,
    issue_number: input.issueNumber ?? null,
    version: input.version ?? 1,
    publication_status: input.publicationStatus ?? "IN_REVIEW",
    data_cutoff: input.dataCutoff ?? null,
  };

  const { data, error } = await supabase.from("reports").insert(row).select().single();
  if (error) throw new Error(`Failed to save report: ${error.message}`);
  return fromRow(data as ReportRow);
}

export async function deleteReport(id:string):Promise<boolean>{
  const {data,error}=await supabase.from("reports").update({publication_status:"WITHDRAWN"}).eq("id",id).select("id").maybeSingle();
  if(error)throw new Error(`Failed to withdraw report: ${error.message}`);
  return !!data;
}
