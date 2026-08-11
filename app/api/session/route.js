import { NextResponse } from "next/server";
import { getRawSession, computeState, countPlayers } from "@/lib/session";

export async function GET() {
  const session = await getRawSession();
  const state = computeState(session);
  const playerCount = await countPlayers();

  let question = null;
  if (state.status === "live" && state.currentIndex !== null) {
    const q = session.questions[state.currentIndex];
    if (q) {
      question = {
        index: state.currentIndex,
        category: q.category,
        question: q.question,
        options: q.options,
      };
    }
  }

  return NextResponse.json({
    ok: true,
    status: state.status,
    currentIndex: state.currentIndex,
    timeLeftMs: state.timeLeftMs,
    totalQuestions: state.totalQuestions,
    question,
    playerCount,
    serverNow: Date.now(),
  });
}
