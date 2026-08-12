// A faint constellation of nodes connected by edges, standing in for
// GenLayer's actual mechanism: a network of validators reaching consensus.
// Fixed behind all content, aria-hidden, respects prefers-reduced-motion
// (the pulse keyframe is disabled globally for reduced-motion users).

const NODES = [
  { x: 60, y: 90 }, { x: 220, y: 40 }, { x: 400, y: 130 }, { x: 610, y: 60 },
  { x: 780, y: 150 }, { x: 940, y: 70 }, { x: 130, y: 260 }, { x: 340, y: 300 },
  { x: 550, y: 250 }, { x: 720, y: 330 }, { x: 900, y: 260 }, { x: 40, y: 420 },
  { x: 260, y: 460 }, { x: 470, y: 410 }, { x: 660, y: 470 }, { x: 860, y: 430 },
];

const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 6], [1, 8], [2, 8], [3, 9],
  [4, 10], [6, 7], [7, 8], [8, 9], [9, 10], [6, 11], [7, 12], [8, 13],
  [9, 14], [10, 15], [11, 12], [12, 13], [13, 14], [14, 15],
];

const PULSING = new Set([2, 8, 13]);

export default function NetworkBackground() {
  return (
    <svg
      className="network-bg"
      viewBox="0 0 980 520"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
    >
      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="var(--border)"
          strokeWidth="1"
        />
      ))}
      {NODES.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={PULSING.has(i) ? 3 : 2}
          fill={PULSING.has(i) ? "var(--accent)" : "var(--text-faint)"}
          className={PULSING.has(i) ? "network-node" : ""}
          style={PULSING.has(i) ? { animationDelay: `${i * 0.6}s` } : undefined}
        />
      ))}
    </svg>
  );
}
