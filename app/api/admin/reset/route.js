import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { resetSession } from "@/lib/session";

export async function POST(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  await resetSession();
  return NextResponse.json({ ok: true });
}
