'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { ROUTES } from '@/lib/constants'
import { formatFullDate } from '@/lib/format'
import { CUSTOMER, TODAY } from '@/lib/mock-data'
import { useAccountTransactions, useSelectedAccount } from '@/hooks/use-bank-store'
import { Card } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { BalanceCard } from '@/components/dashboard/BalanceCard'
import { SnapshotCard } from '@/components/dashboard/SnapshotCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { ContactRail } from '@/components/dashboard/ContactRail'
import { TransactionList } from '@/components/dashboard/TransactionList'
import { ServiceGrid } from '@/components/services/ServiceGrid'

export default function DashboardPage() {
  const account = useSelectedAccount()
  const recent = useAccountTransactions(account.id, 6)
  const firstName = CUSTOMER.name.split(' ')[0]
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={formatFullDate(TODAY)}
        title={
          <>
            Good morning, {firstName} <span className="text-accent-500">✦</span>
          </>
        }
      />

      {/*
          Source order is the phone order. Desktop rearranges purely with
          `lg:order-*` inside a three-column grid, so mobile is untouched:
            row 1  balance (2 cols) | snapshot
            row 2  quick actions (3 cols)
            row 3  recent activity (2 cols, 2 rows) | beneficiaries
            row 4                                   | services
        */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        <div className="lg:order-1 lg:col-span-2">
          <BalanceCard />
        </div>

        <div className="lg:order-3 lg:col-span-3">
          <QuickActions />
        </div>

        <div className="lg:order-2">
          <SnapshotCard />
        </div>

        <div className="lg:order-5">
          <ContactRail />
        </div>

        <div className="lg:order-6">
          <ServiceGrid />
        </div>

        <section aria-labelledby="recent-activity-heading" className="lg:order-4 lg:col-span-2 lg:row-span-2">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow mb-1">Activity</p>
              <h2 id="recent-activity-heading" className="heading-md">
                Recent transactions
              </h2>
            </div>
            <Link
              href={ROUTES.statements}
              className="flex items-center gap-1 text-[0.6875rem] font-bold text-brand-600 transition-colors hover:text-brand-700"
              {...agentProps('home-transactions-see-all')}
            >
              See all
              <ChevronRight size={13} aria-hidden />
            </Link>
          </div>
          <Card padded={false} className="px-2 py-1" interactive>
            <TransactionList transactions={recent} agentIdPrefix="home-transaction" />
          </Card>
        </section>
      </div>
    </div>
  )
}
