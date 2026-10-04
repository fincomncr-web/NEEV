"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export default function AccountPage() {
  const { user, loading, configured, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && configured && !user) router.replace("/login");
  }, [loading, configured, user, router]);

  if (!configured) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-sm text-muted">
        Auth isn&apos;t configured yet.
      </div>
    );
  }

  if (loading || !user) {
    return <div className="mx-auto max-w-md px-4 py-24 text-center text-sm text-muted">Loading&hellip;</div>;
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="font-label text-xs text-accent">Member Access</p>
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-foreground">
        My account
      </h1>

      <div className="card mt-8 flex items-center gap-4 p-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/15 text-lg font-semibold text-accent">
          {user.email?.[0]?.toUpperCase() ?? "?"}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {(user.user_metadata?.full_name as string | undefined) ?? "Member"}
          </p>
          <p className="truncate text-sm text-muted">{user.email}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        className="mt-6 w-full rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2"
      >
        Sign out
      </button>
    </div>
  );
}
