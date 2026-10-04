export function formatPrice(value: number | null, currency: string | null = "INR"): string {
  if (value === null) return "-";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency ?? "INR",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return value.toFixed(2);
  }
}

/** `isFraction` = true for ratios like 0.066 meaning 6.6%. False when the value is already percent-scaled (e.g. Yahoo's changePercent). */
export function formatPercent(value: number | null, isFraction = true): string {
  if (value === null) return "-";
  const pct = isFraction ? value * 100 : value;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

export function formatSigned(value: number | null, digits = 2): string {
  if (value === null) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}`;
}

export function formatNumber(value: number | null): string {
  if (value === null) return "-";
  return value.toLocaleString("en-IN");
}

/** Formats a large INR value using Indian units (Lakh, Crore, Lakh Crore). */
export function formatCompact(value: number | null): string {
  if (value === null) return "-";
  const abs = Math.abs(value);
  if (abs >= 1e12) return `₹${(value / 1e12).toFixed(2)} Lakh Cr`;
  if (abs >= 1e7) return `₹${(value / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}
