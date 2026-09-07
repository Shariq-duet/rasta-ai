'use client'

import { Sparkles } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { ASSISTANT_NAME } from '@/lib/constants'
import { useBankStore } from '@/hooks/use-bank-store'

export function AssistantFab() {
  const openChat = useBankStore((state) => state.openChat)
  const chatOpen = useBankStore((state) => state.chatOpen)
  if (chatOpen) return null
  return (
    // Fixed, but tracking the layout bounds rather than the viewport corner:
    // the phone column below lg, the content column beside the sidebar above it.
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--bottomnav-height)+1.25rem)] z-30 flex justify-center px-4 md:bottom-[calc(var(--bottomnav-height)+2.75rem)] lg:bottom-8 lg:left-[var(--sidebar-width)] lg:px-8">
      <div className="mx-auto flex w-full max-w-[var(--app-width)] justify-end lg:max-w-[var(--content-width)]">
        <button
          type="button"
          onClick={openChat}
          aria-label={`Open ${ASSISTANT_NAME}`}
          className="pointer-events-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-accent-200 shadow-fab transition-all duration-200 hover:-translate-y-1 hover:bg-brand-700"
          {...agentProps('assistant-fab')}
        >
          <Sparkles size={20} />
        </button>
      </div>
    </div>
  )
}
