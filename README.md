# GenLayer Community Quiz

A live, host-run multiple-choice quiz about **GenLayer, AI, and Web3**. An admin loads a set of questions and starts the round; every player's screen advances together, one question every 25 seconds, with live standings shown after each question and a final leaderboard — top 3 get a crown — once the round ends.

## How it works

**Players**
- Enter a Discord username on the home page — no OAuth, no sign-up.
- If no quiz is loaded yet, you land on a "waiting for the host" screen that updates automatically.
- Once the admin starts the round, everyone sees the same question at the same time with a 25-second timer.
- After answering (or timing out), you see the correct answer and your **live position** in the round.
- The next question appears automatically when the timer hits zero — no need to click "Next."
- After 10 (or however many) questions, the round ends and everyone sees the final round leaderboard. Scores also roll into the permanent all-time leaderboard.

**Admin**
- Go to `/admin` and log in with the admin password.
- Tick the questions you want for this round from the bank, click **Load**.
- Players who are on `/quiz` will now see a "starting soon" waiting room.
- Click **Start quiz** whenever you're ready — this kicks off the synchronized 25-second-per-question countdown for everyone.
- Watch live standings update as players answer.
- Click **Reset session** afterward to clear the round and get ready for the next one.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + Tailwind CSS
- [Upstash Redis](https://upstash.com) (REST API) — stores the live session state, per-round answers/scores, and the permanent leaderboard
- Deploys to [Vercel](https://vercel.com)

Question progression is **time-driven, not server-driven** — there's no background job or websocket. The session simply records when it started; every player's browser (and the admin panel) independently computes "what question should be showing right now" from that timestamp, polling every ~2.5 seconds to stay in sync. This keeps it simple and works fine on Vercel's serverless functions.

## Local setup

```bash
npm install
cp .env.local.example .env.local   # fill in your Upstash + admin password
npm run dev
```

## Environment variables

| Variable | Purpose |
|---|---|
| `UPSTASH_REDIS_REST_URL` / `KV_REST_API_URL` | Upstash Redis REST endpoint (either name works) |
| `UPSTASH_REDIS_REST_TOKEN` / `KV_REST_API_TOKEN` | Upstash Redis REST token (either name works) |
| `ADMIN_PASSWORD` | Password required to access `/admin`. If unset, admin login is disabled entirely (fails closed). |

Set these in `.env.local` for local dev and in your Vercel project's Environment Variables for production.

## Deploying to Vercel

1. This repo is already on GitHub.
2. Go to https://vercel.com/new and import the repo.
3. In the Vercel project's Settings → Environment Variables, add the three variables above.
4. Deploy.

## Editing the questions

All questions live in `lib/questions.js` as a flat array. Each entry has `id`, `category` (`genlayer` | `ai` | `web3`), `question`, `options` (4 strings), and `correctIndex`. The admin panel's question picker pulls straight from this list — add, remove, or edit entries there.

## Project structure

```
app/
  page.js                       → login screen
  quiz/page.js                  → live, synced quiz (waiting room → live → results)
  leaderboard/page.js           → all-time leaderboard
  admin/page.js                 → admin control room (password protected)
  api/
    submit-score, leaderboard   → all-time leaderboard read/write
    session/                    → public: status poll, join, answer, live leaderboard, finalize
    admin/                      → protected: login, logout, state, load, start, reset
components/
  LiveQuiz.js                   → player-facing synced quiz screen
  AdminConsole.js                → admin control room UI
  LeaderboardList.js, Crown.js, NavBar.js → shared UI
lib/
  questions.js                  → question bank
  redis.js                      → Upstash client + all-time leaderboard helpers
  session.js                    → live session state machine (time-driven progression, scoring)
  adminAuth.js                   → password-derived admin cookie auth
```
