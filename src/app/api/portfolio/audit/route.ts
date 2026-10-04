import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSupabaseConfigured) return NextResponse.json({ events: [] });

  const { data, error } = await supabase
    .from("audit_events")
    .select("id, action, entity_type, entity_id, before_data, after_data, actor_user_id, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    if (error.code === "PGRST205") return NextResponse.json({ events: [] });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    events: (data ?? []).map((row) => ({
      id: row.id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      beforeData: row.before_data,
      afterData: row.after_data,
      actorUserId: row.actor_user_id,
      createdAt: row.created_at,
    })),
  });
}
