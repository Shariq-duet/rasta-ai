'use client'

import { usePathname } from 'next/navigation'
import { BANK_NAME, SCREEN_TITLES } from '@/lib/constants'

/**
 * The single `h1` for every authenticated screen. It is visually hidden because
 * the TopBar and PageHeader already carry the title visually — this exists so
 * each route has exactly one top-level heading for screen readers.
 */
export function ScreenTitle() {
  const pathname = usePathname()
  const title = SCREEN_TITLES[pathname] ?? (pathname.startsWith('/cards/') ? 'Card details' : BANK_NAME)
  return <h1 className="sr-only">{title}</h1>
}
