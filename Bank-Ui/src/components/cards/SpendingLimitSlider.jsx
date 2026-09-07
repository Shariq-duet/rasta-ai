'use client'

import { agentProps } from '@/lib/agent'
import { formatAmount, formatCurrency } from '@/lib/format'
import { useBankStore } from '@/hooks/use-bank-store'
import { Badge, Card, Slider } from '@/components/ui'

export function SpendingLimitSlider({ card }) {
  const updateCard = useBankStore((state) => state.updateCard)
  const remaining = Math.max(0, card.dailyLimit - card.spentToday)
  const availablePercent = card.dailyLimit > 0 ? Math.round((remaining / card.dailyLimit) * 100) : 0
  const disabled = card.status === 'blocked'
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">Daily spending limit</p>
          <p className="type-amount-lg text-xl">
            {formatCurrency(card.dailyLimit)}
          </p>
        </div>
        <Badge tone="positive">{availablePercent}% available</Badge>
      </div>

      <div className="mt-5">
        <Slider
          label={`Daily spending limit for ${card.label}`}
          value={card.dailyLimit}
          min={5_000}
          max={card.maxLimit}
          step={5_000}
          disabled={disabled}
          onChange={(value) => updateCard(card.id, { dailyLimit: value })}
          minLabel={`PKR ${formatAmount(5_000)}`}
          maxLabel={`PKR ${formatAmount(card.maxLimit)}`}
          {...agentProps('cards-limit-slider')}
        />
      </div>

      <p className="mt-3 type-secondary">
        {formatCurrency(card.spentToday)} spent today • {formatCurrency(remaining)} still available
      </p>
    </Card>
  )
}
