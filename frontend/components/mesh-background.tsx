"use client";

// Fixed layout (not random) so server and client render identically and
// nothing shifts on hydration. Coordinates are in a 0-100 viewBox.
const NODES = [
  { x: 8, y: 20 }, { x: 22, y: 8 }, { x: 38, y: 24 }, { x: 55, y: 12 },
  { x: 70, y: 26 }, { x: 88, y: 15 }, { x: 15, y: 45 }, { x: 32, y: 52 },
  { x: 50, y: 42 }, { x: 66, y: 55 }, { x: 82, y: 46 }, { x: 94, y: 62 },
  { x: 10, y: 75 }, { x: 26, y: 88 }, { x: 44, y: 78 }, { x: 60, y: 90 },
  { x: 76, y: 80 }, { x: 90, y: 92 },
] as const;

// Connect each node to its 1-2 nearest neighbors so the graph reads as a
// mesh, not a random scribble.
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  [0, 6], [1, 6], [2, 7], [2, 8], [3, 8], [4, 9], [5, 10], [5, 11],
  [6, 7], [7, 8], [8, 9], [9, 10], [10, 11],
  [6, 12], [7, 13], [8, 14], [9, 15], [10, 16], [11, 17],
  [12, 13], [13, 14], [14, 15], [15, 16], [16, 17],
];

/**
 * Decorative animated backdrop for the auth screens: a mesh of connected
 * nodes with lines that pulse in sequence, standing in for "a network
 * re-establishing itself" -- the product's own concept, rather than a
 * generic stock hero graphic. Pure SVG/CSS, respects prefers-reduced-motion
 * (falls back to a static mesh), and never intercepts pointer events.
 */
export function MeshBackground({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="0.15" className="text-primary/40">
        {EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
            className="animate-mesh-pulse"
            style={{ animationDelay: `${(i % 10) * 0.35}s` }}
          />
        ))}
      </g>
      <g className="text-primary">
        {NODES.map((n, i) => (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r="0.7"
            fill="currentColor"
            className="animate-mesh-float"
            style={{ animationDelay: `${(i % 6) * 0.5}s` }}
          />
        ))}
      </g>
    </svg>
  );
}
