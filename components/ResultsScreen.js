"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LeaderboardList from "@/components/LeaderboardList";

export default function ResultsScreen() {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState("submitting"); // submitting | ready | error

  useEffect(() => {
    const raw = sessionStorage.getItem("glq_result");
    if (!raw) {
      router.replace("/");
      return;
    }
    const parsed = JSON.parse(raw);
    setResult(parsed);

    async function run() {
      try {
        await fetch("/api/submit-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: parsed.username, score: parsed.score }),
        });
        const res = await fetch("/api/leaderboard?limit=10");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load leaderboard");
        setEntries(data.entries || []);
        setStatus("ready");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }
    run();
  }, [router]);

  if (!result) return null;

  const pct = Math.round((result.score / result.total) * 100);

  return (
    <div className="mx-auto max-w-xl px-5 py-10 sm:py-14">
      <div className="card-pop rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center sm:p-8">
        <p
          style={{ fontFamily: "var(--font-mono)" }}
          className="text-xs uppercase tracking-wide text-[var(--text-dim)]"
        >
          Quiz complete
        </p>
        <p
          style={{ fontFamily: "var(--font-display)" }}
          className="mt-2 text-5xl font-bold text-[var(--text)]"
        >
          {result.score}
          <span className="text-lg font-medium text-[var(--text-dim)]">/{result.total}</span>
        </p>
        <p className="mt-2 text-sm text-[var(--text-dim)]">
          {result.correct}/{result.total / 10} correct · {pct}% score
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => router.push("/quiz")}
            className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#0a0d16] hover:brightness-110"
          >
            Play again
          </button>
          <a
            href="/"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--surface-2)]"
          >
            Back home
          </a>
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 style={{ fontFamily: "var(--font-display)" }} className="text-lg font-semibold text-[var(--text)]">
            Leaderboard
          </h2>
          <a href="/leaderboard" className="text-xs text-[var(--text-dim)] underline underline-offset-4 hover:text-[var(--text)]">
            View full
          </a>
        </div>

        {status === "submitting" && (
          <p style={{ fontFamily: "var(--font-mono)" }} className="text-sm text-[var(--text-dim)]">
            Saving your score…
          </p>
        )}
        {status === "error" && (
          <p className="text-sm text-[var(--danger)]">
            Your score didn't save — the leaderboard service might not be configured yet.
          </p>
        )}
        {status === "ready" && (
          <LeaderboardList entries={entries} highlightUsername={result.username} />
        )}
      </div>
    </div>
  );
}
