import { NextResponse } from "next/server";
import { submitScore, getUserRank } from "@/lib/redis";

// Discord display names can include spaces, emoji, and symbols like "|" —
// just enforce a length cap, no leading/trailing whitespace, and no control chars.
const USERNAME_RE = /^[^\s][\s\S]{0,30}[^\s]$|^[^\s]$/;
const CONTROL_CHAR_RE = /[\u0000-\u001F\u007F]/;

function isValidUsername(value) {
  return USERNAME_RE.test(value) && !CONTROL_CHAR_RE.test(value);
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const username = String(body?.username || "").trim();
  const score = Number(body?.score);

  if (!isValidUsername(username)) {
    return NextResponse.json(
      { error: "Username must be 1-32 characters with no leading/trailing spaces." },
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
