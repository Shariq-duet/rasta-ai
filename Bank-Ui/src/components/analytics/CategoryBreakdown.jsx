import { agentProps } from '@/lib/agent'
import { formatCurrency, formatPercent } from '@/lib/format'
import { Card } from '@/components/ui'

export function CategoryBreakdown({ categories }) {
  return (
    <Card interactive>
      <div className="mb-1">
        <p className="eyebrow mb-1">Where it goes</p>
        <h2 className="heading-md">Spending by category</h2>
      </div>

      <ul className="mt-4 flex flex-col gap-4">
        {categories.map((category) => (
          <li key={category.id} {...agentProps(`analytics-category-${category.id}`)}>
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="truncate font-medium text-ink">{category.label}</span>
              <span className="type-amount shrink-0">{formatCurrency(category.amount)}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas"
                role="progressbar"
                aria-label={`${category.label} share of spending`}
                aria-valuenow={category.percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span
                  className={`block h-full rounded-full ${category.colorClass}`}
                  style={{ width: `${category.percent}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-[0.625rem] font-semibold text-ink-muted [font-variant-numeric:tabular-nums]">
                {formatPercent(category.percent)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
