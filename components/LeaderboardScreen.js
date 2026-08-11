"use client";

import { useEffect, useState } from "react";
import LeaderboardList from "@/components/LeaderboardList";

export default function LeaderboardScreen() {
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [username, setUsername] = useState(null);

  useEffect(() => {
    setUsername(localStorage.getItem("glq_username"));

    async function run() {
      try {
        const res = await fetch("/api/leaderboard?limit=20");
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
  }, []);

  return (
    <div className="mx-auto max-w-xl px-5 py-10 sm:py-14">
      <div className="mb-8 text-center">
        <p style={{ fontFamily: "var(--font-mono)" }} className="text-xs uppercase tracking-wide text-[var(--text-dim)]">
          Community ranking
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="mt-2 text-3xl font-semibold text-[var(--text)]">
          Leaderboard
        </h1>
      </div>

      {status === "loading" && (
        <p style={{ fontFamily: "var(--font-mono)" }} className="text-center text-sm text-[var(--text-dim)]">
          Loading scores…
        </p>
      )}
      {status === "error" && (
        <p className="text-center text-sm text-[var(--danger)]">
          Couldn't load the leaderboard — the service might not be configured yet.
        </p>
      )}
      {status === "ready" && <LeaderboardList entries={entries} highlightUsername={username} />}

      <div className="mt-8 text-center">
        <a
          href="/"
          className="inline-block rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#0a0d16] hover:brightness-110"
        >
          Take the quiz →
        </a>
      </div>
    </div>
  );
}
