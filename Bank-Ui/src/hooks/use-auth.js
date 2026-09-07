'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants'
import { useBankStore } from '@/store/bank-store'

/**
 * Mock session handling. No credentials are validated, sent or stored — the flag
 * simply toggles which routes the shell will render.
 */
export function useAuth() {
  const router = useRouter()
  const isAuthenticated = useBankStore((state) => state.isAuthenticated)
  const hydrated = useBankStore((state) => state.hydrated)
  const login = useBankStore((state) => state.login)
  const logout = useBankStore((state) => state.logout)
  const signIn = useCallback(() => {
    login()
    router.replace(ROUTES.dashboard)
  }, [login, router])
  const signOut = useCallback(() => {
    logout()
    router.replace(ROUTES.login)
  }, [logout, router])
  return { isAuthenticated, hydrated, signIn, signOut }
}
