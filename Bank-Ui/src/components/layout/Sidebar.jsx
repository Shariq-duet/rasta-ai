'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronsLeft, LogOut } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { agentProps } from '@/lib/agent'
import { ROUTES, SIDEBAR_GROUPS } from '@/lib/constants'
import { isRouteActive } from '@/lib/nav'
import { CUSTOMER } from '@/lib/mock-data'
import { useAuth } from '@/hooks/use-auth'
import { useUnreadNotificationCount } from '@/hooks/use-bank-store'
import { Avatar } from '@/components/ui'
import { BrandMark } from '@/components/common/BrandMark'

/**
 * Persistent desktop navigation, shown from `lg` up in place of the bottom tab
 * bar. Collapses to an icon rail so the content column can reclaim the width.
 */
export function Sidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const unread = useUnreadNotificationCount()
  const [collapsed, setCollapsed] = useState(false)
  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        'sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200 lg:flex',
        collapsed ? 'w-[76px]' : 'w-[var(--sidebar-width)]',
      )}
      {...agentProps('sidebar')}
    >
      <div
        className={cn(
          'flex h-[72px] shrink-0 items-center gap-2 border-b border-line',
          collapsed ? 'justify-center px-3' : 'px-5',
        )}
      >
        <Link href={ROUTES.dashboard} className="min-w-0" {...agentProps('sidebar-brand')}>
          <BrandMark size="sm" showName={!collapsed} />
        </Link>
        {!collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse navigation"
            className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-canvas hover:text-ink"
            {...agentProps('sidebar-collapse')}
          >
            <ChevronsLeft size={16} />
          </button>
        ) : null}
      </div>

      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Expand navigation"
          className="mx-3 mt-3 grid h-9 place-items-center rounded-xl text-ink-faint transition-colors hover:bg-canvas hover:text-ink"
          {...agentProps('sidebar-expand')}
        >
          <ChevronsLeft size={16} className="rotate-180" />
        </button>
      ) : null}

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.label} className="mb-5 last:mb-0">
            {collapsed ? (
              <span className="sr-only">{group.label}</span>
            ) : (
              <p className="eyebrow mb-2 px-2">{group.label}</p>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isRouteActive(pathname, item)
                const Icon = item.icon
                const showBadge = item.href === ROUTES.notifications && unread > 0
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.8125rem] font-semibold transition-colors duration-200',
                        collapsed && 'justify-center px-0',
                        active
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-ink-muted hover:bg-canvas hover:text-ink',
                      )}
                      {...agentProps(item.agentId)}
                    >
                      {active ? (
                        <span aria-hidden className="absolute left-0 h-5 w-[3px] rounded-r bg-brand-600" />
                      ) : null}
                      <span className="relative shrink-0">
                        <Icon size={18} strokeWidth={active ? 2.4 : 2} aria-hidden />
                        {showBadge ? (
                          <span
                            aria-hidden
                            className="absolute -right-1 -top-1 h-2 w-2 rounded-full border border-white bg-danger-500"
                          />
                        ) : null}
                      </span>
                      {collapsed ? (
                        <span className="sr-only">{item.label}</span>
                      ) : (
                        <span className="truncate">{item.label}</span>
                      )}
                      {showBadge && !collapsed ? (
                        <span className="ml-auto rounded-full bg-danger-500 px-1.5 text-[0.5625rem] font-bold text-white">
                          {unread}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={cn('shrink-0 border-t border-line p-3', collapsed && 'px-2')}>
        <Link
          href={ROUTES.profile}
          className={cn(
            'flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-canvas',
            collapsed && 'justify-center',
          )}
          {...agentProps('sidebar-account')}
        >
          <Avatar initials={CUSTOMER.initials} tone="peach" size="md" />
          {!collapsed ? (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.8125rem] font-bold text-ink">{CUSTOMER.name}</span>
              <span className="mt-0.5 block truncate type-caption">{CUSTOMER.tier}</span>
            </span>
          ) : null}
        </Link>
        <button
          type="button"
          onClick={signOut}
          className={cn(
            'mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 type-row-title-muted transition-colors hover:bg-danger-50 hover:text-danger-600',
            collapsed && 'justify-center px-0',
          )}
          title={collapsed ? 'Log out' : undefined}
          {...agentProps('sidebar-logout')}
        >
          <LogOut size={18} aria-hidden className="shrink-0" />
          {collapsed ? <span className="sr-only">Log out</span> : 'Log out'}
        </button>
      </div>
    </aside>
  )
}
