'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { ROUTES } from '@/lib/constants'
import { formatCurrency } from '@/lib/format'
import { accounts } from '@/lib/mock-data'
import { useBankStore } from '@/hooks/use-bank-store'
import { Badge } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { DebitCardVisual } from '@/components/cards/DebitCardVisual'
const STATUS_TONE = {
  active: 'positive',
  frozen: 'sky',
  blocked: 'danger',
}
const STATUS_LABEL = {
  active: 'Active',
  frozen: 'Frozen',
  blocked: 'Blocked',
}

export default function CardsPage() {
  const cards = useBankStore((state) => state.cards)
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Card management"
        title="Your cards"
        subtitle="Freeze a card, change its limits or reveal the PIN."
      />

      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6 xl:grid-cols-3">
        {cards.map((card) => {
          const account = accounts.find((entry) => entry.id === card.accountId)
          return (
            <li key={card.id}>
              <Link
                href={ROUTES.card(card.id)}
                className="block rounded-3xl transition-transform duration-200 hover:-translate-y-1"
                {...agentProps(`cards-open-${card.id}`)}
              >
                <DebitCardVisual card={card} size="sm" />
                <div className="mt-2.5 flex items-center gap-2 px-1">
                  <div className="min-w-0 flex-1">
                    <p className="truncate type-row-title">{card.label}</p>
                    <p className="mt-0.5 truncate type-secondary">
                      {account?.nickname} • Limit {formatCurrency(card.dailyLimit)}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[card.status]}>{STATUS_LABEL[card.status]}</Badge>
                  <ChevronRight size={16} aria-hidden className="shrink-0 text-ink-faint" />
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
