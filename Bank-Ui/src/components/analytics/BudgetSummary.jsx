import { Target } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { formatCurrency, formatPercent } from '@/lib/format'
import { Badge, Card } from '@/components/ui'

export function BudgetSummary({ budget, spent }) {
  const remaining = Math.max(0, budget - spent)
  const usedPercent = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0
  const onTrack = usedPercent < 80
  return (
    <Card interactive {...agentProps('analytics-budget-card')}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-100 text-accent-600">
          <Target size={18} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow mb-1">Monthly budget</p>
          <h2 className="heading-md">{onTrack ? 'You are on track' : 'Close to your limit'}</h2>
          <p className="mt-1 type-secondary">
            {formatCurrency(remaining)} remaining of {formatCurrency(budget)}
          </p>
        </div>
        <Badge tone={onTrack ? 'positive' : 'accent'}>{formatPercent(Math.round(usedPercent))} used</Badge>
      </div>

      <div
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-canvas"
        role="progressbar"
        aria-label="Budget used this month"
        aria-valuenow={Math.round(usedPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span
          className={`block h-full rounded-full transition-[width] duration-500 ${onTrack ? 'bg-positive-500' : 'bg-accent-300'}`}
          style={{ width: `${usedPercent}%` }}
        />
      </div>
    </Card>
  )
}
