import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { loadSessionQuestions } from "@/lib/session";

export async function POST(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ids = Array.isArray(body?.questionIds) ? body.questionIds : [];
  if (ids.length === 0) {
    return NextResponse.json({ error: "Select at least one question." }, { status: 400 });
  }

  try {
    const count = await loadSessionQuestions(ids);
    return NextResponse.json({ ok: true, count });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Could not load questions." }, { status: 400 });
  }
}
