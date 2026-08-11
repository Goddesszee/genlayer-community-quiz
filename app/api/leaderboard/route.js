import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/redis";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

  try {
    const entries = await getLeaderboard(limit);
    return NextResponse.json({ ok: true, entries });
  } catch (err) {
    console.error("leaderboard error:", err);
    return NextResponse.json(
      { error: "Could not load leaderboard. Check server Upstash configuration." },
      { status: 500 }
    );
  }
}
