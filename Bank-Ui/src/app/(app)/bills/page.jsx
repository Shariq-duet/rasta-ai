'use client'

import { billers } from '@/lib/mock-data'
import { useBankStore } from '@/hooks/use-bank-store'
import { Card } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { BillerList } from '@/components/bills/BillerList'
import { BillPaymentForm } from '@/components/bills/BillPaymentForm'

export default function BillsPage() {
  const bill = useBankStore((state) => state.bill)
  const setBill = useBankStore((state) => state.setBill)
  const onSelect = (billerId) => {
    const biller = billers.find((entry) => entry.id === billerId)
    setBill({ billerId, amount: biller ? String(biller.amountDue) : '' })
  }
  return (
    <div className="flex flex-col gap-4">
      <PageHeader eyebrow="Step 1 of 2" subtitle="Pick a biller, then confirm the amount." />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
        <Card>
          <h2 className="sr-only">Choose a biller</h2>
          <BillerList selectedId={bill.billerId} onSelect={onSelect} />
        </Card>

        <BillPaymentForm />
      </div>
    </div>
  )
}
