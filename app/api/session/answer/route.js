import { NextResponse } from "next/server";
import { getRawSession, computeState, recordAnswer } from "@/lib/session";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const username = String(body?.username || "").trim();
  const questionIndex = Number(body?.questionIndex);
  const selectedIndex =
    body?.selectedIndex === null || body?.selectedIndex === undefined
      ? null
      : Number(body.selectedIndex);

  if (!username || !Number.isInteger(questionIndex)) {
    return NextResponse.json({ error: "Missing username or questionIndex." }, { status: 400 });
  }

  const session = await getRawSession();
  const state = computeState(session);

  if (state.status !== "live" && state.status !== "ended") {
    return NextResponse.json({ error: "The quiz isn't live." }, { status: 400 });
  }

  // Only accept answers for the current (or just-finished) question — not future ones.
  const maxAcceptableIndex = state.status === "ended" ? session.questions.length - 1 : state.currentIndex;
  if (questionIndex < 0 || questionIndex > maxAcceptableIndex) {
    return NextResponse.json({ error: "That question isn't active." }, { status: 400 });
  }

  const question = session.questions[questionIndex];
  if (!question) {
    return NextResponse.json({ error: "Question not found." }, { status: 400 });
  }

  const result = await recordAnswer({ username, questionIndex, selectedIndex, question });
  return NextResponse.json({ ok: true, ...result });
}
