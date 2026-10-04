"use client";

import { useSummary } from "@/lib/use-finance";
import { formatNumber } from "@/lib/format";

export default function CompanyProfileCard({ symbol }: { symbol: string }) {
  const { profile, loading, error } = useSummary(symbol);

  if (error) return <p className="text-sm text-down">Failed to load company profile.</p>;
  if (loading && !profile) return <p className="text-sm text-muted">Loading profile…</p>;
  if (!profile) return <p className="text-sm text-muted">No profile data available.</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted">Sector</p>
          <p className="mt-0.5 text-sm text-foreground">{profile.sector ?? "-"}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Industry</p>
          <p className="mt-0.5 text-sm text-foreground">{profile.industry ?? "-"}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Employees</p>
          <p className="mt-0.5 text-sm text-foreground">{formatNumber(profile.employees)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Headquarters</p>
          <p className="mt-0.5 text-sm text-foreground">
            {[profile.city, profile.country].filter(Boolean).join(", ") || "-"}
          </p>
        </div>
        {profile.website && (
          <div>
            <p className="text-xs text-muted">Website</p>
            <a
              href={profile.website}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-0.5 block truncate text-sm text-accent hover:underline"
            >
              {profile.website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        )}
      </div>
      {profile.description && (
        <p className="line-clamp-6 text-sm leading-relaxed text-muted">{profile.description}</p>
      )}
    </div>
  );
}
