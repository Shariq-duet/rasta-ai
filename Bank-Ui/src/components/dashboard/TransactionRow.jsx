import { cn } from '@/lib/cn'
import { agentProps } from '@/lib/agent'
import { formatCurrency, formatRelativeDateTime } from '@/lib/format'
import { TODAY } from '@/lib/mock-data'
const TONES = {
  green: 'bg-positive-50 text-positive-500',
  brand: 'bg-brand-50 text-brand-600',
  cyan: 'bg-accent-100 text-accent-600',
  violet: 'bg-[#eee7fb] text-[#7c63b8]',
  sky: 'bg-[#e0ecf9] text-[#3d6bb5]',
}

export function TransactionRow({ transaction, agentIdPrefix = 'transaction' }) {
  const isCredit = transaction.direction === 'credit'
  return (
    <li
      className="flex items-center gap-2.5 rounded-xl px-2 py-3 transition-colors duration-200 hover:bg-canvas sm:gap-3"
      {...agentProps(`${agentIdPrefix}-${transaction.id}`)}
    >
      <span
        aria-hidden
        className={cn(
          'grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold',
          TONES[transaction.tone],
        )}
      >
        {transaction.initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate type-row-title">{transaction.merchant}</p>
        <p className="mt-0.5 truncate type-secondary">
          {transaction.category} • {formatRelativeDateTime(transaction.date, TODAY)}
        </p>
      </div>
      {/* Amounts step down a size on the narrowest viewport so the merchant
          name keeps enough room to render without an ellipsis. */}
      <p
        className={cn(
          'type-amount shrink-0 whitespace-nowrap text-right text-[0.75rem] sm:text-[0.8125rem]',
          isCredit ? 'text-positive-500' : 'text-ink',
        )}
      >
        {isCredit ? '+' : '−'} {formatCurrency(transaction.amount)}
      </p>
    </li>
  )
}
