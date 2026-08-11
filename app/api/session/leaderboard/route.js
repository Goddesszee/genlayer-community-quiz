import { NextResponse } from "next/server";
import { getSessionLeaderboard } from "@/lib/session";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
  const entries = await getSessionLeaderboard(limit);
  return NextResponse.json({ ok: true, entries });
}
