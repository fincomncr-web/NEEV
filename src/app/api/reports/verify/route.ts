import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  checkPasscode,
  createAdminToken,
  isAdminConfigured,
  isAdminRequest,
} from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  return NextResponse.json({ authenticated: isAdminRequest(req), configured: isAdminConfigured() });
}

export async function POST(req: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin access is not configured in this Vercel deployment. Add NEEV_ADMIN_PASSCODE (or REPORTS_UPLOAD_PASSCODE) in Environment Variables for Production, then redeploy." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!checkPasscode(body?.passcode)) {
    return NextResponse.json({ error: "Incorrect admin passcode." }, { status: 401 });
  }

  const token = createAdminToken();
  if (!token) {
    return NextResponse.json({ error: "Admin session secret is not configured." }, { status: 503 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return res;
}

export async function DELETE(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
