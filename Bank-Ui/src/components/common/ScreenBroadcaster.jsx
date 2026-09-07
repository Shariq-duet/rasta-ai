'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { broadcastScreen, screenIdForPath } from '@/lib/agent'

/**
 * Carries the prototype's agent hook forward. Every route change — login and
 * logout included — sets `window.__AGENT_SCREEN__` and dispatches
 * `AGENT_SCREEN_CHANGE`, exactly once per transition. Also stamps the active
 * screen id onto <body data-agent-screen>, mirroring the old shell attribute.
 */
export function ScreenBroadcaster() {
  const pathname = usePathname()
  useEffect(() => {
    const screen = screenIdForPath(pathname)
    broadcastScreen(screen)
    document.body.dataset.agentScreen = screen
  }, [pathname])
  return null
}
