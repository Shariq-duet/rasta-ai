'use client'

import { ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { formatCurrency, parseAmount } from '@/lib/format'
import { useAccounts, useBankStore } from '@/hooks/use-bank-store'
import { Badge, Card, EmptyState } from '@/components/ui'
import { ReviewList } from './ReviewList'

/**
 * Desktop-only companion to TransferForm: the wide layout has room to show the
 * review beside the form instead of only on the next step. Same draft, same
 * ReviewList — it just surfaces earlier when the viewport allows.
 */
export function TransferSummaryAside() {
  const accounts = useAccounts()
  const transfer = useBankStore((state) => state.transfer)
  const beneficiaries = useBankStore((state) => state.beneficiaries)
  const amount = parseAmount(transfer.amount)
  const fromAccount = accounts.find((entry) => entry.id === transfer.fromAccountId)
  const beneficiary = beneficiaries.find((entry) => entry.id === transfer.beneficiaryId)
  const toAccount = accounts.find((entry) => entry.id === transfer.toAccountId)
  const isIbft = transfer.mode === 'ibft'
  const raast = isIbft && (beneficiary?.raastEnabled ?? false)
  if (amount <= 0) {
    return (
      <Card className="hidden lg:block">
        <EmptyState
          icon={<ArrowRight size={20} />}
          title="Your transfer summary"
          description="Pick a recipient and enter an amount — the review appears here before you confirm."
        />
      </Card>
    )
  }
  const items = [
    {
      label: 'From',
      value: `${fromAccount?.nickname ?? '—'} ${fromAccount?.maskedNumber ?? ''}`,
      agentId: 'sendmoney-aside-from',
    },
    {
      label: 'To',
      value: isIbft
        ? `${beneficiary?.name ?? '—'} ${beneficiary?.maskedNumber ?? ''}`
        : `${toAccount?.nickname ?? '—'} ${toAccount?.maskedNumber ?? ''}`,
      agentId: 'sendmoney-aside-to',
    },
    {
      label: 'Bank',
      value: isIbft ? (beneficiary?.bank ?? '—') : 'Zenith Bank',
      agentId: 'sendmoney-aside-bank',
    },
    { label: 'Amount', value: formatCurrency(amount), agentId: 'sendmoney-aside-amount', emphasis: true },
    { label: 'Fee', value: raast ? 'Free' : formatCurrency(0), agentId: 'sendmoney-aside-fee' },
  ]
  return (
    <Card className="hidden lg:block lg:sticky lg:top-[104px]" {...agentProps('sendmoney-aside')}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="heading-sm">Summary</h2>
        <Badge tone="positive" icon={<ShieldCheck size={12} aria-hidden />}>
          Secure
        </Badge>
      </div>

      {raast ? (
        <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-positive-50 px-3 py-2.5">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-positive-400 text-white">
            <Zap size={14} aria-hidden />
          </span>
          <p className="text-[0.6875rem] font-semibold text-positive-600">Instant • Free via Raast</p>
        </div>
      ) : null}

      <ReviewList items={items} className="mt-4" />

      <p className="mt-4 text-[0.6875rem] leading-relaxed text-ink-muted">
        You will confirm the full details on the next step before anything is sent.
      </p>
    </Card>
  )
}
