'use client'

import { useState } from 'react'
import { Check, Plus, Users } from 'lucide-react'
import Link from 'next/link'
import { agentProps } from '@/lib/agent'
import { ROUTES } from '@/lib/constants'
import { formatCurrency } from '@/lib/format'
import { useBankStore } from '@/hooks/use-bank-store'
import { Avatar, EmptyState, FieldShell, Sheet } from '@/components/ui'

/** Field-shaped trigger that opens a sheet of saved payees. */
export function BeneficiaryPicker({ value, onChange }) {
  const beneficiaries = useBankStore((state) => state.beneficiaries)
  const [open, setOpen] = useState(false)
  const selected = beneficiaries.find((entry) => entry.id === value) ?? null
  return (
    <>
      <FieldShell
        label="Send to"
        htmlFor="beneficiary-picker"
        hint={selected ? `Transfer limit ${formatCurrency(selected.transferLimit)}` : undefined}
      >
        <button
          id="beneficiary-picker"
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="flex h-14 w-full items-center gap-3 rounded-xl border border-line bg-surface px-3 text-left transition-colors hover:border-brand-200"
          {...agentProps('sendmoney-recipient-select')}
        >
          {selected ? (
            <>
              <Avatar initials={selected.initials} tone={selected.tone} size="md" />
              <span className="min-w-0 flex-1">
                <span className="block truncate type-row-title">
                  {selected.name}
                </span>
                <span className="mt-0.5 block truncate type-secondary">
                  {selected.bank} • {selected.maskedNumber}
                </span>
              </span>
            </>
          ) : (
            <>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-dashed border-line text-ink-faint">
                <Users size={17} aria-hidden />
              </span>
              <span className="flex-1 text-[0.8125rem] text-ink-faint">Choose a beneficiary</span>
            </>
          )}
          <span className="shrink-0 text-[0.6875rem] font-bold text-brand-600">Change</span>
        </button>
      </FieldShell>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Choose a beneficiary"
        agentId="beneficiary-sheet"
      >
        {beneficiaries.length === 0 ? (
          <EmptyState
            icon={<Users size={20} />}
            title="No beneficiaries saved"
            description="Add a payee to send money to them in a couple of taps."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {beneficiaries.map((beneficiary) => (
              <li key={beneficiary.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(beneficiary.id)
                    setOpen(false)
                  }}
                  aria-pressed={beneficiary.id === value}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                    beneficiary.id === value
                      ? 'border-brand-300 bg-brand-50'
                      : 'border-line bg-surface hover:bg-canvas'
                  }`}
                  {...agentProps(`beneficiary-option-${beneficiary.id}`)}
                >
                  <Avatar initials={beneficiary.initials} tone={beneficiary.tone} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate type-row-title">
                      {beneficiary.name}
                    </span>
                    <span className="mt-0.5 block truncate type-secondary">
                      {beneficiary.bank} • {beneficiary.maskedNumber}
                    </span>
                    <span className="mt-0.5 block type-caption">
                      Limit {formatCurrency(beneficiary.transferLimit)}
                    </span>
                  </span>
                  {beneficiary.id === value ? (
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                      <Check size={13} aria-hidden />
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}

        <Link
          href={ROUTES.beneficiaryNew}
          className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-brand-300 py-3 text-xs font-bold text-brand-600 transition-colors hover:bg-brand-50"
          {...agentProps('beneficiary-sheet-add')}
        >
          <Plus size={16} aria-hidden />
          Add a new beneficiary
        </Link>
      </Sheet>
    </>
  )
}
