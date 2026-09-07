'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft, Bell } from 'lucide-react'
import { cn } from '@/lib/cn'
import { agentProps } from '@/lib/agent'
import { BANK_NAME, ROUTES, SCREEN_TITLES } from '@/lib/constants'
import { CUSTOMER } from '@/lib/mock-data'
import { useUnreadNotificationCount } from '@/hooks/use-bank-store'
import { Avatar } from '@/components/ui'
import { BrandMark } from '@/components/common/BrandMark'

/** Routes that are the root of a tab — these show the brand, not a back arrow. */
const ROOT_ROUTES = [ROUTES.dashboard, ROUTES.cards, ROUTES.analytics, ROUTES.qrPay, ROUTES.transfer]

export function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const unread = useUnreadNotificationCount()
  const isRoot = ROOT_ROUTES.includes(pathname)
  // Dynamic segments have no static entry in SCREEN_TITLES.
  const title = SCREEN_TITLES[pathname] ?? (pathname.startsWith('/cards/') ? 'Card details' : undefined)
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 pt-safe backdrop-blur md:rounded-t-[1.75rem] lg:rounded-none">
      <div className="mx-auto flex h-[var(--topbar-height)] w-full max-w-[var(--app-width)] items-center gap-3 px-4 lg:h-[72px] lg:max-w-[var(--content-width)] lg:px-8">
        {isRoot ? (
          // The sidebar owns the brand from lg up, so this is phone chrome only.
          <Link href={ROUTES.dashboard} className="min-w-0 lg:hidden" {...agentProps('nav-brand')}>
            <BrandMark size="sm" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="-ml-1.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink transition-colors hover:bg-canvas"
            {...agentProps('nav-back')}
          >
            <ArrowLeft size={19} />
          </button>
        )}

        <p
          className={cn(
            'min-w-0 flex-1 truncate font-display text-[0.9375rem] font-bold tracking-tight text-ink lg:text-lg',
            isRoot && 'hidden lg:block',
          )}
        >
          {title ?? BANK_NAME}
        </p>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Link
            href={ROUTES.notifications}
            aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
            className="relative grid h-9 w-9 place-items-center rounded-xl text-ink-muted transition-colors hover:bg-canvas hover:text-brand-600"
            {...agentProps('nav-notifications')}
          >
            <Bell size={19} />
            {unread > 0 ? (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full border-2 border-white bg-danger-500 px-1 text-[0.5625rem] font-bold text-white">
                {unread}
              </span>
            ) : null}
          </Link>
          {/* The sidebar footer carries the account link from lg up. */}
          <Link
            href={ROUTES.profile}
            aria-label="Profile and settings"
            className="rounded-full transition-transform hover:scale-105 lg:hidden"
            {...agentProps('nav-profile')}
          >
            <Avatar initials={CUSTOMER.initials} tone="peach" size="sm" />
          </Link>
        </div>
      </div>
    </header>
  )
}
