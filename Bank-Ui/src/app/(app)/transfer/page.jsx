'use client'

import Link from 'next/link'
import { ChevronRight, Receipt, Users } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { ROUTES } from '@/lib/constants'
import { Card } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { TransferForm } from '@/components/transfer/TransferForm'
import { TransferSummaryAside } from '@/components/transfer/TransferSummaryAside'
const SHORTCUTS = [
  {
    href: ROUTES.bills,
    label: 'Paying a bill instead?',
    description: 'Utilities, internet and mobile billers',
    icon: Receipt,
    agentId: 'sendmoney-go-paybill',
  },
  {
    href: ROUTES.beneficiaries,
    label: 'Manage beneficiaries',
    description: 'Add, remove and review transfer limits',
    icon: Users,
    agentId: 'sendmoney-go-beneficiaries',
  },
]

export default function TransferPage() {
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <PageHeader eyebrow="Move money" title="Send money" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
        <div className="flex flex-col gap-4 lg:gap-6">
          <TransferForm />

          <Card padded={false} className="px-3">
            <ul className="divide-y divide-line">
              {SHORTCUTS.map((shortcut) => {
                const Icon = shortcut.icon
                return (
                  <li key={shortcut.href}>
                    <Link
                      href={shortcut.href}
                      className="flex items-center gap-3 rounded-xl px-1 py-3.5 transition-colors hover:bg-canvas"
                      {...agentProps(shortcut.agentId)}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                        <Icon size={17} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate type-row-title">
                          {shortcut.label}
                        </span>
                        <span className="mt-0.5 block truncate type-secondary">
                          {shortcut.description}
                        </span>
                      </span>
                      <ChevronRight size={16} aria-hidden className="shrink-0 text-ink-faint" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Card>
        </div>

        <TransferSummaryAside />
      </div>
    </div>
  )
}
