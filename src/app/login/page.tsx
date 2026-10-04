"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { HeroChartIllustration } from "@/components/icons/FinanceIcons";
import FinanceBackdrop from "@/components/FinanceBackdrop";

export default function LoginPage() {
  const router = useRouter();
  const { configured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabaseBrowser) return;
    setSubmitting(true);
    setError(null);
    const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="grid min-h-[calc(100vh-1px)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-border bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 bg-grid opacity-60"
        />
        <FinanceBackdrop />
        <div className="relative">
          <p className="font-label text-xs text-accent">Great Lakes Institute of Management</p>
          <h2 className="font-display mt-4 max-w-sm text-3xl font-semibold leading-tight text-foreground">
            Research-driven investing, one evidence layer at a time.
          </h2>
        </div>
        <div className="relative text-accent/90">
          <HeroChartIllustration className="h-56 w-full text-border" />
        </div>
        <p className="relative max-w-sm text-sm text-muted">
          Sign in to follow the fund&apos;s decision register, sector coverage and monthly reviews as
          they publish.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center px-6 py-16 sm:px-10">
        <div className="w-full max-w-sm">
          <p className="font-label text-xs text-accent">Member Access</p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted">Sign in to your Finception account.</p>

          {!configured ? (
            <div className="mt-8 rounded-md border border-accent/30 bg-accent/5 p-4 text-sm text-muted">
              Auth isn&apos;t configured yet. Set{" "}
              <code className="font-mono text-accent">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{" "}
              <code className="font-mono text-accent">.env.local</code> to enable sign in.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@greatlakes.edu.in"
                  className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                />
              </div>
              {error && <p className="text-sm text-down">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#070908] transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Signing in..." : "Sign in"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-accent hover:underline">
              Create one
            </Link>
          </p>
          <p className="mt-2 text-center text-sm">
            <Link href="/" className="text-muted hover:text-accent">
              &larr; Back to Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
