'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CalendarClock, ShieldCheck } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { ROUTES } from '@/lib/constants'
import { formatCurrency, formatDate, parseAmount } from '@/lib/format'
import { billers } from '@/lib/mock-data'
import { useAccounts, useBankStore } from '@/hooks/use-bank-store'
import { Badge, Button, Card } from '@/components/ui'
import { ReviewList } from '@/components/transfer/ReviewList'

export default function BillConfirmPage() {
  const router = useRouter()
  const accounts = useAccounts()
  const bill = useBankStore((state) => state.bill)
  const biller = billers.find((entry) => entry.id === bill.billerId)
  const fromAccount = accounts.find((entry) => entry.id === bill.fromAccountId)
  const amount = parseAmount(bill.amount)
  useEffect(() => {
    if (!biller || amount <= 0) router.replace(ROUTES.bills)
  }, [biller, amount, router])
  if (!biller || amount <= 0 || !fromAccount) return null
  const items = [
    { label: 'Biller', value: biller.name, agentId: 'paybill-confirm-biller' },
    { label: 'Category', value: biller.category, agentId: 'paybill-confirm-category' },
    { label: 'Consumer no.', value: biller.consumerNumber, agentId: 'paybill-confirm-consumer' },
    {
      label: 'Pay from',
      value: `${fromAccount.nickname} ${fromAccount.maskedNumber}`,
      agentId: 'paybill-confirm-from',
    },
    { label: 'Amount', value: formatCurrency(amount), agentId: 'paybill-confirm-amount', emphasis: true },
    { label: 'Due date', value: formatDate(biller.dueDate), agentId: 'paybill-confirm-due' },
  ]
  return (
    <div className="flex flex-col gap-4 lg:mx-auto lg:w-full lg:max-w-2xl">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="heading-sm">Payment summary</h2>
          <Badge tone="positive" icon={<ShieldCheck size={12} aria-hidden />}>
            Secure
          </Badge>
        </div>

        {bill.standingInstruction ? (
          <div
            className="mt-3 flex items-center gap-2.5 rounded-xl bg-accent-50 px-3 py-2.5"
            {...agentProps('paybill-confirm-standing-instruction')}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent-300 text-brand-900">
              <CalendarClock size={14} aria-hidden />
            </span>
            <p className="text-[0.6875rem] font-semibold text-accent-600">
              Standing instruction
              <span className="block font-normal text-accent-600/80">
                {bill.scheduledFor
                  ? `Repeats monthly from ${formatDate(bill.scheduledFor)}.`
                  : 'Repeats monthly on this date.'}
              </span>
            </p>
          </div>
        ) : null}

        <ReviewList items={items} className="mt-4" />

        <div className="mt-5 flex gap-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => router.push(ROUTES.bills)}
            {...agentProps('paybill-confirm-back')}
          >
            <ArrowLeft size={16} aria-hidden />
            Edit
          </Button>
          <Button
            fullWidth
            onClick={() => router.push(ROUTES.billsSuccess)}
            {...agentProps('paybill-confirm-approve')}
          >
            Confirm &amp; pay
          </Button>
        </div>
      </Card>
    </div>
  )
}
