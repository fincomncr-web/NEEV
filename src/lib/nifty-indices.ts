import { FUND_CONFIG } from "./sectors";

export interface BenchmarkPoint {
  time: string;
  close: number;
}

const TRI_URL = "https://www.niftyindices.com/Backpage.aspx/getTotalReturnIndexString";
const TRI_REFERER = "https://www.niftyindices.com/reports/historical-data";

function formatNiftyDate(date: Date) {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getUTCMonth()];
  return `${day} ${month} ${date.getUTCFullYear()}`;
}

function parseNiftyDate(value: string): string | null {
  const match = value.trim().match(/^(\d{2}) ([A-Za-z]{3}) (\d{4})$/);
  if (!match) return null;
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const month = months[match[2]];
  if (month === undefined) return null;
  const date = new Date(Date.UTC(Number(match[3]), month, Number(match[1])));
  return date.toISOString().slice(0, 10);
}

async function fetchTriChunk(start: Date, end: Date): Promise<BenchmarkPoint[]> {
  const inner = `{'name':'NIFTY 500','startDate':'${formatNiftyDate(start)}','endDate':'${formatNiftyDate(end)}','indexName':'NIFTY 500'}`;
  const response = await fetch(TRI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      Referer: TRI_REFERER,
      Origin: "https://www.niftyindices.com",
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    },
    body: JSON.stringify({ cinfo: inner }),
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) throw new Error(`NIFTY 500 TRI request failed: ${response.status}`);

  const payload = (await response.json()) as { d?: string | unknown[] };
  const raw = payload.d;
  if (!raw) return [];

  const rows =
    typeof raw === "string"
      ? raw === "[]" || raw.toLowerCase() === "false"
        ? []
        : (JSON.parse(raw) as Array<Record<string, unknown>>)
      : Array.isArray(raw)
        ? raw as Array<Record<string, unknown>>
        : [];

  return rows
    .map((row) => {
      const time = typeof row.Date === "string" ? parseNiftyDate(row.Date) : null;
      const close = Number(row.TotalReturnsIndex);
      return time && Number.isFinite(close) && close > 0 ? { time, close } : null;
    })
    .filter((row): row is BenchmarkPoint => row !== null);
}

export async function getNifty500TriHistory(startDate?: string): Promise<BenchmarkPoint[]> {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);

  let start = startDate ? new Date(`${startDate}T00:00:00Z`) : new Date(end);
  if (Number.isNaN(start.getTime())) start = new Date(end);
  if (start > end) start = new Date(end);

  const chunks: BenchmarkPoint[] = [];
  let cursor = new Date(start);

  while (cursor <= end) {
    const chunkEnd = new Date(cursor);
    chunkEnd.setUTCDate(chunkEnd.getUTCDate() + 350);
    if (chunkEnd > end) chunkEnd.setTime(end.getTime());

    try {
      chunks.push(...(await fetchTriChunk(cursor, chunkEnd)));
    } catch {
      // Benchmark failure must not take down the public portfolio page.
      return [];
    }

    cursor = new Date(chunkEnd);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const unique = new Map<string, BenchmarkPoint>();
  for (const row of chunks) unique.set(row.time, row);
  return [...unique.values()].sort((a, b) => a.time.localeCompare(b.time));
}

export const NIFTY500_TRI_NAME = FUND_CONFIG.benchmarkName;
