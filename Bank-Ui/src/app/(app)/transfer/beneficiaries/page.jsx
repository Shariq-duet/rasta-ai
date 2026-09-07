'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Send, Star, Trash2, Users, Zap } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { ROUTES } from '@/lib/constants'
import { formatCurrency, formatIban } from '@/lib/format'
import { useBankStore } from '@/hooks/use-bank-store'
import { Avatar, Badge, Button, ButtonLink, Card, EmptyState, Modal } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'

export default function BeneficiariesPage() {
  const router = useRouter()
  const beneficiaries = useBankStore((state) => state.beneficiaries)
  const removeBeneficiary = useBankStore((state) => state.removeBeneficiary)
  const toggleFavourite = useBankStore((state) => state.toggleFavourite)
  const setTransfer = useBankStore((state) => state.setTransfer)
  const [pendingRemoval, setPendingRemoval] = useState(null)
  const target = beneficiaries.find((entry) => entry.id === pendingRemoval) ?? null
  const sendTo = (beneficiaryId) => {
    setTransfer({ beneficiaryId, mode: 'ibft' })
    router.push(ROUTES.transfer)
  }
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Payees"
        subtitle={`${beneficiaries.length} saved ${beneficiaries.length === 1 ? 'payee' : 'payees'}`}
        action={
          <ButtonLink href={ROUTES.beneficiaryNew} size="sm" {...agentProps('beneficiaries-add')}>
            <Plus size={15} aria-hidden />
            Add
          </ButtonLink>
        }
      />

      {beneficiaries.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users size={20} />}
            title="No beneficiaries yet"
            description="Add a payee once and future transfers take only a couple of taps."
            action={
              <ButtonLink href={ROUTES.beneficiaryNew} size="sm">
                Add a beneficiary
              </ButtonLink>
            }
          />
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {beneficiaries.map((beneficiary) => (
            <li key={beneficiary.id}>
              <Card className="p-3.5" {...agentProps(`beneficiary-card-${beneficiary.id}`)}>
                <div className="flex items-start gap-3">
                  <Avatar initials={beneficiary.initials} tone={beneficiary.tone} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[0.8125rem] font-bold text-ink">{beneficiary.name}</p>
                      {beneficiary.raastEnabled ? (
                        <Badge tone="positive" icon={<Zap size={10} aria-hidden />}>
                          Raast
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate type-secondary">{beneficiary.bank}</p>
                    <p className="mt-0.5 truncate type-caption">
                      {formatIban(beneficiary.iban)}
                    </p>
                    <p className="mt-1.5 text-[0.625rem] font-semibold text-ink-muted">
                      Transfer limit{' '}
                      <span className="text-brand-700 [font-variant-numeric:tabular-nums]">
                        {formatCurrency(beneficiary.transferLimit)}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFavourite(beneficiary.id)}
                    aria-label={
                      beneficiary.favourite
                        ? `Remove ${beneficiary.name} from favourites`
                        : `Add ${beneficiary.name} to favourites`
                    }
                    aria-pressed={beneficiary.favourite}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-canvas hover:text-accent-500"
                    {...agentProps(`beneficiary-favourite-${beneficiary.id}`)}
                  >
                    <Star
                      size={16}
                      fill={beneficiary.favourite ? '#22D3EE' : 'none'}
                      stroke={beneficiary.favourite ? '#22D3EE' : 'currentColor'}
                    />
                  </button>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    fullWidth
                    onClick={() => sendTo(beneficiary.id)}
                    {...agentProps(`beneficiary-send-${beneficiary.id}`)}
                  >
                    <Send size={14} aria-hidden />
                    Send money
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setPendingRemoval(beneficiary.id)}
                    aria-label={`Remove ${beneficiary.name}`}
                    {...agentProps(`beneficiary-remove-${beneficiary.id}`)}
                  >
                    <Trash2 size={14} aria-hidden />
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={target !== null}
        onClose={() => setPendingRemoval(null)}
        title="Remove this beneficiary?"
        description="You can add them again at any time."
        agentId="beneficiary-remove-modal"
        footer={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setPendingRemoval(null)}
              {...agentProps('beneficiary-keep-btn')}
            >
              Keep
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                if (target) removeBeneficiary(target.id)
                setPendingRemoval(null)
              }}
              {...agentProps('beneficiary-remove-confirm')}
            >
              Remove
            </Button>
          </div>
        }
      >
        <p className="text-xs leading-relaxed text-ink-muted">
          {target?.name} • {target?.bank} {target?.maskedNumber}
        </p>
      </Modal>
    </div>
  )
}
