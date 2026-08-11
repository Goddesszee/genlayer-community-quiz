import { Redis } from "@upstash/redis";

// Reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env.
// Set these in your Vercel project settings (see README).
export const redis = Redis.fromEnv();

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
