import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { submitScore } from "@/lib/redis";
import { getRawSession, computeState } from "@/lib/session";

const SCORES_KEY = "genlayer-quiz:session:scores";

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

  const session = await getRawSession();
  const state = computeState(session);
  if (state.status !== "ended") {
    return NextResponse.json({ error: "The quiz hasn't ended yet." }, { status: 400 });
  }

  const score = Number(await redis.zscore(SCORES_KEY, username)) || 0;
  await submitScore(username, score);

  return NextResponse.json({ ok: true, score });
}
