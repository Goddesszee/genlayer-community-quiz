# GenLayer Community Quiz

A simple multiple-choice quiz about **GenLayer, AI, and Web3** for the community. Players log in with just their Discord username, answer 10 randomized questions, and land on a live leaderboard — top 3 get a crown.

Topics covered: GenLayer (Intelligent Contracts, Optimistic Democracy, GenVM), general AI concepts, and Web3 fundamentals.

## How it works

- **Login** — enter a Discord username, no OAuth, no sign-up. It's just your leaderboard name.
- **Quiz** — 10 questions randomly picked from a pool of ~27, multiple choice, instant feedback per question.
- **Results** — your score is saved to the leaderboard (your best score is kept if you replay).
- **Leaderboard** — ranked list, top 3 get gold/silver/bronze crowns.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + Tailwind CSS
- [Upstash Redis](https://upstash.com) (REST API, sorted set) for the leaderboard — free tier is plenty
- Deploys to [Vercel](https://vercel.com)

## Local setup

```bash
npm install
cp .env.local.example .env.local   # then fill in your Upstash credentials
npm run dev
```

## Setting up the leaderboard database (Upstash)

1. Go to https://console.upstash.com and create a free account.
2. Create a new **Redis** database (any nearby region works).
3. Open the database, go to the **REST API** section.
4. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` into `.env.local` for local dev, and into your Vercel project's Environment Variables for production.

No other setup is needed — the app creates the `genlayer-quiz:leaderboard` sorted set automatically the first time a score is submitted.

## Deploying to Vercel

1. This repo is already on GitHub.
2. Go to https://vercel.com/new and import the repo.
3. In the Vercel project's Settings → Environment Variables, add:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Deploy. Next.js API routes handle the leaderboard automatically — no extra config needed.

## Editing the questions

All questions live in `lib/questions.js` as a flat array. Each entry has `id`, `category` (`genlayer` | `ai` | `web3`), `question`, `options` (4 strings), and `correctIndex`. Add, remove, or edit entries there — the quiz automatically pulls 10 random ones per playthrough.

## Project structure

```
app/
  page.js                    → login screen
  quiz/page.js                → quiz flow
  results/page.js             → post-quiz score + leaderboard
  leaderboard/page.js         → standalone leaderboard view
  api/submit-score/route.js   → POST: save a score
  api/leaderboard/route.js    → GET: fetch top scores
components/                   → UI components (QuizRunner, LeaderboardList, Crown, NavBar)
lib/questions.js              → question bank
lib/redis.js                  → Upstash Redis helpers
```
