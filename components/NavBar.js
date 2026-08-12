import Link from "next/link";

export default function NavBar() {
  return (
    <header
      style={{ borderColor: "var(--border-soft, var(--border))" }}
      className="sticky top-0 z-20 border-b bg-[var(--bg)]/90 backdrop-blur"
    >
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:h-16 sm:px-5">
        <Link href="/" className="flex min-w-0 items-center gap-2 group">
          <img src="/genlayer-logo-white.png" alt="" className="h-5 w-auto shrink-0 opacity-90 sm:h-6" />
          <span
            style={{ fontFamily: "var(--font-display)" }}
            className="truncate text-[15px] font-semibold tracking-tight text-[var(--text)]"
          >
            GenLayer<span className="text-[var(--accent)]"> Quiz</span>
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-1 text-sm">
          <Link
            href="/leaderboard"
            className="rounded-lg px-2.5 py-1.5 text-[var(--text-dim)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)] sm:px-3"
          >
            Leaderboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
