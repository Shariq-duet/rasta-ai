'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import { agentProps } from '@/lib/agent'
import { NAV_ITEMS } from '@/lib/constants'
import { isRouteActive } from '@/lib/nav'

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-30 mt-auto border-t border-line bg-surface/97 pb-safe backdrop-blur md:rounded-b-[1.75rem] lg:hidden"
    >
      <ul className="flex h-[var(--bottomnav-height)] w-full items-stretch">
        {NAV_ITEMS.map((item) => {
          const active = isRouteActive(pathname, item)
          const Icon = item.icon
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex h-full flex-col items-center justify-center gap-1 transition-colors duration-200',
                  active ? 'text-brand-600' : 'text-ink-faint hover:text-ink-muted',
                )}
                {...agentProps(item.agentId)}
              >
                {active ? (
                  <span aria-hidden className="absolute top-0 h-[3px] w-7 rounded-b bg-brand-600" />
                ) : null}
                <Icon size={19} strokeWidth={active ? 2.4 : 2} />
                <span className="text-[0.625rem] font-semibold">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
