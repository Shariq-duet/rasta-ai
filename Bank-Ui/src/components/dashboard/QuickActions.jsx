import Link from 'next/link'
import { agentProps } from '@/lib/agent'
import { QUICK_ACTIONS } from '@/lib/constants'

export function QuickActions() {
  return (
    <nav aria-label="Quick actions">
      <ul className="grid grid-cols-4 gap-2 lg:gap-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <li key={action.href}>
              <Link
                href={action.href}
                className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-1 py-3 text-center shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift lg:flex-row lg:gap-3 lg:px-4 lg:py-5 lg:text-left"
                {...agentProps(action.agentId)}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 lg:h-11 lg:w-11">
                  <Icon size={17} aria-hidden />
                </span>
                <span className="text-[0.625rem] font-semibold text-ink lg:text-sm">{action.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
