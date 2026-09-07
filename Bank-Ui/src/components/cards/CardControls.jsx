'use client'

import { useState } from 'react'
import { Eye, EyeOff, Globe, Nfc, ShieldBan, ShoppingBag, Snowflake } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { useBankStore } from '@/hooks/use-bank-store'
import { Button, Card, Modal, ToggleRow } from '@/components/ui'

export function CardControls({ card }) {
  const updateCard = useBankStore((state) => state.updateCard)
  const [pinVisible, setPinVisible] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)
  const blocked = card.status === 'blocked'
  return (
    <>
      <Card padded={false} className="px-4">
        <div className="divide-y divide-line">
          <ToggleRow
            title="Freeze card"
            description="Temporarily decline every transaction"
            icon={<Snowflake size={17} />}
            checked={card.status === 'frozen'}
            disabled={blocked}
            onChange={(checked) => updateCard(card.id, { status: checked ? 'frozen' : 'active' })}
            {...agentProps('cards-freeze-toggle')}
          />
          <ToggleRow
            title="E-commerce transactions"
            description="Allow online and in-app payments"
            icon={<ShoppingBag size={17} />}
            checked={card.ecommerceEnabled}
            disabled={blocked}
            onChange={(checked) => updateCard(card.id, { ecommerceEnabled: checked })}
            {...agentProps('cards-ecommerce-toggle')}
          />
          <ToggleRow
            title="Contactless payments"
            description="Tap to pay at supported terminals"
            icon={<Nfc size={17} />}
            checked={card.contactlessEnabled}
            disabled={blocked}
            onChange={(checked) => updateCard(card.id, { contactlessEnabled: checked })}
            {...agentProps('cards-contactless-toggle')}
          />
          <ToggleRow
            title="International usage"
            description="Use this card outside Pakistan"
            icon={<Globe size={17} />}
            checked={card.internationalEnabled}
            disabled={blocked}
            onChange={(checked) => updateCard(card.id, { internationalEnabled: checked })}
            {...agentProps('cards-international-toggle')}
          />

          <div className="flex items-center gap-3 py-3.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              {pinVisible ? <EyeOff size={17} /> : <Eye size={17} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="type-row-title">Card PIN</p>
              <p className="mt-0.5 type-secondary">
                {pinVisible ? (
                  <span className="font-bold tracking-[0.35em] text-brand-700">{card.pin}</span>
                ) : (
                  'Reveal your 4-digit PIN'
                )}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPinVisible((current) => !current)}
              aria-pressed={pinVisible}
              {...agentProps('cards-view-pin')}
            >
              {pinVisible ? 'Hide' : 'Reveal'}
            </Button>
          </div>
        </div>
      </Card>

      <Button
        variant={blocked ? 'secondary' : 'danger'}
        size="lg"
        fullWidth
        onClick={() => (blocked ? updateCard(card.id, { status: 'active' }) : setBlockOpen(true))}
        {...agentProps('cards-block-card')}
      >
        <ShieldBan size={17} aria-hidden />
        {blocked ? 'Unblock card' : 'Block card permanently'}
      </Button>

      <Modal
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        title="Block this card?"
        description="Blocking stops every transaction immediately. A replacement card will be posted to your registered address."
        agentId="cards-block-modal"
        footer={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setBlockOpen(false)}
              {...agentProps('cards-block-cancel')}
            >
              Keep card active
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                updateCard(card.id, { status: 'blocked' })
                setBlockOpen(false)
              }}
              {...agentProps('cards-block-confirm')}
            >
              Block card
            </Button>
          </div>
        }
      >
        <p className="text-xs leading-relaxed text-ink-muted">
          {card.label} • {card.maskedNumber}
        </p>
      </Modal>
    </>
  )
}
