'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CircleHelp } from 'lucide-react'
import { initAgentBridge } from '@/lib/agentBridge'
import { BANK_DISCLAIMER, ROUTES } from '@/lib/constants'
import { useAuth } from '@/hooks/use-auth'
import { AuthHero } from '@/components/auth/AuthHero'
import { LoginForm } from '@/components/auth/LoginForm'
import { ScreenBroadcaster } from '@/components/common/ScreenBroadcaster'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, hydrated } = useAuth()
  useEffect(() => {
    if (hydrated && isAuthenticated) router.replace(ROUTES.dashboard)
  }, [hydrated, isAuthenticated, router])
  // Same lifetime as the screen broadcaster: one voice-agent bridge per session.
  useEffect(() => {
    initAgentBridge()
  }, [])
  return (
    <main className="flex min-h-dvh flex-col px-4 py-6 pb-safe pt-safe md:px-6 md:py-10">
      <ScreenBroadcaster />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-5 md:grid md:grid-cols-2 md:items-center md:gap-10">
        <AuthHero />
        <div className="mx-auto w-full app-shell-width md:max-w-none">
          <LoginForm />
        </div>
      </div>
      <footer className="mx-auto mt-6 flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 type-caption">
        <span>{BANK_DISCLAIMER}</span>
        <span className="flex items-center gap-1.5">
          <CircleHelp size={13} aria-hidden />
          Help centre
        </span>
      </footer>
    </main>
  )
}
