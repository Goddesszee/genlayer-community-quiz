"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WelcomeModal from "@/components/WelcomeModal";

// Discord display names can include spaces, emoji, and symbols like "|" —
// just block empty/whitespace-only input and control characters.
const USERNAME_RE = /^[^\s][\s\S]{0,30}[^\s]$|^[^\s]$/;
const CONTROL_CHAR_RE = /[\u0000-\u001F\u007F]/;

function isValidUsername(value) {
  return USERNAME_RE.test(value) && !CONTROL_CHAR_RE.test(value);
}

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = username.trim();

    if (!isValidUsername(trimmed)) {
      setError("Enter your Discord username — 1-32 characters, no leading/trailing spaces.");
      return;
    }

    localStorage.setItem("glq_username", trimmed);
    setShowWelcome(true);
  }

  function handleContinue() {
    router.push("/quiz");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-10 pb-16 sm:px-5 sm:pt-20 sm:pb-24">
      <img
        src="/genlayer-logo-white.png"
        alt="GenLayer"
        className="mb-6 h-10 w-auto opacity-90 sm:h-12"
      />

      <div className="mb-5 flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--text-dim)] sm:mb-6">
        <span style={{ fontFamily: "var(--font-mono)" }}>10 QUESTIONS · MULTIPLE CHOICE</span>
      </div>

      <h1
        style={{ fontFamily: "var(--font-display)" }}
        className="max-w-xl text-center text-3xl font-semibold leading-tight tracking-tight text-[var(--text)] sm:text-5xl"
      >
        How well do you know the <span className="text-[var(--accent)]">Intelligent Blockchain</span>?
      </h1>

      <p className="mt-4 max-w-md px-2 text-center text-sm text-[var(--text-dim)] sm:px-0 sm:text-base">
        A quick community quiz on GenLayer, AI, and Web3. Play with your Discord
        username and land on the leaderboard.
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 px-4">
        {["GenLayer", "AI", "Web3"].map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--text-dim)]"
          >
            {tag}
          </span>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="card-pop mt-8 w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_0_0_1px_rgba(124,140,255,0.05)] sm:mt-10 sm:p-6"
      >
        <label
          htmlFor="username"
          className="mb-2 block text-xs font-medium uppercase tracking-wide text-[var(--text-dim)]"
        >
          Discord username
        </label>

        <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-3 transition-colors focus-within:border-[var(--accent)]">
          <span style={{ fontFamily: "var(--font-mono)" }} className="shrink-0 text-[var(--text-faint,var(--text-dim))]">
            @
          </span>
          <input
            id="username"
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
            maxLength={32}
            placeholder="stargirl_hills"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError("");
            }}
            style={{ fontFamily: "var(--font-mono)" }}
            className="w-full min-w-0 border-0 bg-transparent text-base text-[var(--text)] placeholder:text-[var(--text-faint,var(--text-dim))] focus:outline-none focus:ring-0 sm:text-sm"
          />
        </div>

        {error && <p className="mt-2 text-sm text-[var(--danger)]">{error}</p>}

        <button
          type="submit"
          className="mt-5 w-full rounded-xl bg-[var(--accent)] px-4 py-3.5 text-sm font-semibold text-[#0a0d16] transition-transform active:scale-[0.98] hover:brightness-110 sm:py-3"
        >
          Join the quiz →
        </button>

        <p className="mt-3 text-center text-xs text-[var(--text-faint,var(--text-dim))]">
          No sign-up. If nothing's live yet, you'll wait for the host to start.
        </p>
      </form>

      <a
        href="/leaderboard"
        className="mt-6 text-sm text-[var(--text-dim)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--text)]"
      >
        Just here to see the leaderboard? →
      </a>

      {showWelcome && <WelcomeModal username={username.trim()} onContinue={handleContinue} />}
    </div>
  );
}
