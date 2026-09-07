'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, CalendarClock, Receipt } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { ROUTES } from '@/lib/constants'
import { formatCurrency, parseAmount, sanitiseAmount } from '@/lib/format'
import { billers } from '@/lib/mock-data'
import { useAccounts, useBankStore } from '@/hooks/use-bank-store'
import { Badge, Button, Card, Input, Select, ToggleRow } from '@/components/ui'

export function BillPaymentForm() {
  const router = useRouter()
  const accounts = useAccounts()
  const bill = useBankStore((state) => state.bill)
  const setBill = useBankStore((state) => state.setBill)
  const biller = billers.find((entry) => entry.id === bill.billerId)
  const fromAccount = accounts.find((entry) => entry.id === bill.fromAccountId) ?? accounts[0]
  const amount = parseAmount(bill.amount)
  const overBalance = amount > fromAccount.availableBalance
  const canContinue = Boolean(biller) && amount > 0 && !overBalance
  if (!biller) return null
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow mb-1">Payment details</p>
          <h2 className="heading-md truncate">{biller.name}</h2>
          <p className="mt-1 type-secondary">Consumer no. {biller.consumerNumber}</p>
        </div>
        <Badge tone="accent" icon={<Receipt size={12} aria-hidden />}>
          {biller.category}
        </Badge>
      </div>

      <form
        className="mt-4 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (canContinue) router.push(ROUTES.billsConfirm)
        }}
      >
        <Select
          label="Pay from"
          value={bill.fromAccountId}
          onChange={(event) => setBill({ fromAccountId: event.target.value })}
          options={accounts.map((account) => ({
            value: account.id,
            label: `${account.nickname} ${account.maskedNumber}`,
          }))}
          hint={`${formatCurrency(fromAccount.availableBalance)} available`}
          {...agentProps('paybill-from-input')}
        />

        <Input
          label="Amount"
          inputMode="decimal"
          value={bill.amount}
          leading="PKR"
          placeholder="0.00"
          error={overBalance ? 'More than the available balance' : undefined}
          hint={`Billed amount ${formatCurrency(biller.amountDue)}`}
          onChange={(event) => setBill({ amount: sanitiseAmount(event.target.value) })}
          {...agentProps('paybill-amount-input')}
        />

        <div className="rounded-xl border border-line px-3">
          <ToggleRow
            title="Standing instruction"
            description="Pay this bill automatically each month"
            icon={<CalendarClock size={17} />}
            checked={bill.standingInstruction}
            onChange={(checked) =>
              setBill({ standingInstruction: checked, scheduledFor: checked ? bill.scheduledFor : '' })
            }
            {...agentProps('paybill-standing-instruction-toggle')}
          />
          {bill.standingInstruction ? (
            <div className="border-t border-line py-3">
              <Input
                label="First payment date"
                type="date"
                value={bill.scheduledFor}
                onChange={(event) => setBill({ scheduledFor: event.target.value })}
                hint="Later payments repeat on this day every month"
                {...agentProps('paybill-schedule-date')}
              />
            </div>
          ) : null}
        </div>

        <Button type="submit" size="lg" fullWidth disabled={!canContinue} {...agentProps('paybill-submit')}>
          Review payment
          <ArrowRight size={17} aria-hidden />
        </Button>
      </form>
    </Card>
  )
}
