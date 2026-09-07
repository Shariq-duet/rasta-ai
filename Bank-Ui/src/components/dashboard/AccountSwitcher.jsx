'use client'

import { useState } from 'react'
import { Check, ChevronDown, Landmark, PiggyBank, Wallet } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { formatCurrency, formatIban } from '@/lib/format'
import { useAccounts, useBankStore, useSelectedAccount } from '@/hooks/use-bank-store'
import { Sheet } from '@/components/ui'
const KIND_ICON = {
  current: Wallet,
  savings: PiggyBank,
  deposit: Landmark,
}
const KIND_LABEL = {
  current: 'Current',
  savings: 'Savings',
  deposit: 'Deposit',
}

/** Compact trigger on the balance card; opens a bottom sheet of linked accounts. */
export function AccountSwitcher() {
  const accounts = useAccounts()
  const selected = useSelectedAccount()
  const selectAccount = useBankStore((state) => state.selectAccount)
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full bg-white/15 py-1 pl-2.5 pr-2 text-2xs font-semibold text-white transition-colors hover:bg-white/25"
        {...agentProps('home-account-switcher')}
      >
        {selected.nickname}
        <ChevronDown size={13} aria-hidden />
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Your accounts"
        agentId="account-switcher-sheet"
      >
        <ul className="flex flex-col gap-2">
          {accounts.map((account) => (
            <li key={account.id}>
              <AccountOption
                account={account}
                selected={account.id === selected.id}
                onSelect={() => {
                  selectAccount(account.id)
                  setOpen(false)
                }}
              />
            </li>
          ))}
        </ul>
      </Sheet>
    </>
  )
}

function AccountOption({ account, selected, onSelect }) {
  const Icon = KIND_ICON[account.kind]
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${selected ? 'border-brand-300 bg-brand-50' : 'border-line bg-surface hover:bg-canvas'}`}
      {...agentProps(`account-option-${account.id}`)}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-accent-200">
        <Icon size={18} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[0.8125rem] font-bold text-ink">{account.nickname}</span>
          <span className="shrink-0 rounded-full bg-canvas px-2 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wide text-ink-muted">
            {KIND_LABEL[account.kind]}
          </span>
        </span>
        <span className="mt-0.5 block truncate type-caption">
          {formatIban(account.iban)}
        </span>
        <span className="type-amount mt-1 block">
          {formatCurrency(account.balance)}
        </span>
      </span>
      {selected ? (
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
          <Check size={13} aria-hidden />
        </span>
      ) : null}
    </button>
  )
}
