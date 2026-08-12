import { redis } from "@/lib/redis";
import { getCombinedQuestions } from "@/lib/customQuestions";

const SESSION_KEY = "genlayer-quiz:session";
const PLAYERS_KEY = "genlayer-quiz:session:players";
const ANSWERS_KEY = "genlayer-quiz:session:answers";
const SCORES_KEY = "genlayer-quiz:session:scores";

export const QUESTION_DURATION_MS = 40_000;
export const POINTS_PER_QUESTION = 10;

const IDLE_SESSION = { status: "idle", questions: [], startedAt: null };

// ---------- raw session read/write ----------

export async function getRawSession() {
  const raw = await redis.get(SESSION_KEY);
  if (!raw) return IDLE_SESSION;
  // @upstash/redis auto-parses JSON values; guard against either shape.
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

async function setRawSession(session) {
  await redis.set(SESSION_KEY, JSON.stringify(session));
}

// Derive status/currentIndex/timeLeftMs from wall-clock time so we never
// need a background job to advance questions — every reader computes the
// same answer from `startedAt`.
export function computeState(session, now = Date.now()) {
  if (!session || session.status === "idle") {
    return { status: "idle", currentIndex: null, timeLeftMs: null, totalQuestions: 0 };
  }

  if (session.status === "waiting" || !session.startedAt) {
    return {
      status: "waiting",
      currentIndex: null,
      timeLeftMs: null,
      totalQuestions: session.questions.length,
    };
  }

  const elapsed = now - session.startedAt;
  const idx = Math.floor(elapsed / QUESTION_DURATION_MS);
  const totalQuestions = session.questions.length;

  if (idx >= totalQuestions) {
    return { status: "ended", currentIndex: totalQuestions, timeLeftMs: 0, totalQuestions };
  }

  const timeLeftMs = QUESTION_DURATION_MS - (elapsed % QUESTION_DURATION_MS);
  return { status: "live", currentIndex: idx, timeLeftMs, totalQuestions };
}

// ---------- admin actions ----------

export async function loadSessionQuestions(questionIds) {
  const all = await getCombinedQuestions();
  const byId = new Map(all.map((q) => [q.id, q]));
  const questions = questionIds.map((id) => byId.get(id)).filter(Boolean);
  if (questions.length === 0) throw new Error("No valid question ids given.");

  await Promise.all([
    redis.del(ANSWERS_KEY),
    redis.del(SCORES_KEY),
    redis.del(PLAYERS_KEY),
  ]);

  await setRawSession({ status: "waiting", questions, startedAt: null });
  return questions.length;
}

export async function startSession() {
  const session = await getRawSession();
  if (session.status !== "waiting" || session.questions.length === 0) {
    throw new Error("Load questions before starting the quiz.");
  }
  await setRawSession({ ...session, status: "live", startedAt: Date.now() });
}

export async function resetSession() {
  await Promise.all([
    redis.del(ANSWERS_KEY),
    redis.del(SCORES_KEY),
    redis.del(PLAYERS_KEY),
  ]);
  await setRawSession(IDLE_SESSION);
}

// ---------- players ----------

export async function joinSession(username) {
  await redis.sadd(PLAYERS_KEY, username);
}

export async function countPlayers() {
  return redis.scard(PLAYERS_KEY);
}

// ---------- answers & scoring ----------

// Returns { alreadyAnswered, correct, correctIndex, rank, score, totalPlayers }
export async function recordAnswer({ username, questionIndex, selectedIndex, question }) {
  const field = `${username}:${questionIndex}`;
  const isCorrect = selectedIndex !== null && selectedIndex === question.correctIndex;
  const record = { selectedIndex, correct: isCorrect, at: Date.now() };

  const wasNew = await redis.hsetnx(ANSWERS_KEY, field, JSON.stringify(record));

  let finalRecord = record;
  if (!wasNew) {
    const existing = await redis.hget(ANSWERS_KEY, field);
    finalRecord = typeof existing === "string" ? JSON.parse(existing) : existing;
  } else if (isCorrect) {
    await redis.zincrby(SCORES_KEY, POINTS_PER_QUESTION, username);
  } else {
    // Ensure the player appears on the session leaderboard even with 0 correct so far.
    await redis.zadd(SCORES_KEY, { nx: true }, { score: 0, member: username });
  }

  const [rank, score] = await Promise.all([
    redis.zrevrank(SCORES_KEY, username),
    redis.zscore(SCORES_KEY, username),
  ]);
  const totalPlayers = await redis.zcard(SCORES_KEY);

  return {
    alreadyAnswered: !wasNew,
    correct: finalRecord.correct,
    correctIndex: question.correctIndex,
    rank: rank === null || rank === undefined ? null : rank + 1,
    score: Number(score) || 0,
    totalPlayers,
  };
}

export async function getSessionLeaderboard(limit = 50) {
  const raw = await redis.zrange(SCORES_KEY, 0, limit - 1, { rev: true, withScores: true });
  const entries = [];
  for (let i = 0; i < raw.length; i += 2) {
    entries.push({ username: raw[i], score: Number(raw[i + 1]), rank: entries.length + 1 });
  }
  return entries;
}
