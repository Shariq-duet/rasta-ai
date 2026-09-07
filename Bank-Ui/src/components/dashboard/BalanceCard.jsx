'use client'

import { ArrowUpRight, Eye, EyeOff } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { formatCurrency, formatPercent } from '@/lib/format'
import { useBankStore, useSelectedAccount } from '@/hooks/use-bank-store'
import { AccountSwitcher } from './AccountSwitcher'

export function BalanceCard() {
  const account = useSelectedAccount()
  const showBalance = useBankStore((state) => state.showBalance)
  const toggleBalance = useBankStore((state) => state.toggleBalance)
  return (
    <section
      aria-label="Account balance"
      className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-5 text-white shadow-brand"
      {...agentProps('home-balance-card')}
    >
      <span
        aria-hidden
        className="absolute -right-20 -top-24 h-56 w-56 rounded-full border border-white/10"
      />
      <span
        aria-hidden
        className="absolute -bottom-24 -left-16 h-48 w-48 rounded-full border border-accent-300/15"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
        style={{ maskImage: 'linear-gradient(125deg, black 40%, transparent 70%)' }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <AccountSwitcher />
        <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-2xs font-semibold text-accent-200">
          <ArrowUpRight size={12} aria-hidden />
          {formatPercent(account.changePercent)}
        </span>
      </div>

      <div className="relative mt-5">
        <p className="flex items-center gap-2 text-2xs font-bold uppercase tracking-eyebrow text-white/60">
          Available balance
          <button
            type="button"
            onClick={toggleBalance}
            aria-label={showBalance ? 'Hide balance' : 'Show balance'}
            aria-pressed={!showBalance}
            className="text-white/70 transition-colors hover:text-accent-200"
            {...agentProps('home-balance-toggle')}
          >
            {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </p>
        <p
          className="type-display mt-2 text-white"
          {...agentProps('home-balance-amount')}
        >
          {showBalance ? formatCurrency(account.availableBalance) : '•••••••••'}
        </p>
      </div>

      <div className="relative mt-5 flex items-end justify-between gap-3">
        <div className="min-w-0 text-[0.6875rem] leading-relaxed text-white/65">
          <p className="truncate">{account.productName}</p>
          <p className="font-bold tracking-[0.14em] text-white">{account.maskedNumber}</p>
        </div>
        <p className="shrink-0 text-right text-[0.6875rem] text-white/65">
          Total
          <span className="type-amount-lg block text-[0.9375rem] text-white">
            {showBalance ? formatCurrency(account.balance) : '••••••'}
          </span>
        </p>
      </div>
    </section>
  )
}
