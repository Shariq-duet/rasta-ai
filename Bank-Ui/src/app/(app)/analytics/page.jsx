'use client'

import { TrendingDown } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { formatCurrency } from '@/lib/format'
import { spendingCategories, TODAY } from '@/lib/mock-data'
import { useSelectedAccount } from '@/hooks/use-bank-store'
import { Card } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { SpendingDonut } from '@/components/analytics/SpendingDonut'
import { CategoryBreakdown } from '@/components/analytics/CategoryBreakdown'
import { BudgetSummary } from '@/components/analytics/BudgetSummary'
const MONTHLY_BUDGET = 350_000

export default function AnalyticsPage() {
  const account = useSelectedAccount()
  const spent = spendingCategories.reduce((total, category) => total + category.amount, 0)
  const budgetPercent = Math.round((spent / MONTHLY_BUDGET) * 100)
  const thisMonth = TODAY.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <PageHeader eyebrow={thisMonth} title="Spending insights" subtitle={account.nickname} />
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
        <div className="flex flex-col gap-4 lg:gap-6">
          <Card className="bg-gradient-to-br from-brand-50 to-accent-50" {...agentProps('analytics-hero')}>
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="eyebrow mb-1">Total spent</p>
                <p className="type-display text-[1.625rem]">
                  {formatCurrency(spent)}
                </p>
                <p className="mt-1.5 flex items-center gap-1 text-[0.6875rem] font-semibold text-positive-500">
                  <TrendingDown size={14} aria-hidden />
                  12.8% less than last month
                </p>
              </div>
              <SpendingDonut
                categories={spendingCategories}
                centerValue={`${budgetPercent}%`}
                centerLabel="of budget"
                size={120}
              />
            </div>
          </Card>

          <BudgetSummary budget={MONTHLY_BUDGET} spent={spent} />
        </div>
        <CategoryBreakdown categories={spendingCategories} />
      </div>
    </div>
  )
}
