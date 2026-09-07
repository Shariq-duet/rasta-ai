import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { agentProps } from '@/lib/agent'

function RowInner({ leading, title, subtitle, trailing, chevron }) {
  return (
    <>
      {leading}
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate type-row-title">{title}</span>
        {subtitle ? (
          <span className="mt-0.5 block truncate type-secondary">{subtitle}</span>
        ) : null}
      </span>
      {trailing}
      {chevron ? <ChevronRight size={16} aria-hidden className="shrink-0 text-ink-faint" /> : null}
    </>
  )
}
const ROW_BASE =
  'flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors duration-200 hover:bg-canvas'

export function ListRowLink({ href, className, agentId, ...content }) {
  return (
    <Link href={href} className={cn(ROW_BASE, className)} {...(agentId ? agentProps(agentId) : {})}>
      <RowInner {...content} />
    </Link>
  )
}

export function ListRowButton({ onClick, selected, disabled, className, agentId, ...content }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        ROW_BASE,
        'border',
        selected ? 'border-brand-300 bg-brand-50 hover:bg-brand-50' : 'border-transparent',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      {...(agentId ? agentProps(agentId) : {})}
    >
      <RowInner {...content} />
    </button>
  )
}

export function ListRowStatic({ className, agentId, ...content }) {
  return (
    <div
      className={cn('flex items-center gap-3 px-2 py-3', className)}
      {...(agentId ? agentProps(agentId) : {})}
    >
      <RowInner {...content} />
    </div>
  )
}
