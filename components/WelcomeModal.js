"use client";

export default function WelcomeModal({ username, onContinue }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-heading"
    >
      <div className="card-pop glass-panel w-full max-w-xs rounded-2xl p-6 text-center sm:max-w-sm sm:p-8">
        <img
          src="/genlayer-logo-white.png"
          alt=""
          className="logo-glow mx-auto mb-5 h-14 w-auto sm:h-16"
        />

        <p style={{ fontFamily: "var(--font-mono)" }} className="text-xs uppercase tracking-wide text-[var(--accent-2)]">
          Welcome
        </p>
        <h2
          id="welcome-heading"
          style={{ fontFamily: "var(--font-display)" }}
          className="mt-2 break-words text-xl font-semibold text-[var(--text)] sm:text-2xl"
        >
          @{username}
        </h2>
        <p className="mt-3 text-sm text-[var(--text-dim)]">
          You're in. Get ready to test your knowledge of GenLayer, AI, and Web3.
        </p>

        <button
          type="button"
          onClick={onContinue}
          autoFocus
          className="btn-primary mt-6 w-full rounded-xl px-4 py-3 text-sm"
        >
          Continue to quiz →
        </button>
      </div>
    </div>
  );
}
