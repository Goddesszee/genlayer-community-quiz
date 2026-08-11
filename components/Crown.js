const COLORS = {
  1: "var(--gold)",
  2: "var(--silver)",
  3: "var(--bronze)",
};

export default function Crown({ rank, size = 20 }) {
  const color = COLORS[rank];
  if (!color) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={rank === 1 ? "crown-glow-1" : ""}
      aria-hidden="true"
    >
      <path
        d="M3 8.5L6.5 11L9.7 6.2C10.2 5.5 11 5.1 11.8 5.1H12.2C13 5.1 13.8 5.5 14.3 6.2L17.5 11L21 8.5L19.3 17.5C19.1 18.5 18.2 19.2 17.2 19.2H6.8C5.8 19.2 4.9 18.5 4.7 17.5L3 8.5Z"
        fill={color}
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="3.4" r="1.4" fill={color} />
      <circle cx="3" cy="8" r="1.4" fill={color} />
      <circle cx="21" cy="8" r="1.4" fill={color} />
    </svg>
  );
}
