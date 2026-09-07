'use client'

import { Fingerprint } from 'lucide-react'
import { agentProps } from '@/lib/agent'

/** Mock biometric entry — signs straight in, nothing is authenticated. */
export function BiometricButton({ onActivate }) {
  return (
    <button
      type="button"
      onClick={onActivate}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-canvas type-row-title transition-colors hover:bg-brand-50 hover:text-brand-700"
      {...agentProps('login-biometric')}
    >
      <Fingerprint size={18} aria-hidden />
      Use biometric login
    </button>
  )
}
