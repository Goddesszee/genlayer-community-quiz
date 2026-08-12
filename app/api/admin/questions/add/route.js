import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { addCustomQuestion } from "@/lib/customQuestions";

const VALID_CATEGORIES = new Set(["genlayer", "ai", "web3", "other"]);

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

  const category = VALID_CATEGORIES.has(body?.category) ? body.category : "other";
  const question = String(body?.question || "").trim();
  const options = Array.isArray(body?.options) ? body.options.map((o) => String(o || "").trim()) : [];
  const correctIndex = Number(body?.correctIndex);

  if (question.length < 5 || question.length > 300) {
    return NextResponse.json({ error: "Question must be 5-300 characters." }, { status: 400 });
  }
  if (options.length !== 4 || options.some((o) => o.length === 0 || o.length > 150)) {
    return NextResponse.json({ error: "Provide exactly 4 non-empty answer options." }, { status: 400 });
  }
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
    return NextResponse.json({ error: "Pick which option is correct." }, { status: 400 });
  }

  try {
    const q = await addCustomQuestion({ category, question, options, correctIndex });
    return NextResponse.json({ ok: true, question: q });
  } catch (err) {
    console.error("add custom question error:", err);
    return NextResponse.json({ error: "Could not save the question." }, { status: 500 });
  }
}
