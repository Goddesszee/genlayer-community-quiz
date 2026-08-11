import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { getRawSession, computeState, countPlayers, getSessionLeaderboard } from "@/lib/session";
import { QUESTIONS } from "@/lib/questions";

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const session = await getRawSession();
  const state = computeState(session);
  const [playerCount, leaderboard] = await Promise.all([countPlayers(), getSessionLeaderboard(50)]);

  return NextResponse.json({
    ok: true,
    status: state.status,
    currentIndex: state.currentIndex,
    timeLeftMs: state.timeLeftMs,
    totalQuestions: session.questions.length,
    loadedQuestionIds: session.questions.map((q) => q.id),
    playerCount,
    leaderboard,
    questionBank: QUESTIONS.map((q) => ({ id: q.id, category: q.category, question: q.question })),
  });
}
