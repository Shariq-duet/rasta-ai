'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants'
import { useAuth } from '@/hooks/use-auth'
import { SkeletonScreen } from '@/components/ui'

/**
 * Entry point. Auth is a client-side mock flag, so the decision waits for the
 * persisted store to rehydrate before redirecting.
 */
export default function IndexPage() {
  const router = useRouter()
  const { isAuthenticated, hydrated } = useAuth()
  useEffect(() => {
    if (!hydrated) return
    router.replace(isAuthenticated ? ROUTES.dashboard : ROUTES.login)
  }, [hydrated, isAuthenticated, router])
  return (
    <main className="mx-auto app-shell-width w-full px-4 py-8">
      <SkeletonScreen />
    </main>
  )
}
