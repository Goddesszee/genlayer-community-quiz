import { Redis } from "@upstash/redis";

// Supports both naming conventions:
// - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (plain Upstash console)
// - KV_REST_API_URL / KV_REST_API_TOKEN (Vercel's built-in Upstash/KV integration)
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  console.warn(
    "Missing Upstash/KV env vars. Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN, " +
      "or KV_REST_API_URL + KV_REST_API_TOKEN (Vercel Upstash integration)."
  );
}

export const redis = new Redis({ url, token });

const LEADERBOARD_KEY = "genlayer-quiz:leaderboard";

// Store the best score per username using a sorted set.
// { gt: true } means the score only updates if the new one is higher.
export async function submitScore(username, score) {
  await redis.zadd(LEADERBOARD_KEY, { gt: true }, { score, member: username });
}

// Returns top N entries as [{ username, score, rank }]
export async function getLeaderboard(limit = 10) {
  const raw = await redis.zrange(LEADERBOARD_KEY, 0, limit - 1, {
    rev: true,
    withScores: true,
  });

  const entries = [];
  for (let i = 0; i < raw.length; i += 2) {
    entries.push({
      username: raw[i],
      score: Number(raw[i + 1]),
      rank: entries.length + 1,
    });
  }
  return entries;
}

export async function getUserRank(username) {
  const rank = await redis.zrevrank(LEADERBOARD_KEY, username);
  const score = await redis.zscore(LEADERBOARD_KEY, username);
  if (rank === null || rank === undefined) return null;
  return { rank: rank + 1, score: Number(score) };
}
