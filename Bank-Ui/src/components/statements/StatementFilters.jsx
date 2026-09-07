'use client'

import { agentProps } from '@/lib/agent'
import { Select, Tabs } from '@/components/ui'
const TYPE_TABS = [
  { value: 'all', label: 'All' },
  { value: 'credit', label: 'Money in' },
  { value: 'debit', label: 'Money out' },
]
const RANGES = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom range' },
]

export function StatementFilters({ value, onChange, categories }) {
  return (
    <div className="flex flex-col gap-3">
      <Tabs
        items={TYPE_TABS}
        value={value.type}
        onChange={(type) => onChange({ type })}
        agentId="statements-type"
        ariaLabel="Transaction type"
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Date range"
          value={value.range}
          onChange={(event) => onChange({ range: event.target.value })}
          options={RANGES}
          {...agentProps('statements-range-select')}
        />
        <Select
          label="Category"
          value={value.category}
          onChange={(event) => onChange({ category: event.target.value })}
          options={[
            { value: 'all', label: 'All categories' },
            ...categories.map((entry) => ({ value: entry, label: entry })),
          ]}
          {...agentProps('statements-category-select')}
        />
      </div>

      {value.range === 'custom' ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="statement-from" className="type-label">
              From
            </label>
            <input
              id="statement-from"
              type="date"
              value={value.from}
              onChange={(event) => onChange({ from: event.target.value })}
              className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-[0.8125rem] text-ink transition-colors focus:border-brand-400"
              {...agentProps('statements-from-date')}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="statement-to" className="type-label">
              To
            </label>
            <input
              id="statement-to"
              type="date"
              value={value.to}
              onChange={(event) => onChange({ to: event.target.value })}
              className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-[0.8125rem] text-ink transition-colors focus:border-brand-400"
              {...agentProps('statements-to-date')}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
