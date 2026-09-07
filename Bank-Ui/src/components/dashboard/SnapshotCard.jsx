'use client'

import { TrendingUp } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { formatCurrency } from '@/lib/format'
import { useSelectedAccount } from '@/hooks/use-bank-store'
import { Card } from '@/components/ui'

export function SnapshotCard() {
  const account = useSelectedAccount()
  const remaining = Math.max(0, account.monthlyIncome - account.monthlySpend)
  const spentPercent =
    account.monthlyIncome > 0 ? Math.min(100, (account.monthlySpend / account.monthlyIncome) * 100) : 0
  return (
    <Card className="bg-gradient-to-br from-white to-[#fbfcff]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="heading-sm">Monthly snapshot</h2>
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-positive-50 text-positive-500">
          <TrendingUp size={16} aria-hidden />
        </span>
      </div>

      <dl className="mt-4 flex gap-6" {...agentProps('home-snapshot-figures')}>
        <div>
          <dt className="type-secondary">Money in</dt>
          <dd className="type-amount-lg mt-1 text-positive-500">
            {formatCurrency(account.monthlyIncome)}
          </dd>
        </div>
        <div>
          <dt className="type-secondary">Money out</dt>
          <dd className="type-amount-lg mt-1">
            {formatCurrency(account.monthlySpend)}
          </dd>
        </div>
      </dl>

      <div
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-canvas"
        role="progressbar"
        aria-label="Share of this month's income already spent"
        aria-valuenow={Math.round(spentPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span
          className="block h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-300 transition-[width] duration-500"
          style={{ width: `${spentPercent}%` }}
        />
      </div>
      <p className="mt-2 type-secondary">
        {formatCurrency(remaining)} left of your {formatCurrency(account.monthlyIncome)} income
      </p>
    </Card>
  )
}
