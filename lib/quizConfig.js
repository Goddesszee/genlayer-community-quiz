// Shared constants used by both server (lib/session.js) and client
// (components/LiveQuiz.js) code. Kept dependency-free so it's safe
// to import from client components without pulling in the Redis SDK.

export const QUESTION_DURATION_MS = 25_000; // 25 seconds per question
