'use client'

import { useEffect } from 'react'

/** Prevents the page behind a modal or sheet from scrolling while it is open. */
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [locked])
}
