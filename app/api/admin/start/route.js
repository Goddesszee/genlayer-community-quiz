import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { startSession } from "@/lib/session";

export async function POST(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    await startSession();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Could not start the quiz." }, { status: 400 });
  }
}
