'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { agentProps } from '@/lib/agent'
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll'

/**
 * Centred dialog with focus containment, Escape-to-close and a click-away
 * backdrop. Rendered inside the app shell so it stays phone-width on desktop.
 */
export function Modal({ open, onClose, title, description, children, footer, agentId, className }) {
  const panelRef = useRef(null)
  useLockBodyScroll(open)
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    panel?.querySelector('[data-autofocus], button, [href], input, select, textarea')?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panel) return
      const focusable = panel.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${agentId}-title`}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          'app-shell-width w-full overflow-hidden rounded-3xl bg-surface shadow-modal animate-slide-up',
          className,
        )}
      >
        <div className="flex items-start gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 id={`${agentId}-title`} className="heading-sm">
              {title}
            </h2>
            {description ? <p className="mt-1 type-secondary">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
            {...agentProps(`${agentId}-close`)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-line px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  )
}
