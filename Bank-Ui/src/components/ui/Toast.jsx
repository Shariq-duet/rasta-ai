'use client'

import { Check, Info, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { agentProps } from '@/lib/agent'

/** Anchored above the bottom nav so it never covers the primary action. */
export function Toast({ toast, onDismiss, agentId = 'toast' }) {
  if (!toast) return null
  const success = toast.tone === 'success'
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--bottomnav-height)+1.25rem)] z-40 flex justify-center px-4 md:bottom-[calc(var(--bottomnav-height)+2.75rem)] lg:bottom-8 lg:left-[var(--sidebar-width)] lg:px-8"
    >
      <div
        className={cn(
          'pointer-events-auto flex w-full max-w-[var(--app-width)] items-center gap-3 rounded-2xl px-4 py-3 text-white shadow-modal animate-slide-up lg:mr-0 lg:ml-auto',
          success ? 'bg-positive-500' : 'bg-ink',
        )}
        {...agentProps(agentId)}
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20">
          {success ? <Check size={15} /> : <Info size={15} />}
        </span>
        <p className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white"
          {...agentProps(`${agentId}-dismiss`)}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
