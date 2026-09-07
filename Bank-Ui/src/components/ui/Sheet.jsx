'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll'

/** Bottom sheet — the native-feeling pattern for pickers on a phone viewport. */
export function Sheet({ open, onClose, title, children, agentId }) {
  useLockBodyScroll(open)
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${agentId}-title`}
        onClick={(event) => event.stopPropagation()}
        className="app-shell-width max-h-[80vh] w-full overflow-y-auto rounded-t-3xl bg-surface pb-safe shadow-sheet animate-sheet-up"
      >
        <div className="sticky top-0 z-10 bg-surface px-5 pb-3 pt-3">
          <div aria-hidden className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
          <div className="flex items-center justify-between gap-3">
            <h2 id={`${agentId}-title`} className="heading-sm">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
              {...agentProps(`${agentId}-close`)}
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="px-5 pb-5">{children}</div>
      </div>
    </div>
  )
}
