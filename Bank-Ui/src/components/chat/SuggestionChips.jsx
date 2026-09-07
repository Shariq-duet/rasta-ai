'use client'

import { agentProps } from '@/lib/agent'
import { ASSISTANT_SUGGESTIONS } from '@/lib/constants'

export function SuggestionChips({ onSelect }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
      {ASSISTANT_SUGGESTIONS.map((suggestion) => (
        <button
          key={suggestion.id}
          type="button"
          onClick={() => onSelect(suggestion.label)}
          className="shrink-0 whitespace-nowrap rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-2xs font-semibold text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-100"
          {...agentProps(`assistant-suggestion-${suggestion.id}`)}
        >
          {suggestion.label}
        </button>
      ))}
    </div>
  )
}
