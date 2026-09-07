'use client'

import { useMemo, useState } from 'react'
import { Banknote, Building2, Clock, MapPin, Search } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { branches } from '@/lib/mock-data'
import { Badge, Card, EmptyState, Tabs } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { MapPlaceholder } from '@/components/locator/MapPlaceholder'
const TABS = [
  { value: 'all', label: 'All' },
  { value: 'branch', label: 'Branches', icon: <Building2 size={13} aria-hidden /> },
  { value: 'atm', label: 'ATMs', icon: <Banknote size={13} aria-hidden /> },
]

function formatDistance(km) {
  return km < 100 ? `${km.toFixed(1)} km away` : `${Math.round(km).toLocaleString('en-PK')} km away`
}

export default function LocatorPage() {
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    return branches
      .filter((branch) => (tab === 'all' ? true : branch.type === tab))
      .filter((branch) =>
        term
          ? branch.name.toLowerCase().includes(term) ||
            branch.city.toLowerCase().includes(term) ||
            branch.address.toLowerCase().includes(term)
          : true,
      )
      .sort((a, b) => a.distanceKm - b.distanceKm)
  }, [tab, query])
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <PageHeader eyebrow="Find us" subtitle="Branches and ATMs near you. Locations shown are illustrative." />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:gap-6">
        <div className="flex flex-col gap-4 lg:sticky lg:top-[88px]">
          <MapPlaceholder />

          <div className="relative">
            <label htmlFor="locator-search" className="sr-only">
              Search branches and ATMs
            </label>
            <Search
              size={15}
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              id="locator-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search branch, area or city"
              className="h-11 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-[0.8125rem] text-ink placeholder:text-ink-faint transition-colors focus:border-brand-400"
              {...agentProps('locator-search-input')}
            />
          </div>

          <Tabs items={TABS} value={tab} onChange={setTab} agentId="locator-tab" ariaLabel="Location type" />
        </div>

        <div>
          {results.length === 0 ? (
            <Card>
              <EmptyState
                icon={<MapPin size={20} />}
                title="Nothing nearby"
                description={`Nothing matches "${query}". Try another area or city.`}
              />
            </Card>
          ) : (
            <ul className="flex flex-col gap-2">
              {results.map((branch) => (
                <li key={branch.id}>
                  <Card className="p-3.5" {...agentProps(`locator-result-${branch.id}`)}>
                    <div className="flex items-start gap-3">
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${branch.type === 'branch' ? 'bg-brand-50 text-brand-600' : 'bg-accent-100 text-accent-600'}`}
                      >
                        {branch.type === 'branch' ? (
                          <Building2 size={18} aria-hidden />
                        ) : (
                          <Banknote size={18} aria-hidden />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-[0.8125rem] font-bold text-ink">{branch.name}</p>
                          <Badge tone={branch.type === 'branch' ? 'brand' : 'accent'}>
                            {branch.type === 'branch' ? 'Branch' : 'ATM'}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-ink-muted">
                          {branch.address}, {branch.city}
                        </p>
                        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 type-caption">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} aria-hidden />
                            {formatDistance(branch.distanceKm)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} aria-hidden />
                            {branch.timings}
                          </span>
                        </p>
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {branch.services.map((service) => (
                            <li
                              key={service}
                              className="rounded-full bg-canvas px-2 py-0.5 text-[0.5625rem] font-semibold text-ink-muted"
                            >
                              {service}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
