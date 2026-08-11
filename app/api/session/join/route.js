import { NextResponse } from "next/server";
import { joinSession } from "@/lib/session";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const username = String(body?.username || "").trim();
  if (!username) {
    return NextResponse.json({ error: "Missing username." }, { status: 400 });
  }

  await joinSession(username);
  return NextResponse.json({ ok: true });
}
