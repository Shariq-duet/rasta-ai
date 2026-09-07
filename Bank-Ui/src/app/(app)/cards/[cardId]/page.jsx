'use client'

import { use } from 'react'
import { CreditCard } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { accounts } from '@/lib/mock-data'
import { useBankStore } from '@/hooks/use-bank-store'
import { ButtonLink, EmptyState } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { DebitCardVisual } from '@/components/cards/DebitCardVisual'
import { CardControls } from '@/components/cards/CardControls'
import { SpendingLimitSlider } from '@/components/cards/SpendingLimitSlider'

export default function CardDetailPage({ params }) {
  const { cardId } = use(params)
  const card = useBankStore((state) => state.cards.find((entry) => entry.id === cardId))
  if (!card) {
    return (
      <EmptyState
        icon={<CreditCard size={20} />}
        title="Card not found"
        description="This card is no longer linked to your profile."
        action={
          <ButtonLink href={ROUTES.cards} variant="secondary" size="sm">
            Back to cards
          </ButtonLink>
        }
      />
    )
  }
  const account = accounts.find((entry) => entry.id === card.accountId)
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <PageHeader eyebrow={account?.nickname ?? 'Linked account'} title={card.label} />
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
        <div className="flex flex-col gap-4 lg:gap-6">
          <DebitCardVisual card={card} />
          <SpendingLimitSlider card={card} />
        </div>
        <div className="flex flex-col gap-4 lg:gap-6">
          <CardControls card={card} />
        </div>
      </div>
    </div>
  )
}
