'use client'

import { useMemo, useState } from 'react'
import { Download, Mail, Share2 } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { formatCurrency } from '@/lib/format'
import { CUSTOMER, TODAY, transactions } from '@/lib/mock-data'
import { useSelectedAccount } from '@/hooks/use-bank-store'
import { useToast } from '@/hooks/use-toast'
import { Button, Card, Modal, Select, Toast } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { TransactionList } from '@/components/dashboard/TransactionList'
import { StatementFilters } from '@/components/statements/StatementFilters'
const DEFAULT_FILTERS = {
  type: 'all',
  range: '30',
  from: '',
  to: '',
  category: 'all',
}

export default function StatementsPage() {
  const account = useSelectedAccount()
  const { toast, showToast, dismissToast } = useToast()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState('pdf')
  const rows = useMemo(() => {
    const accountRows = transactions.filter((transaction) => transaction.accountId === account.id)
    const withinRange = accountRows.filter((transaction) => {
      const date = new Date(transaction.date)
      if (filters.range === 'custom') {
        if (filters.from && date < new Date(filters.from)) return false
        if (filters.to && date > new Date(`${filters.to}T23:59:59`)) return false
        return true
      }
      const days = Number(filters.range)
      const cutoff = new Date(TODAY)
      cutoff.setDate(cutoff.getDate() - days)
      return date >= cutoff
    })
    return withinRange
      .filter((transaction) => (filters.type === 'all' ? true : transaction.direction === filters.type))
      .filter((transaction) =>
        filters.category === 'all' ? true : transaction.category === filters.category,
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [account.id, filters])
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          transactions.filter((entry) => entry.accountId === account.id).map((entry) => entry.category),
        ),
      ).sort(),
    [account.id],
  )
  const totals = rows.reduce(
    (acc, transaction) => {
      if (transaction.direction === 'credit') acc.credit += transaction.amount
      else acc.debit += transaction.amount
      return acc
    },
    { credit: 0, debit: 0 },
  )
  const onExport = (channel) => {
    setExportOpen(false)
    showToast(
      channel === 'email'
        ? `Statement emailed to ${CUSTOMER.email}`
        : `Statement prepared as ${exportFormat.toUpperCase()} — check your downloads`,
    )
  }
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow={account.nickname}
        subtitle={`${account.productName} ${account.maskedNumber}`}
        action={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setExportOpen(true)}
            {...agentProps('statements-export')}
          >
            <Share2 size={15} aria-hidden />
            Export
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start lg:gap-6">
        <div className="flex flex-col gap-4 lg:sticky lg:top-[104px]">
          <Card>
            <StatementFilters
              value={filters}
              onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
              categories={categories}
            />
          </Card>

          <Card
            className="flex items-center justify-between gap-3 py-3.5"
            {...agentProps('statements-totals')}
          >
            <div>
              <p className="text-[0.625rem] font-semibold uppercase tracking-wide text-ink-faint">Money in</p>
              <p className="type-amount-lg mt-1 text-positive-500">
                {formatCurrency(totals.credit)}
              </p>
            </div>
            <span aria-hidden className="h-8 w-px bg-line" />
            <div>
              <p className="text-[0.625rem] font-semibold uppercase tracking-wide text-ink-faint">
                Money out
              </p>
              <p className="type-amount-lg mt-1">
                {formatCurrency(totals.debit)}
              </p>
            </div>
            <span aria-hidden className="h-8 w-px bg-line" />
            <div>
              <p className="text-[0.625rem] font-semibold uppercase tracking-wide text-ink-faint">Entries</p>
              <p className="type-amount-lg mt-1">{rows.length}</p>
            </div>
          </Card>
        </div>

        <Card padded={false} className="px-2 py-1">
          <h2 className="sr-only">Transactions</h2>
          <TransactionList
            transactions={rows}
            agentIdPrefix="statement-transaction"
            emptyTitle="No activity in this period"
            emptyDescription="Widen the date range or clear the category filter to see more."
          />
        </Card>
      </div>

      <Modal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Export statement"
        description={`${rows.length} entries for ${account.nickname}`}
        agentId="statements-export-modal"
        footer={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => onExport('email')}
              {...agentProps('statements-export-email')}
            >
              <Mail size={15} aria-hidden />
              Email
            </Button>
            <Button
              fullWidth
              onClick={() => onExport('download')}
              {...agentProps('statements-export-download')}
            >
              <Download size={15} aria-hidden />
              Download
            </Button>
          </div>
        }
      >
        <Select
          label="Format"
          value={exportFormat}
          onChange={(event) => setExportFormat(event.target.value)}
          options={[
            { value: 'pdf', label: 'PDF document' },
            { value: 'csv', label: 'CSV spreadsheet' },
            { value: 'ofx', label: 'OFX (accounting software)' },
          ]}
          hint="Nothing is generated in this demo — the action shows a confirmation only."
          {...agentProps('statements-export-format')}
        />
      </Modal>

      <Toast toast={toast} onDismiss={dismissToast} agentId="statements-toast" />
    </div>
  )
}
