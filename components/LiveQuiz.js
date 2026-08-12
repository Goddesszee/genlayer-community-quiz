"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LeaderboardList from "@/components/LeaderboardList";
import { QUESTION_DURATION_MS } from "@/lib/quizConfig";

const POLL_MS = 2500;
const LETTERS = ["A", "B", "C", "D"];
const CATEGORY_LABEL = { genlayer: "GenLayer", ai: "AI", web3: "Web3", other: "Other" };
const CATEGORY_COLOR = { genlayer: "var(--accent)", ai: "var(--accent-2)", web3: "var(--accent-3)", other: "var(--text-faint)" };

export default function LiveQuiz() {
  const router = useRouter();
  const [username, setUsername] = useState(null);
  const [session, setSession] = useState(null); // last poll result
  const [displayTimeLeft, setDisplayTimeLeft] = useState(null);
  const [selected, setSelected] = useState(null);
  const [answerResult, setAnswerResult] = useState(null); // { correct, correctIndex, rank, score, totalPlayers }
  const [finalEntries, setFinalEntries] = useState(null);

  const answeredIndexRef = useRef(null); // which question index we've already submitted for
  const joinedRef = useRef(false);
  const finalizedRef = useRef(false);
  const lastPollAtRef = useRef(Date.now());

  // Auth guard
  useEffect(() => {
    const stored = localStorage.getItem("glq_username");
    if (!stored) {
      router.replace("/");
      return;
    }
    setUsername(stored);
  }, [router]);

  // Poll session state
  useEffect(() => {
    if (!username) return;

    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/session", { cache: "no-store" });
        const data = await res.json();
        if (cancelled || !res.ok) return;

        lastPollAtRef.current = Date.now();
        setDisplayTimeLeft(data.timeLeftMs);
        setSession((prev) => {
          if (prev && prev.currentIndex !== data.currentIndex) {
            // New question — clear local answer state.
            setSelected(null);
            setAnswerResult(null);
          }
          return data;
        });

        if (data.status === "waiting" && !joinedRef.current) {
          joinedRef.current = true;
          fetch("/api/session/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
          }).catch(() => {});
        }
      } catch {
        // ignore transient network errors, next poll will retry
      }
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [username]);

  // Local 1s countdown ticker between polls
  useEffect(() => {
    if (displayTimeLeft === null || session?.status !== "live") return;
    const id = setInterval(() => {
      setDisplayTimeLeft((prev) => (prev === null ? null : Math.max(0, prev - 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [session?.status, displayTimeLeft !== null]);

  // Fetch the final leaderboard + finalize this player's score once the round ends
  useEffect(() => {
    if (session?.status !== "ended" || !username) return;

    async function wrapUp() {
      if (!finalizedRef.current) {
        finalizedRef.current = true;
        try {
          await fetch("/api/session/finalize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
          });
        } catch {
          // non-fatal
        }
      }
      try {
        const res = await fetch("/api/session/leaderboard?limit=20", { cache: "no-store" });
        const data = await res.json();
        if (res.ok) setFinalEntries(data.entries || []);
      } catch {
        // non-fatal
      }
    }
    wrapUp();
  }, [session?.status, username]);

  // Auto-submit a miss when the clock hits zero and nothing was picked
  useEffect(() => {
    if (session?.status !== "live" || !session.question) return;
    if (
      displayTimeLeft !== null &&
      displayTimeLeft <= 0 &&
      answeredIndexRef.current !== session.question.index
    ) {
      handleSelect(null);
    }
  }, [displayTimeLeft, session]);

  async function handleSelect(optionIdx) {
    if (!session?.question || answeredIndexRef.current === session.question.index) return;
    setSelected(optionIdx);
    answeredIndexRef.current = session.question.index;

    try {
      const res = await fetch("/api/session/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          questionIndex: session.question.index,
          selectedIndex: optionIdx,
        }),
      });
      const data = await res.json();
      if (res.ok) setAnswerResult(data);
    } catch {
      // if it fails, they can still see the reveal once state settles
    }
  }

  if (username === null) {
    return <div className="mx-auto max-w-xl px-4 py-24 sm:px-5 text-center text-[var(--text-dim)]">Loading…</div>;
  }

  if (!session) {
    return <div className="mx-auto max-w-xl px-4 py-24 sm:px-5 text-center text-[var(--text-dim)]">Connecting…</div>;
  }

  // ---------- idle ----------
  if (session.status === "idle") {
    return (
      <div className="mx-auto max-w-xl px-4 py-14 sm:px-5 sm:py-20 text-center">
        <p style={{ fontFamily: "var(--font-mono)" }} className="text-xs uppercase tracking-wide text-[var(--text-dim)]">
          No live quiz right now
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="mt-3 text-2xl font-semibold text-[var(--text)]">
          Waiting for the host to set one up
        </h1>
        <p className="mt-3 text-sm text-[var(--text-dim)]">
          This page will update automatically the moment a round is loaded.
        </p>
      </div>
    );
  }

  // ---------- waiting room ----------
  if (session.status === "waiting") {
    return (
      <div className="mx-auto max-w-xl px-4 py-14 sm:px-5 sm:py-20 text-center">
        <span className="relative mx-auto mb-6 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent-2)] opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--accent-2)]" />
        </span>
        <p style={{ fontFamily: "var(--font-mono)" }} className="text-xs uppercase tracking-wide text-[var(--text-dim)]">
          Quiz loaded · {session.totalQuestions} questions
        </p>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="mt-3 text-2xl font-semibold text-[var(--text)]">
          Hang tight — starting soon
        </h1>
        <p className="mt-3 text-sm text-[var(--text-dim)]">
          {session.playerCount} player{session.playerCount === 1 ? "" : "s"} waiting. Stay on this page —
          it'll jump in automatically when the host starts.
        </p>
      </div>
    );
  }

  // ---------- ended ----------
  if (session.status === "ended") {
    return (
      <div className="mx-auto max-w-xl px-4 py-8 sm:px-5 sm:py-14">
        <div className="card-pop glass-panel rounded-2xl p-6 text-center sm:p-8">
          <p style={{ fontFamily: "var(--font-mono)" }} className="text-xs uppercase tracking-wide text-[var(--text-dim)]">
            Quiz complete
          </p>
          <h1 style={{ fontFamily: "var(--font-display)" }} className="mt-2 text-2xl font-semibold text-[var(--text)]">
            Final results
          </h1>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a href="/leaderboard" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--surface-2)]">
              All-time leaderboard
            </a>
            <a href="/" className="btn-primary rounded-xl px-4 py-2.5 text-sm">
              Back home
            </a>
          </div>
        </div>

        <div className="mt-10">
          <h2 style={{ fontFamily: "var(--font-display)" }} className="mb-3 text-lg font-semibold text-[var(--text)]">
            This round's leaderboard
          </h2>
          {finalEntries === null ? (
            <p style={{ fontFamily: "var(--font-mono)" }} className="text-sm text-[var(--text-dim)]">
              Tallying scores…
            </p>
          ) : (
            <LeaderboardList entries={finalEntries} highlightUsername={username} />
          )}
        </div>
      </div>
    );
  }

  // ---------- live ----------
  const question = session.question;
  const totalQuestions = session.totalQuestions;
  const index = question?.index ?? 0;
  const timeUrgent = (displayTimeLeft ?? 0) <= 10_000;
  const answered = answerResult !== null || answeredIndexRef.current === index;
  const secondsLeft = Math.max(0, Math.ceil((displayTimeLeft ?? 0) / 1000));

  if (!question) {
    return <div className="mx-auto max-w-xl px-4 py-24 sm:px-5 text-center text-[var(--text-dim)]">Syncing question…</div>;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-5 sm:py-14">
      <div className="mb-4 flex items-center justify-between">
        <span style={{ fontFamily: "var(--font-mono)" }} className="text-xs text-[var(--text-dim)]">
          QUESTION {String(index + 1).padStart(2, "0")}/{String(totalQuestions).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-2">
          <span
            style={{ fontFamily: "var(--font-mono)" }}
            className={`rounded-full border px-2.5 py-1 text-[11px] tabular-nums transition-colors ${
              timeUrgent
                ? "border-[var(--danger)]/50 bg-[var(--danger-soft)] text-[var(--danger)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-dim)]"
            }`}
          >
            0:{String(secondsLeft).padStart(2, "0")}
          </span>
          <span style={{ fontFamily: "var(--font-mono)" }} className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[11px] text-[var(--text-dim)]">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CATEGORY_COLOR[question.category] }} />
            {CATEGORY_LABEL[question.category] || question.category}
          </span>
        </div>
      </div>

      <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div
          className={`h-full rounded-full ${timeUrgent ? "bg-[var(--danger)]" : "bg-[var(--accent)]"}`}
          style={{ width: `${((displayTimeLeft ?? 0) / QUESTION_DURATION_MS) * 100}%`, transition: "width 1s linear, background-color 0.3s ease" }}
        />
      </div>

      <div key={question.index} className="card-pop glass-panel rounded-2xl p-5 sm:p-6">
        <h2 style={{ fontFamily: "var(--font-display)" }} className="mb-6 text-xl font-semibold leading-snug text-[var(--text)] sm:text-2xl">
          {question.question}
        </h2>

        <div className="flex flex-col gap-3">
          {question.options.map((option, i) => {
            const isSelected = selected === i;
            const showState = answered && answerResult;
            const isCorrectAnswer = showState && i === answerResult.correctIndex;

            let stateClasses =
              "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/60 hover:bg-[var(--surface-2)]";
            if (isCorrectAnswer) {
              stateClasses = "border-[var(--accent-2)] bg-[var(--accent-2-soft)]";
            } else if (showState && isSelected) {
              stateClasses = "border-[var(--danger)] bg-[var(--danger-soft)]";
            } else if (showState) {
              stateClasses = "border-[var(--border)] bg-[var(--surface)] opacity-50";
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(i)}
                disabled={answered}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm text-[var(--text)] transition-colors disabled:cursor-default ${stateClasses}`}
              >
                <span style={{ fontFamily: "var(--font-mono)" }} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[11px] text-[var(--text-dim)]">
                  {LETTERS[i]}
                </span>
                <span className="flex-1">{option}</span>
                {isCorrectAnswer && <span className="text-[var(--accent-2)]">✓</span>}
                {showState && isSelected && !isCorrectAnswer && <span className="text-[var(--danger)]">✕</span>}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3.5">
            {answerResult ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-dim)]">
                  {answerResult.correct ? (
                    <span className="text-[var(--accent-2)]">Correct!</span>
                  ) : answeredIndexRef.current === index && selected !== null ? (
                    <span className="text-[var(--danger)]">Not quite.</span>
                  ) : (
                    <span className="text-[var(--danger)]">Time's up.</span>
                  )}
                </span>
                <span style={{ fontFamily: "var(--font-mono)" }} className="text-[var(--text)]">
                  Position <span className="font-semibold text-[var(--accent)]">#{answerResult.rank}</span>
                  <span className="text-[var(--text-dim)]"> / {answerResult.totalPlayers} · {answerResult.score} pts</span>
                </span>
              </div>
            ) : (
              <p style={{ fontFamily: "var(--font-mono)" }} className="text-sm text-[var(--text-dim)]">
                Locking in your answer…
              </p>
            )}
            <p className="mt-2 text-xs text-[var(--text-faint,var(--text-dim))]">
              Next question loads automatically when the timer runs out.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
