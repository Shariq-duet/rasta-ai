'use client'

import { useState } from 'react'
import { Languages } from 'lucide-react'
import { sendLanguageChoice } from '@/lib/agentBridge'
import { useBankStore } from '@/hooks/use-bank-store'

const LANGUAGES = [
  { code: 'en', label: 'EN', fullLabel: 'English' },
  { code: 'ur', label: 'اُ', fullLabel: 'اردو' },
]

/**
 * Language toggle for the voice agent. Sends the choice to the Python agent
 * so whisper transcribes with the correct forced language.
 */
export function LanguagePicker() {
  const chatOpen = useBankStore((state) => state.chatOpen)
  const [langIndex, setLangIndex] = useState(0)
  const current = LANGUAGES[langIndex]

  function handleToggle() {
    const nextIndex = (langIndex + 1) % LANGUAGES.length
    setLangIndex(nextIndex)
    sendLanguageChoice(LANGUAGES[nextIndex].code)
  }

  if (chatOpen) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--bottomnav-height)+9.5rem)] z-30 flex justify-center px-4 md:bottom-[calc(var(--bottomnav-height)+11rem)] lg:bottom-[10rem] lg:left-[var(--sidebar-width)] lg:px-8">
      <div className="mx-auto flex w-full max-w-[var(--app-width)] justify-end lg:max-w-[var(--content-width)]">
        <button
          type="button"
          onClick={handleToggle}
          aria-label={`Language: ${current.fullLabel}. Click to switch.`}
          title={`Switch language (currently ${current.fullLabel})`}
          className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-fab"
        >
          <Languages size={14} className="text-ink-muted" />
          <span className="text-ink">{current.label}</span>
        </button>
      </div>
    </div>
  )
}
