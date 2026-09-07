import { cn } from '@/lib/cn'
import { agentProps } from '@/lib/agent'

/** The shared confirm-step summary used by transfers, bills and QR payments. */
export function ReviewList({ items, className }) {
  return (
    <dl className={cn('divide-y divide-line border-y border-line', className)}>
      {items.map((item) => (
        <div
          key={item.agentId}
          className="flex items-center justify-between gap-4 py-3"
          {...agentProps(item.agentId)}
        >
          <dt className="shrink-0 type-label">{item.label}</dt>
          <dd
            className={cn(
              'type-amount min-w-0 text-right',
              item.emphasis ? 'text-brand-700' : 'text-ink',
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
