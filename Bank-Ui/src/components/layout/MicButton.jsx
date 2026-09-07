'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Mic, Square } from 'lucide-react'
import { sendAgentAudio } from '@/lib/agentBridge'
import { useBankStore } from '@/hooks/use-bank-store'

/** Recording auto-stops after this long — one breath is enough for a command. */
const MAX_RECORDING_MS = 5000

/**
 * In-app microphone button: records up to 5 s of speech and ships it to the
 * Python voice agent over the bridge socket (AGENT_AUDIO). The agent
 * transcribes, classifies and highlights — exactly like the console `mic`
 * command, but without leaving the UI.
 */
export function MicButton() {
  const chatOpen = useBankStore((state) => state.chatOpen)
  const [state, setState] = useState('idle') // idle | recording | processing
  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const stopTimerRef = useRef(null)

  // Release the microphone if the component unmounts mid-recording.
  useEffect(() => {
    return () => {
      clearTimeout(stopTimerRef.current)
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  function cleanupStream() {
    clearTimeout(stopTimerRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    recorderRef.current = null
  }

  async function handleStart() {
    if (state !== 'idle') return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        cleanupStream()
        if (blob.size === 0) {
          setState('idle')
          return
        }
        setState('processing')
        const reader = new FileReader()
        reader.onloadend = () => {
          // data URL -> raw base64 payload
          const base64 = String(reader.result).split(',')[1] || ''
          sendAgentAudio(base64, blob.type)
          // Back to ready once the agent has had time to pick it up.
          setTimeout(() => setState('idle'), 2000)
        }
        reader.readAsDataURL(blob)
      }
      recorder.start()
      setState('recording')
      stopTimerRef.current = setTimeout(() => {
        if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
      }, MAX_RECORDING_MS)
    } catch {
      cleanupStream()
      setState('idle')
    }
  }

  function handleClick() {
    if (state === 'idle') void handleStart()
    else if (state === 'recording') recorderRef.current?.stop()
  }

  if (chatOpen) return null

  return (
    // Same fixed band the assistant fab uses, one button-height higher.
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--bottomnav-height)+4.75rem)] z-30 flex justify-center px-4 md:bottom-[calc(var(--bottomnav-height)+6.25rem)] lg:bottom-[5.5rem] lg:left-[var(--sidebar-width)] lg:px-8">
      <div className="mx-auto flex w-full max-w-[var(--app-width)] justify-end lg:max-w-[var(--content-width)]">
        <div className="pointer-events-auto flex items-center gap-2">
          {state !== 'idle' && (
            <span className="rounded-full bg-surface px-3 py-1 text-2xs font-medium uppercase tracking-eyebrow text-ink-muted shadow-card">
              {state === 'recording' ? 'Listening…' : 'Thinking…'}
            </span>
          )}
          <button
            type="button"
            onClick={handleClick}
            aria-label={state === 'recording' ? 'Stop recording' : 'Talk to the agent'}
            disabled={state === 'processing'}
            className={[
              'grid h-12 w-12 place-items-center rounded-2xl shadow-fab transition-all duration-200 hover:-translate-y-1',
              state === 'recording'
                ? 'animate-pulse bg-danger-500 text-white'
                : 'bg-brand-600 text-accent-200 hover:bg-brand-700',
            ].join(' ')}
          >
            {state === 'recording' ? (
              <Square size={18} />
            ) : state === 'processing' ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Mic size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
