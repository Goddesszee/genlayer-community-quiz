import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { deleteCustomQuestion } from "@/lib/customQuestions";

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

  const id = String(body?.id || "");
  if (!id) {
    return NextResponse.json({ error: "Missing question id." }, { status: 400 });
  }

  try {
    await deleteCustomQuestion(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Could not delete question." }, { status: 400 });
  }
}
