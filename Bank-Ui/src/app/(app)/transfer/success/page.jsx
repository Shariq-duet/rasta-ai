'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Home } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { ROUTES } from '@/lib/constants'
import { formatCurrency, parseAmount } from '@/lib/format'
import { useAccounts, useBankStore } from '@/hooks/use-bank-store'
import { Button } from '@/components/ui'
import { FlowSuccessState } from '@/components/transfer/FlowSuccessState'
import { ReviewList } from '@/components/transfer/ReviewList'

export default function TransferSuccessPage() {
  const router = useRouter()
  const accounts = useAccounts()
  const transfer = useBankStore((state) => state.transfer)
  const beneficiaries = useBankStore((state) => state.beneficiaries)
  const resetTransfer = useBankStore((state) => state.resetTransfer)
  const amount = parseAmount(transfer.amount)
  const fromAccount = accounts.find((entry) => entry.id === transfer.fromAccountId)
  const beneficiary = beneficiaries.find((entry) => entry.id === transfer.beneficiaryId)
  const toAccount = accounts.find((entry) => entry.id === transfer.toAccountId)
  const recipient = transfer.mode === 'ibft' ? beneficiary?.name : toAccount?.nickname
  // Generated once per visit so the reference stays stable while on screen.
  const reference = useMemo(() => `ZNB${Math.floor(100_000_000 + Math.random() * 899_999_999)}`, [])
  useEffect(() => {
    if (amount <= 0) router.replace(ROUTES.transfer)
  }, [amount, router])
  if (amount <= 0) return null
  const startAnother = () => {
    resetTransfer()
    router.push(ROUTES.transfer)
  }
  const goHome = () => {
    resetTransfer()
    router.push(ROUTES.dashboard)
  }
  return (
    <div className="flex flex-col gap-4 pt-4 lg:mx-auto lg:w-full lg:max-w-2xl">
      <FlowSuccessState
        title="Transfer sent"
        message={
          <>
            Your {formatCurrency(amount)} transfer to{' '}
            <strong className="text-ink">{recipient ?? 'the recipient'}</strong> is on its way.
          </>
        }
        reference={reference}
        details={
          <ReviewList
            items={[
              {
                label: 'From',
                value: `${fromAccount?.nickname ?? '—'} ${fromAccount?.maskedNumber ?? ''}`,
                agentId: 'sendmoney-success-from',
              },
              {
                label: 'Amount',
                value: formatCurrency(amount),
                agentId: 'sendmoney-success-amount',
                emphasis: true,
              },
              {
                label: 'Status',
                value: 'Completed',
                agentId: 'sendmoney-success-status',
              },
            ]}
          />
        }
        actions={
          <>
            <Button
              variant="secondary"
              fullWidth
              onClick={startAnother}
              {...agentProps('sendmoney-success-another')}
            >
              Send another
            </Button>
            <Button fullWidth onClick={goHome} {...agentProps('sendmoney-success-home')}>
              <Home size={16} aria-hidden />
              Back to home
            </Button>
          </>
        }
      />
    </div>
  )
}
