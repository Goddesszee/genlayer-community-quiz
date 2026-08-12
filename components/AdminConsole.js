"use client";

import { useEffect, useState } from "react";

const POLL_MS = 3000;
const CATEGORY_LABEL = { genlayer: "GenLayer", ai: "AI", web3: "Web3", other: "Other" };
const EMPTY_FORM = { category: "genlayer", question: "", options: ["", "", "", ""], correctIndex: 0 };

export default function AdminConsole() {
  const [authed, setAuthed] = useState(null); // null = checking, false = need login, true = in
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [state, setState] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [savingQuestion, setSavingQuestion] = useState(false);

  async function refreshState() {
    try {
      const res = await fetch("/api/admin/state", { cache: "no-store" });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setAuthed(true);
        setState(data);
      }
    } catch {
      // ignore, next poll retries
    }
  }

  useEffect(() => {
    refreshState();
    const id = setInterval(refreshState, POLL_MS);
    return () => clearInterval(id);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Login failed.");
        return;
      }
      setPassword("");
      await refreshState();
    } catch {
      setLoginError("Network error — try again.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setState(null);
  }

  async function handleAddQuestion(e) {
    e.preventDefault();
    setFormError("");

    const trimmedQuestion = form.question.trim();
    const trimmedOptions = form.options.map((o) => o.trim());

    if (trimmedQuestion.length < 5) {
      setFormError("Write out the full question first.");
      return;
    }
    if (trimmedOptions.some((o) => o.length === 0)) {
      setFormError("Fill in all 4 answer options.");
      return;
    }

    setSavingQuestion(true);
    try {
      const res = await fetch("/api/admin/questions/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          question: trimmedQuestion,
          options: trimmedOptions,
          correctIndex: form.correctIndex,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Could not save the question.");
        return;
      }
      setForm(EMPTY_FORM);
      // Pre-select the new question so it's ready to load right away.
      setSelectedIds((prev) => new Set(prev).add(data.question.id));
      await refreshState();
    } catch {
      setFormError("Network error — try again.");
    } finally {
      setSavingQuestion(false);
    }
  }

  async function handleDeleteQuestion(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    try {
      await fetch("/api/admin/questions/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await refreshState();
    } catch {
      // non-fatal — next poll will resync the list
    }
  }

  function toggleQuestion(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleLoad() {
    setActionError("");
    if (selectedIds.size === 0) {
      setActionError("Select at least one question first.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIds: Array.from(selectedIds) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Could not load questions.");
        return;
      }
      await refreshState();
    } finally {
      setBusy(false);
    }
  }

  async function handleStart() {
    setActionError("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/start", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Could not start the quiz.");
        return;
      }
      await refreshState();
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    if (!confirm("Reset the current quiz session? This clears the live leaderboard too.")) return;
    setActionError("");
    setBusy(true);
    try {
      await fetch("/api/admin/reset", { method: "POST" });
      setSelectedIds(new Set());
      await refreshState();
    } finally {
      setBusy(false);
    }
  }

  if (authed === null) {
    return <div className="mx-auto max-w-md px-4 py-24 sm:px-5 text-center text-[var(--text-dim)]">Loading…</div>;
  }

  if (!authed) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-14 sm:px-5 sm:py-20">
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-2xl font-semibold text-[var(--text)]">
          Admin login
        </h1>
        <form onSubmit={handleLogin} className="card-pop mt-8 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <label htmlFor="pw" className="mb-2 block text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">
            Password
          </label>
          <input
            id="pw"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-soft,var(--bg))] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          />
          {loginError && <p className="mt-2 text-sm text-[var(--danger)]">{loginError}</p>}
          <button
            type="submit"
            disabled={loggingIn}
            className="mt-5 w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[#0a0d16] disabled:opacity-50 hover:brightness-110"
          >
            {loggingIn ? "Checking…" : "Log in"}
          </button>
        </form>
      </div>
    );
  }

  const status = state?.status || "idle";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-5 sm:py-14">
      <div className="mb-8 flex items-center justify-between">
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-2xl font-semibold text-[var(--text)]">
          Quiz control room
        </h1>
        <button onClick={handleLogout} className="text-sm text-[var(--text-dim)] underline underline-offset-4 hover:text-[var(--text)]">
          Log out
        </button>
      </div>

      {/* Status card */}
      <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                status === "live"
                  ? "bg-[var(--accent-2-soft)] text-[var(--accent-2)]"
                  : status === "waiting"
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : status === "ended"
                  ? "bg-[var(--surface-2)] text-[var(--text-dim)]"
                  : "bg-[var(--surface-2)] text-[var(--text-dim)]"
              }`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {status.toUpperCase()}
            </span>
            <span style={{ fontFamily: "var(--font-mono)" }} className="text-sm text-[var(--text-dim)]">
              {state?.totalQuestions || 0} questions loaded
            </span>
          </div>
          <span style={{ fontFamily: "var(--font-mono)" }} className="text-sm text-[var(--text-dim)]">
            {state?.playerCount ?? 0} player{state?.playerCount === 1 ? "" : "s"}
          </span>
        </div>

        {status === "live" && (
          <p style={{ fontFamily: "var(--font-mono)" }} className="mt-3 text-sm text-[var(--text)]">
            Question {(state.currentIndex ?? 0) + 1}/{state.totalQuestions} ·{" "}
            {Math.max(0, Math.ceil((state.timeLeftMs ?? 0) / 1000))}s left
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={handleStart}
            disabled={busy || status !== "waiting"}
            className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#0a0d16] disabled:cursor-not-allowed disabled:opacity-30 hover:brightness-110"
          >
            Start quiz →
          </button>
          <button
            onClick={handleReset}
            disabled={busy || status === "idle"}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-30 hover:bg-[var(--surface-2)]"
          >
            Reset session
          </button>
        </div>

        {actionError && <p className="mt-3 text-sm text-[var(--danger)]">{actionError}</p>}
      </div>

      {/* Live standings while running or after ending */}
      {(status === "live" || status === "ended") && state?.leaderboard?.length > 0 && (
        <div className="mb-8">
          <h2 style={{ fontFamily: "var(--font-display)" }} className="mb-3 text-lg font-semibold text-[var(--text)]">
            Live standings
          </h2>
          <div className="flex flex-col gap-2">
            {state.leaderboard.slice(0, 10).map((e) => (
              <div key={e.username} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
                <span style={{ fontFamily: "var(--font-mono)" }} className="text-[var(--text)]">
                  {e.rank}. @{e.username}
                </span>
                <span style={{ fontFamily: "var(--font-mono)" }} className="text-[var(--text-dim)]">
                  {e.score} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add a custom question */}
      <div className="mb-8">
        <h2 style={{ fontFamily: "var(--font-display)" }} className="mb-3 text-lg font-semibold text-[var(--text)]">
          Add your own question
        </h2>
        <form onSubmit={handleAddQuestion} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="mb-3 flex items-center gap-3">
            <label className="text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-soft,var(--bg))] px-2.5 py-1.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
            >
              <option value="genlayer">GenLayer</option>
              <option value="ai">AI</option>
              <option value="web3">Web3</option>
              <option value="other">Other</option>
            </select>
          </div>

          <textarea
            value={form.question}
            onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
            placeholder="Type the question…"
            rows={2}
            maxLength={300}
            className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg-soft,var(--bg))] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          />

          <p className="mt-4 mb-2 text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]">
            Options — pick the correct one
          </p>
          <div className="flex flex-col gap-2">
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctOption"
                  checked={form.correctIndex === i}
                  onChange={() => setForm((f) => ({ ...f, correctIndex: i }))}
                  className="h-4 w-4 shrink-0 accent-[var(--accent-2)]"
                  aria-label={`Option ${i + 1} is correct`}
                />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) =>
                    setForm((f) => {
                      const options = [...f.options];
                      options[i] = e.target.value;
                      return { ...f, options };
                    })
                  }
                  maxLength={150}
                  placeholder={`Option ${i + 1}`}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-soft,var(--bg))] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
            ))}
          </div>

          {formError && <p className="mt-3 text-sm text-[var(--danger)]">{formError}</p>}

          <button
            type="submit"
            disabled={savingQuestion}
            className="mt-4 w-full rounded-xl bg-[var(--accent-2)] px-4 py-2.5 text-sm font-semibold text-[#0a0d16] disabled:cursor-not-allowed disabled:opacity-50 hover:brightness-110"
          >
            {savingQuestion ? "Saving…" : "Add to question bank"}
          </button>
        </form>
      </div>

      {/* Question picker */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 style={{ fontFamily: "var(--font-display)" }} className="text-lg font-semibold text-[var(--text)]">
            Question bank
          </h2>
          <span style={{ fontFamily: "var(--font-mono)" }} className="text-xs text-[var(--text-dim)]">
            {selectedIds.size} selected
          </span>
        </div>

        <div className="max-h-96 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          {state?.questionBank?.map((q, i) => (
            <div
              key={q.id}
              className={`flex items-start gap-3 px-4 py-3 text-sm ${
                i !== 0 ? "border-t border-[var(--border)]" : ""
              } ${selectedIds.has(q.id) ? "bg-[var(--accent-soft)]" : ""}`}
            >
              <label className="flex flex-1 cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(q.id)}
                  onChange={() => toggleQuestion(q.id)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
                />
                <span className="flex-1 text-[var(--text)]">{q.question}</span>
              </label>
              <span
                style={{ fontFamily: "var(--font-mono)" }}
                className="shrink-0 rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--text-dim)]"
              >
                {CATEGORY_LABEL[q.category] || q.category}
              </span>
              {q.custom && (
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(q.id)}
                  aria-label="Delete this question"
                  className="shrink-0 text-[var(--text-dim)] hover:text-[var(--danger)]"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleLoad}
          disabled={busy || selectedIds.size === 0}
          className="mt-4 w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[#0a0d16] disabled:cursor-not-allowed disabled:opacity-30 hover:brightness-110"
        >
          Load {selectedIds.size || ""} question{selectedIds.size === 1 ? "" : "s"} for next round
        </button>
        <p className="mt-2 text-xs text-[var(--text-faint,var(--text-dim))]">
          Loading resets the current session's live leaderboard. Players see "waiting" until you hit Start.
        </p>
      </div>
    </div>
  );
}
