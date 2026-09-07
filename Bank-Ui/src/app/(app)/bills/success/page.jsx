'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Home } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { ROUTES } from '@/lib/constants'
import { formatCurrency, parseAmount } from '@/lib/format'
import { billers } from '@/lib/mock-data'
import { useAccounts, useBankStore } from '@/hooks/use-bank-store'
import { Button } from '@/components/ui'
import { FlowSuccessState } from '@/components/transfer/FlowSuccessState'
import { ReviewList } from '@/components/transfer/ReviewList'

export default function BillSuccessPage() {
  const router = useRouter()
  const accounts = useAccounts()
  const bill = useBankStore((state) => state.bill)
  const resetBill = useBankStore((state) => state.resetBill)
  const biller = billers.find((entry) => entry.id === bill.billerId)
  const fromAccount = accounts.find((entry) => entry.id === bill.fromAccountId)
  const amount = parseAmount(bill.amount)
  const standing = bill.standingInstruction
  const reference = useMemo(() => `BIL${Math.floor(100_000_000 + Math.random() * 899_999_999)}`, [])
  useEffect(() => {
    if (!biller || amount <= 0) router.replace(ROUTES.bills)
  }, [biller, amount, router])
  if (!biller || amount <= 0) return null
  const payAnother = () => {
    resetBill()
    router.push(ROUTES.bills)
  }
  const goHome = () => {
    resetBill()
    router.push(ROUTES.dashboard)
  }
  return (
    <div className="flex flex-col gap-4 pt-4 lg:mx-auto lg:w-full lg:max-w-2xl">
      <FlowSuccessState
        title="Bill paid"
        message={
          <>
            Your {formatCurrency(amount)} payment to <strong className="text-ink">{biller.name}</strong> is
            confirmed.
            {standing ? ' Your standing instruction is now active.' : ''}
          </>
        }
        reference={reference}
        details={
          <ReviewList
            items={[
              {
                label: 'Paid from',
                value: `${fromAccount?.nickname ?? '—'} ${fromAccount?.maskedNumber ?? ''}`,
                agentId: 'paybill-success-from',
              },
              {
                label: 'Amount',
                value: formatCurrency(amount),
                agentId: 'paybill-success-amount',
                emphasis: true,
              },
              {
                label: 'Standing instruction',
                value: standing ? 'Active' : 'Not set',
                agentId: 'paybill-success-standing',
              },
            ]}
          />
        }
        actions={
          <>
            <Button
              variant="secondary"
              fullWidth
              onClick={payAnother}
              {...agentProps('paybill-success-another')}
            >
              Pay another bill
            </Button>
            <Button fullWidth onClick={goHome} {...agentProps('paybill-success-home')}>
              <Home size={16} aria-hidden />
              Back to home
            </Button>
          </>
        }
      />
    </div>
  )
}
