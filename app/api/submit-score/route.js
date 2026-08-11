import { NextResponse } from "next/server";
import { submitScore, getUserRank } from "@/lib/redis";

// Basic Discord-username-shaped validation: 2-32 chars, letters/numbers/._
const USERNAME_RE = /^[a-zA-Z0-9._]{2,32}$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const username = String(body?.username || "").trim();
  const score = Number(body?.score);

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: "Username must be 2-32 characters: letters, numbers, '.' or '_'." },
      { status: 400 }
    );
  }

  if (!Number.isFinite(score) || score < 0 || score > 1000) {
    return NextResponse.json({ error: "Invalid score." }, { status: 400 });
  }

  try {
    await submitScore(username, score);
    const rankInfo = await getUserRank(username);
    return NextResponse.json({ ok: true, ...rankInfo });
  } catch (err) {
    console.error("submit-score error:", err);
    return NextResponse.json(
      { error: "Could not save score. Check server Upstash configuration." },
      { status: 500 }
    );
  }
}
