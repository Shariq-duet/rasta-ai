import { CreditCard, Droplets, Flame, GraduationCap, Smartphone, Wifi, Zap } from 'lucide-react'
import { cn } from '@/lib/cn'
import { agentProps } from '@/lib/agent'
import { formatCurrency, formatDate } from '@/lib/format'
const CATEGORY_ICON = {
  Electricity: Zap,
  Gas: Flame,
  Internet: Wifi,
  Mobile: Smartphone,
  Water: Droplets,
  Education: GraduationCap,
  'Credit Card': CreditCard,
}
const TONES = {
  brand: 'bg-brand-50 text-brand-600',
  accent: 'bg-accent-100 text-accent-600',
  positive: 'bg-positive-50 text-positive-500',
  sky: 'bg-[#e0ecf9] text-[#3d6bb5]',
}

export function BillerCard({ biller, selected, onSelect }) {
  const Icon = CATEGORY_ICON[biller.category]
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors duration-200',
        selected ? 'border-brand-300 bg-brand-50' : 'border-line bg-surface hover:bg-canvas',
      )}
      {...agentProps(`paybill-biller-${biller.id}`)}
    >
      <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', TONES[biller.tone])}>
        <Icon size={18} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate type-row-title">{biller.name}</span>
        <span className="mt-0.5 block truncate type-secondary">
          {biller.category} • Due {formatDate(biller.dueDate)}
        </span>
      </span>
      <span className="type-amount shrink-0 text-right">
        {formatCurrency(biller.amountDue)}
      </span>
    </button>
  )
}
