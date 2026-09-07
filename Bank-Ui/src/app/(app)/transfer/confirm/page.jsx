'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShieldCheck, Zap } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { ROUTES } from '@/lib/constants'
import { formatCurrency, parseAmount } from '@/lib/format'
import { useAccounts, useBankStore } from '@/hooks/use-bank-store'
import { Badge, Button, Card } from '@/components/ui'
import { ReviewList } from '@/components/transfer/ReviewList'

export default function TransferConfirmPage() {
  const router = useRouter()
  const accounts = useAccounts()
  const transfer = useBankStore((state) => state.transfer)
  const beneficiaries = useBankStore((state) => state.beneficiaries)
  const amount = parseAmount(transfer.amount)
  const fromAccount = accounts.find((entry) => entry.id === transfer.fromAccountId)
  const beneficiary = beneficiaries.find((entry) => entry.id === transfer.beneficiaryId)
  const toAccount = accounts.find((entry) => entry.id === transfer.toAccountId)
  const isIbft = transfer.mode === 'ibft'
  const raast = isIbft && (beneficiary?.raastEnabled ?? false)
  // A refresh clears the draft, so send the customer back to step 1.
  useEffect(() => {
    if (amount <= 0) router.replace(ROUTES.transfer)
  }, [amount, router])
  if (amount <= 0 || !fromAccount) return null
  const items = [
    {
      label: 'From',
      value: `${fromAccount.nickname} ${fromAccount.maskedNumber}`,
      agentId: 'sendmoney-confirm-from',
    },
    {
      label: 'To',
      value: isIbft
        ? `${beneficiary?.name ?? '—'} ${beneficiary?.maskedNumber ?? ''}`
        : `${toAccount?.nickname ?? '—'} ${toAccount?.maskedNumber ?? ''}`,
      agentId: 'sendmoney-confirm-to',
    },
    {
      label: 'Bank',
      value: isIbft ? (beneficiary?.bank ?? '—') : 'Zenith Bank',
      agentId: 'sendmoney-confirm-bank',
    },
    { label: 'Amount', value: formatCurrency(amount), agentId: 'sendmoney-confirm-amount', emphasis: true },
    { label: 'Fee', value: raast ? 'Free' : formatCurrency(0), agentId: 'sendmoney-confirm-fee' },
    {
      label: 'Arrives',
      value: raast ? 'Instantly' : isIbft ? 'Within minutes' : 'Instantly',
      agentId: 'sendmoney-confirm-arrival',
    },
  ]
  if (transfer.note.trim()) {
    items.push({ label: 'Note', value: transfer.note, agentId: 'sendmoney-confirm-note' })
  }
  return (
    <div className="flex flex-col gap-4 lg:mx-auto lg:w-full lg:max-w-2xl">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="heading-sm">Transfer summary</h2>
          <Badge tone="positive" icon={<ShieldCheck size={12} aria-hidden />}>
            Secure
          </Badge>
        </div>

        {raast ? (
          <div
            className="mt-3 flex items-center gap-2.5 rounded-xl bg-positive-50 px-3 py-2.5"
            {...agentProps('sendmoney-confirm-raast-badge')}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-positive-500 text-white">
              <Zap size={14} aria-hidden />
            </span>
            <p className="text-[0.6875rem] font-semibold text-positive-600">
              Instant • Free via Raast
              <span className="block font-normal text-positive-500/80">
                Settled in seconds through Pakistan&apos;s instant payment system.
              </span>
            </p>
          </div>
        ) : null}

        <ReviewList items={items} className="mt-4" />

        <div className="mt-5 flex gap-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => router.push(ROUTES.transfer)}
            {...agentProps('sendmoney-confirm-back')}
          >
            <ArrowLeft size={16} aria-hidden />
            Edit
          </Button>
          <Button
            fullWidth
            onClick={() => router.push(ROUTES.transferSuccess)}
            {...agentProps('sendmoney-confirm-approve')}
          >
            Confirm &amp; send
          </Button>
        </div>
      </Card>
    </div>
  )
}
