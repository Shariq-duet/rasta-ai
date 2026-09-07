import { cn } from '@/lib/cn'
const GRID = 21

/**
 * A deterministic, decorative QR-style block. It encodes nothing — this is a
 * static placeholder standing in for a real Raast P2M code.
 */
export function QrPlaceholder({ seed, size = 176, className }) {
  const cells = []
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }
  for (let index = 0; index < GRID * GRID; index += 1) {
    hash = (hash * 1_103_515_245 + 12_345) >>> 0
    cells.push(((hash >>> 16) & 1) === 1)
  }
  const isFinder = (row, col) =>
    (row < 7 && col < 7) || (row < 7 && col >= GRID - 7) || (row >= GRID - 7 && col < 7)
  return (
    <div
      aria-hidden
      className={cn('rounded-2xl bg-white p-3 shadow-card ring-1 ring-line', className)}
      style={{ width: size + 24, height: size + 24 }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${GRID} ${GRID}`} shapeRendering="crispEdges">
        <rect width={GRID} height={GRID} fill="#ffffff" />
        {cells.map((filled, index) => {
          const row = Math.floor(index / GRID)
          const col = index % GRID
          if (isFinder(row, col) || !filled) return null
          return <rect key={index} x={col} y={row} width={1} height={1} fill="#17233e" />
        })}
        {[
          [0, 0],
          [0, GRID - 7],
          [GRID - 7, 0],
        ].map(([row, col]) => (
          <g key={`${row}-${col}`}>
            <rect x={col} y={row} width={7} height={7} fill="#3d3ac7" />
            <rect x={col + 1} y={row + 1} width={5} height={5} fill="#ffffff" />
            <rect x={col + 2} y={row + 2} width={3} height={3} fill="#3d3ac7" />
          </g>
        ))}
      </svg>
      <span className="sr-only">Decorative QR code placeholder — not scannable</span>
    </div>
  )
}
