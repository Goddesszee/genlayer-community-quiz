import { redis } from "@/lib/redis";
import { QUESTIONS } from "@/lib/questions";

const CUSTOM_KEY = "genlayer-quiz:custom-questions";

export async function getCustomQuestions() {
  const raw = await redis.hgetall(CUSTOM_KEY);
  if (!raw) return [];
  return Object.values(raw)
    .map((v) => {
      try {
        return typeof v === "string" ? JSON.parse(v) : v;
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
}

export async function getCombinedQuestions() {
  const custom = await getCustomQuestions();
  return [...QUESTIONS, ...custom];
}

export async function addCustomQuestion({ category, question, options, correctIndex }) {
  const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const q = {
    id,
    category,
    question,
    options,
    correctIndex,
    custom: true,
    createdAt: Date.now(),
  };
  await redis.hset(CUSTOM_KEY, { [id]: JSON.stringify(q) });
  return q;
}

export async function deleteCustomQuestion(id) {
  if (!id || !id.startsWith("custom-")) {
    throw new Error("Only custom questions can be deleted.");
  }
  await redis.hdel(CUSTOM_KEY, id);
}
