'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles, X } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { ASSISTANT_NAME } from '@/lib/constants'
import { CUSTOMER } from '@/lib/mock-data'
import { useBankStore } from '@/hooks/use-bank-store'
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll'
import { ChatBubble } from './ChatBubble'
import { SuggestionChips } from './SuggestionChips'
const GREETING = `Assalam-o-Alaikum, ${CUSTOMER.name.split(' ')[0]}. Ask me about your balance, a transfer, a bill or your cards.`

/**
 * The assistant is entirely local: replies come from a canned lookup table in
 * mock-data. No request ever leaves the browser.
 */
export function ChatModal() {
  const open = useBankStore((state) => state.chatOpen)
  const close = useBankStore((state) => state.closeChat)
  const messages = useBankStore((state) => state.chat)
  const sendChatMessage = useBankStore((state) => state.sendChatMessage)
  const [input, setInput] = useState('')
  const bodyRef = useRef(null)
  useLockBodyScroll(open)
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, close])
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])
  if (!open) return null
  const submit = (text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    sendChatMessage(trimmed)
    setInput('')
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 animate-fade-in"
      onClick={close}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-title"
        onClick={(event) => event.stopPropagation()}
        className="app-shell-width flex max-h-[86vh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface pb-safe shadow-modal animate-sheet-up"
      >
        <header className="flex items-center gap-3 bg-gradient-to-br from-brand-600 to-brand-800 px-4 py-3.5 text-white">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 text-accent-200">
            <Sparkles size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p id="assistant-title" className="text-[0.8125rem] font-bold">
              {ASSISTANT_NAME}
            </p>
            <p className="text-[0.6875rem] tracking-normal text-white/70">Here whenever you need a hand</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close assistant"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            {...agentProps('assistant-close')}
          >
            <X size={18} />
          </button>
        </header>

        <div
          ref={bodyRef}
          className="flex min-h-[220px] flex-1 flex-col gap-2.5 overflow-y-auto bg-canvas p-4"
        >
          <ChatBubble message={{ from: 'assistant', text: GREETING }} />
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
        </div>

        <SuggestionChips onSelect={submit} />

        <form
          className="flex items-center gap-2 border-t border-line px-4 py-3"
          onSubmit={(event) => {
            event.preventDefault()
            submit(input)
          }}
        >
          <label htmlFor="assistant-input" className="sr-only">
            Ask the {ASSISTANT_NAME}
          </label>
          <input
            id="assistant-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about your money"
            className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-canvas px-3.5 text-xs text-ink placeholder:text-ink-faint transition-colors focus:border-brand-400"
            {...agentProps('assistant-input')}
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!input.trim()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
            {...agentProps('assistant-send')}
          >
            <Send size={16} />
          </button>
        </form>
      </section>
    </div>
  )
}
