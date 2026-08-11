import Link from "next/link";

export default function NavBar() {
  return (
    <header
      style={{ borderColor: "var(--border-soft, var(--border))" }}
      className="sticky top-0 z-20 border-b bg-[var(--bg)]/90 backdrop-blur"
    >
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent-2)] opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--accent-2)]" />
          </span>
          <span
            style={{ fontFamily: "var(--font-display)" }}
            className="text-[15px] font-semibold tracking-tight text-[var(--text)]"
          >
            GenLayer<span className="text-[var(--accent)]"> Quiz</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/leaderboard"
            className="rounded-lg px-3 py-1.5 text-[var(--text-dim)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)]"
          >
            Leaderboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
