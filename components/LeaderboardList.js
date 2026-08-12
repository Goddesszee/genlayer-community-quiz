import Crown from "@/components/Crown";

const RANK_BORDER = {
  1: "border-[var(--gold)]/50",
  2: "border-[var(--silver)]/40",
  3: "border-[var(--bronze)]/40",
};

export default function LeaderboardList({ entries, highlightUsername }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center text-sm text-[var(--text-dim)]">
        No scores yet. Be the first to play and claim the top spot.
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {entries.map((entry) => {
        const isTop3 = entry.rank <= 3;
        const isMe =
          highlightUsername &&
          entry.username.toLowerCase() === highlightUsername.toLowerCase();

        return (
          <li
            key={entry.username}
            className={`flex items-center gap-4 rounded-xl border px-4 py-3 backdrop-blur transition-colors ${
              isTop3 ? RANK_BORDER[entry.rank] : "border-[var(--border)]"
            } ${isMe ? "bg-[var(--accent-soft)]" : "bg-[var(--surface)]/70"}`}
          >
            <span
              style={{ fontFamily: "var(--font-mono)" }}
              className="w-6 shrink-0 text-sm text-[var(--text-dim)]"
            >
              {String(entry.rank).padStart(2, "0")}
            </span>

            <span className="flex w-6 shrink-0 items-center justify-center">
              {isTop3 ? <Crown rank={entry.rank} size={18} /> : null}
            </span>

            <span
              style={{ fontFamily: "var(--font-mono)" }}
              className="flex-1 truncate text-sm text-[var(--text)]"
            >
              @{entry.username}
              {isMe && (
                <span className="ml-2 text-[11px] text-[var(--accent)]">you</span>
              )}
            </span>

            <span
              style={{ fontFamily: "var(--font-mono)" }}
              className="text-sm font-semibold text-[var(--text)]"
            >
              {entry.score}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
