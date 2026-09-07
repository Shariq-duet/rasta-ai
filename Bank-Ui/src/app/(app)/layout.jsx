'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { initAgentBridge } from '@/lib/agentBridge'
import { ROUTES } from '@/lib/constants'
import { useAuth } from '@/hooks/use-auth'
import { SkeletonScreen } from '@/components/ui'
import { ScreenBroadcaster } from '@/components/common/ScreenBroadcaster'
import { ScreenTitle } from '@/components/common/ScreenTitle'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { AssistantFab } from '@/components/layout/AssistantFab'
import { MicButton } from '@/components/layout/MicButton'
import { LanguagePicker } from '@/components/layout/LanguagePicker'
import { ChatModal } from '@/components/chat/ChatModal'

/**
 * One shell, two compositions — same components, routes and state throughout.
 *
 * Below `lg` it is the phone app: a 440px column with a sticky TopBar and a
 * sticky bottom tab bar, framed on tablet-portrait widths.
 * From `lg` up the frame drops away, a persistent Sidebar takes over navigation
 * from the tab bar, and the content column widens to `--content-width`.
 */
export default function AppLayout({ children }) {
  const router = useRouter()
  const { isAuthenticated, hydrated } = useAuth()
  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace(ROUTES.login)
  }, [hydrated, isAuthenticated, router])
  // Same lifetime as the screen broadcaster: one voice-agent bridge per session.
  useEffect(() => {
    initAgentBridge()
  }, [])
  if (!hydrated || !isAuthenticated) {
    return (
      <div className="mx-auto app-shell-width w-full px-4 py-8">
        <SkeletonScreen />
      </div>
    )
  }
  return (
    <div className="lg:flex lg:min-h-dvh lg:items-start">
      <Sidebar />
      <div
        className={[
          'mx-auto flex min-h-dvh w-full max-w-[var(--app-width)] flex-col bg-canvas',
          'md:my-6 md:min-h-[calc(100dvh-3rem)] md:rounded-[1.75rem] md:shadow-modal md:ring-1 md:ring-line',
          'lg:my-0 lg:min-h-dvh lg:max-w-none lg:flex-1 lg:rounded-none lg:bg-transparent lg:shadow-none lg:ring-0',
        ].join(' ')}
      >
        <ScreenBroadcaster />
        <TopBar />
        <main className="mx-auto w-full flex-1 px-4 pb-10 pt-5 lg:max-w-[var(--content-width)] lg:px-8 lg:pb-16 lg:pt-8">
          <ScreenTitle />
          {children}
        </main>
        <AssistantFab />
        <LanguagePicker />
        <MicButton />
        <BottomNav />
        <ChatModal />
      </div>
    </div>
  )
}
