'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { billers } from '@/lib/mock-data'
import { EmptyState } from '@/components/ui'
import { BillerCard } from './BillerCard'

export function BillerList({ selectedId, onSelect }) {
  const [query, setQuery] = useState('')
  const term = query.trim().toLowerCase()
  const results = term
    ? billers.filter(
        (biller) => biller.name.toLowerCase().includes(term) || biller.category.toLowerCase().includes(term),
      )
    : billers
  return (
    <div {...agentProps('paybill-biller-select')}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <label htmlFor="biller-search" className="sr-only">
            Search billers
          </label>
          <Search
            size={15}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            id="biller-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search billers"
            className="h-11 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-[0.8125rem] text-ink placeholder:text-ink-faint transition-colors focus:border-brand-400"
            {...agentProps('paybill-biller-search')}
          />
        </div>
        <button
          type="button"
          aria-label="Add a biller"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line bg-surface text-brand-600 transition-colors hover:border-brand-200 hover:bg-brand-50"
          {...agentProps('paybill-add-biller')}
        >
          <Plus size={17} />
        </button>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={<Search size={20} />}
          title="No billers found"
          description={`Nothing matches "${query}". Try a different name or category.`}
        />
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {results.map((biller) => (
            <li key={biller.id}>
              <BillerCard
                biller={biller}
                selected={biller.id === selectedId}
                onSelect={() => onSelect(biller.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
