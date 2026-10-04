/**
 * Splits one CSV line into fields, honoring double-quoted fields (which may
 * contain commas or escaped `""`) the way Google Sheets' CSV export writes them.
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(field);
      field = "";
    } else {
      field += ch;
    }
  }
  fields.push(field);
  return fields;
}

/** Parses a full CSV document into rows of fields, skipping blank lines. */
export function parseCsv(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0)
    .map(parseCsvLine);
}

export function normalizeDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export function parseNumber(raw: string | undefined): number {
  return parseFloat((raw ?? "").replace(/[^0-9.-]/g, ""));
}

/** Finds a header column by the first keyword it contains (case-insensitive). */
export function findColumn(header: string[], ...keywords: string[]): number {
  const lower = header.map((h) => h.trim().toLowerCase());
  for (const keyword of keywords) {
    const idx = lower.findIndex((h) => h.includes(keyword));
    if (idx !== -1) return idx;
  }
  return -1;
}

/**
 * Like findColumn, but skips any header that also contains one of `exclude` -
 * e.g. matching a bare "cost" keyword while refusing "Cost Basis" (a *total*,
 * not a per-share figure) so it doesn't get mistaken for the per-share cost.
 */
export function findColumnExcluding(header: string[], keyword: string, exclude: string[]): number {
  const lower = header.map((h) => h.trim().toLowerCase());
  return lower.findIndex((h) => h.includes(keyword) && !exclude.some((x) => h.includes(x)));
}

/**
 * Scans the first several rows for the real header row - i.e. the one that
 * satisfies at least `minMatches` of the given matcher checks - so a sheet
 * with a title row or blank row above the header still parses correctly.
 * Falls back to row 0 if nothing matches strongly enough.
 */
export function findHeaderRow(
  rows: string[][],
  matchers: Array<(header: string[]) => boolean>,
  minMatches: number
): number {
  const scanLimit = Math.min(rows.length, 20);
  for (let i = 0; i < scanLimit; i++) {
    if (matchers.filter((m) => m(rows[i])).length >= minMatches) return i;
  }
  return 0;
}

/** Always fetches the sheet fresh - no caching - so a spreadsheet edit shows up on the very next page load. */
export async function fetchCsv(url: string): Promise<string[][]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status}`);
  return parseCsv(await res.text());
}
