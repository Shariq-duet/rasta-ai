/**
 * SVG donut — one arc per category, drawn with stroke-dasharray so it stays
 * crisp at any size and needs no charting dependency.
 */
export function SpendingDonut({ categories, centerValue, centerLabel, size = 132 }) {
  const stroke = 16
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const gap = 1.5
  let offset = 0
  const arcs = categories.map((category) => {
    const length = (category.percent / 100) * circumference
    const arc = {
      id: category.id,
      hex: category.hex,
      dash: `${Math.max(0, length - gap)} ${circumference - Math.max(0, length - gap)}`,
      offset: -offset,
    }
    offset += length
    return arc
  })
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${centerValue} ${centerLabel}`}
      >
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#eef1f6" strokeWidth={stroke} />
          {arcs.map((arc) => (
            <circle
              key={arc.id}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={arc.hex}
              strokeWidth={stroke}
              strokeDasharray={arc.dash}
              strokeDashoffset={arc.offset}
              strokeLinecap="butt"
            />
          ))}
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="type-amount-lg text-lg font-extrabold">{centerValue}</span>
        <span className="mt-0.5 text-[0.5625rem] tracking-normal text-ink-muted">{centerLabel}</span>
      </div>
    </div>
  )
}
