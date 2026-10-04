import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "build-placeholder-service-role-key";

// Server-only client using the service role key. Never import this from a
// client component or expose the service role key to the browser.
// The build-safe fallback prevents static analysis from failing before
// Vercel injects runtime environment variables.
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

export const REPORTS_BUCKET = "reports";
