'use client'

import React from 'react'

/**
 * Animated soundwave visualization component simulating dynamic live audio frequencies.
 */
export function VoiceWaveform({ active = false, barCount = 18 }) {
  const bars = Array.from({ length: barCount }, (_, i) => i)

  return (
    <div className="flex items-center justify-center gap-[3px] h-8 px-2">
      {bars.map((index) => {
        // Vary heights and delays to create an organic speech frequency spectrum
        const animDuration = 0.5 + ((index % 5) * 0.15)
        const delay = (index * 0.05) % 0.4
        const baseHeight = 15 + ((index % 4) * 20)

        return (
          <span
            key={index}
            className={`w-[3px] rounded-full transition-all duration-200 ${
              active
                ? 'bg-gradient-to-t from-brand-500 via-accent-400 to-secondary animate-pulse'
                : 'bg-ink-faint/30'
            }`}
            style={{
              height: active ? `${Math.min(100, Math.max(25, baseHeight))}%` : '4px',
              animationDuration: `${animDuration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        )
      })}
    </div>
  )
}
