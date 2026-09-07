'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/** Transient confirmation banner used by the mock service requests. */
export function useToast(duration = 4000) {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)
  const dismissToast = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    setToast(null)
  }, [])
  const showToast = useCallback(
    (message, tone = 'success') => {
      if (timer.current) clearTimeout(timer.current)
      setToast({ message, tone })
      timer.current = setTimeout(() => setToast(null), duration)
    },
    [duration],
  )
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )
  return { toast, showToast, dismissToast }
}
