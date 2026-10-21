import { AGENT_SCREEN_EVENT } from '@/lib/agent'

/**
 * WebSocket transport between the app's agent contract and the external Python
 * voice agent.
 *
 * The contract itself lives in lib/agent.js and stays untouched: interactive
 * elements carry `data-agent-id`, and every route change fires the
 * `AGENT_SCREEN_CHANGE` event plus `window.__AGENT_SCREEN__`. This module adds
 * the wire — one long-lived socket to the local voice agent that
 *
 *   1. forwards screen changes as { type: 'AGENT_SCREEN_CHANGE', screen }
 *   2. applies { type: 'AGENT_HIGHLIGHT', targetId } requests onto the page
 *
 * Everything is best-effort: when the Python agent is not running the socket
 * retries quietly in the background and the app behaves exactly as it would
 * without the bridge.
 */

const SOCKET_URL =
  process.env.NEXT_PUBLIC_AGENT_SOCKET_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'ws://localhost:8765/ws'
    : 'wss://rasta-ai-production.up.railway.app/ws')
const HIGHLIGHT_CLASS = 'agent-highlight'
/** A highlight clears on the next screen change, or after this long. */
const HIGHLIGHT_DURATION_MS = 30_000
/** 0.5s → 1s → 2s → 4s, then capped — quick to rejoin once the agent appears. */
const BASE_RECONNECT_DELAY_MS = 500
const MAX_RECONNECT_DELAY_MS = 5_000
/**
 * Agent ids are letters, digits, dashes and underscores — anything else is
 * dropped before it ever reaches querySelector.
 */
const SAFE_AGENT_ID = /^[A-Za-z0-9_-]+$/

let started = false
let socket = null
let reconnectAttempts = 0
let reconnectTimer = null
let highlightTimer = null
let highlighted = null
let indicatorEl = null
let scrollHandler = null

function send(message) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message))
  }
}

/** Send browser-recorded audio (base64) to the agent for transcription. */
export function sendAgentAudio(base64Audio, mimeType) {
  send({ type: 'AGENT_AUDIO', audio: base64Audio, mimeType: mimeType || 'audio/webm' })
}

let currentLanguage = 'ur'

/** Tell the agent which language the user will speak in. */
export function sendLanguageChoice(language) {
  if (language) currentLanguage = language
  send({ type: 'AGENT_LANGUAGE', language: currentLanguage })
}

function clearHighlight() {
  if (highlightTimer) {
    clearTimeout(highlightTimer)
    highlightTimer = null
  }
  // Removing from a detached node (its row left the DOM on a route change) is a no-op.
  highlighted?.classList.remove(HIGHLIGHT_CLASS)
  highlighted = null
  if (indicatorEl) {
    indicatorEl.remove()
    indicatorEl = null
  }
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler, true)
    window.removeEventListener('resize', scrollHandler)
    scrollHandler = null
  }
}

function highlightTarget(targetId) {
  if (typeof targetId !== 'string' || !SAFE_AGENT_ID.test(targetId)) return
  const element = document.querySelector(`[data-agent-id="${targetId}"]`)
  if (!element) return
  // A second request replaces the first instead of stacking rings.
  clearHighlight()
  highlighted = element
  element.classList.add(HIGHLIGHT_CLASS)
  // Bring off-screen targets (biller lists, statements) into view. 'nearest'
  // never scrolls when the element is already fully visible.
  element.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  showIndicator(element)
  highlightTimer = setTimeout(clearHighlight, HIGHLIGHT_DURATION_MS)
}

/**
 * Try each candidate id in order — the first one that exists in the DOM wins.
 * This handles responsive layouts where the mobile nav id (nav-home) and the
 * desktop sidebar id (side-nav-dashboard) both refer to the same destination.
 */
function highlightTargets(targetIds) {
  if (!Array.isArray(targetIds) || targetIds.length === 0) return
  for (const id of targetIds) {
    if (typeof id !== 'string' || !SAFE_AGENT_ID.test(id)) continue
    const el = document.querySelector(`[data-agent-id="${id}"]`)
    if (el) {
      highlightTarget(id)
      return
    }
  }
}

/** Floating arrow + dot indicator next to the highlighted element. */
function showIndicator(element) {
  if (indicatorEl) indicatorEl.remove()
  const rect = element.getBoundingClientRect()
  const isSidebar = rect.left < 100 && rect.width < 120
  indicatorEl = document.createElement('div')
  indicatorEl.className = 'agent-indicator'
  // Sidebar elements: point right (▶); normal elements: point down (▼)
  indicatorEl.innerHTML = isSidebar
    ? '<span class="agent-indicator-arrow">\u25B6</span><span class="agent-indicator-dot"></span>'
    : '<span class="agent-indicator-arrow">\u25BC</span><span class="agent-indicator-dot"></span>'
  document.body.appendChild(indicatorEl)
  positionIndicator()
  scrollHandler = () => { if (highlighted) positionIndicator() }
  window.addEventListener('scroll', scrollHandler, true)
  window.addEventListener('resize', scrollHandler)
}

function positionIndicator() {
  if (!highlighted || !indicatorEl) return
  const rect = highlighted.getBoundingClientRect()
  const isSidebar = rect.left < 100 && rect.width < 120
  if (isSidebar) {
    // Sidebar element — show indicator to the right of the item
    indicatorEl.style.left = `${rect.right + 24}px`
    indicatorEl.style.top = `${rect.top + rect.height / 2}px`
  } else {
    // Normal element — show indicator above
    indicatorEl.style.left = `${rect.left + rect.width / 2}px`
    indicatorEl.style.top = `${rect.top - 56}px`
  }
}

function onScreenChange(event) {
  clearHighlight()
  send({
    type: AGENT_SCREEN_EVENT,
    screen: event.detail?.screen ?? window.__AGENT_SCREEN__,
  })
}

/** Send typed or simulated scenario utterance to the agent. */
export function sendAgentUtterance(text) {
  send({ type: 'AGENT_UTTERANCE', text })
}

/** Notify agent backend when a modal or sheet opens or closes. */
export function sendAgentModalState(data) {
  send({ type: 'AGENT_MODAL_STATE', ...data })
}

/** Notify agent backend when a guided form step is completed by the user. */
export function sendAgentStepCompleted(step) {
  send({ type: 'AGENT_STEP_COMPLETED', step })
}

export { clearHighlight }

let currentAgentAudio = null
let isAutofillAudioPlaying = false

/** Immediately cancel any currently playing neural audio or browser speech. */
export function stopAgentAudio() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  if (currentAgentAudio) {
    try {
      currentAgentAudio.pause()
      currentAgentAudio.currentTime = 0
    } catch {
      // Ignore pause errors
    }
    currentAgentAudio = null
  }
  isAutofillAudioPlaying = false
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('AGENT_SPEECH_STATE', { detail: { speaking: false } }))
  }
}

function playNeuralAudio(base64Audio, isAutofill = false, onEndCallback) {
  if (!base64Audio || typeof window === 'undefined') return
  try {
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    if (currentAgentAudio) {
      // Protect active smart form explanation voice from being overwritten by generic navigation audio
      if (isAutofillAudioPlaying && !isAutofill) {
        return
      }
      currentAgentAudio.pause()
      currentAgentAudio.currentTime = 0
    }
    if (isAutofill) {
      isAutofillAudioPlaying = true
    }
    const sound = new Audio('data:audio/mp3;base64,' + base64Audio)
    currentAgentAudio = sound
    window.dispatchEvent(new CustomEvent('AGENT_SPEECH_STATE', { detail: { speaking: true } }))
    sound.addEventListener('ended', () => {
      isAutofillAudioPlaying = false
      window.dispatchEvent(new CustomEvent('AGENT_SPEECH_STATE', { detail: { speaking: false } }))
      if (onEndCallback) onEndCallback()
    })
    sound.addEventListener('error', () => {
      isAutofillAudioPlaying = false
      window.dispatchEvent(new CustomEvent('AGENT_SPEECH_STATE', { detail: { speaking: false } }))
    })
    sound.play().catch((err) => {
      console.warn('[bridge] Neural audio autoplay note:', err)
      isAutofillAudioPlaying = false
      window.dispatchEvent(new CustomEvent('AGENT_SPEECH_STATE', { detail: { speaking: false } }))
    })
  } catch (err) {
    console.error('[bridge] Audio playback failed:', err)
  }
}

function onSocketMessage(event) {
  let message
  try {
    message = JSON.parse(event.data)
  } catch {
    return // The agent protocol is JSON-only; anything else is ignored.
  }
  if (message?.type === 'AGENT_HIGHLIGHT') {
    const isAutofill = Boolean(message.autofill)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('AGENT_UPDATE', { detail: message }))
      if (message.autofill) {
        window.dispatchEvent(new CustomEvent('AGENT_AUTOFILL', { detail: message.autofill }))
      }
    }
    if (Array.isArray(message.targetIds)) {
      highlightTargets(message.targetIds)
    } else if (message.targetId) {
      highlightTarget(message.targetId)
    }
    // High-fidelity neural audio stream takes priority over browser robot synthesis
    if (message.audio) {
      playNeuralAudio(message.audio, isAutofill)
    } else if (message.flowGuidance) {
      if (!isAutofillAudioPlaying) {
        speakFlowGuidance(message.flowGuidance)
      }
    }
  }
  if (message?.type === 'AGENT_CLICK') clickTarget(message.targetId)
}

function clickTarget(targetId) {
  if (typeof targetId !== 'string' || !SAFE_AGENT_ID.test(targetId)) return
  const element = document.querySelector(`[data-agent-id="${targetId}"]`)
  if (!element) return
  element.classList.add('agent-click')
  element.click()
  setTimeout(() => element.classList.remove('agent-click'), 400)
}

/**
 * Speak flow-guidance text via the browser's Web Speech API as fallback only.
 */
function speakFlowGuidance(text) {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel() // stop any previous speech
  const trySpeak = () => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ur-PK'
    utterance.rate = 0.85
    const voices = window.speechSynthesis.getVoices()
    const urduVoice = voices.find((v) => v.lang.startsWith('ur'))
    if (urduVoice) utterance.voice = urduVoice
    window.speechSynthesis.speak(utterance)
  }
  if (window.speechSynthesis.getVoices().length > 0) {
    trySpeak()
  } else {
    window.speechSynthesis.addEventListener('voiceschanged', trySpeak, { once: true })
    setTimeout(trySpeak, 100)
  }
}

/**
 * Start the bridge. Idempotent, so every root-level client component can call
 * it on mount and they share one socket and one event listener — StrictMode's
 * double-invoked effects included. No-op on the server.
 */

function scheduleReconnect() {
  const delay = Math.min(BASE_RECONNECT_DELAY_MS * 2 ** reconnectAttempts, MAX_RECONNECT_DELAY_MS)
  reconnectAttempts += 1
  reconnectTimer = setTimeout(connect, delay)
}

function connect() {
  // Defensive: there is never more than one pending connect attempt.
  clearTimeout(reconnectTimer)
  try {
    socket = new WebSocket(SOCKET_URL)
  } catch {
    scheduleReconnect()
    return
  }
  socket.addEventListener('open', () => {
    reconnectAttempts = 0
    send({ type: 'AGENT_LANGUAGE', language: currentLanguage })
    // A late-starting or restarted agent missed the last screen change —
    // catch it up with the screen the customer is on right now.
    if (window.__AGENT_SCREEN__) {
      send({ type: AGENT_SCREEN_EVENT, screen: window.__AGENT_SCREEN__ })
    }
  })
  socket.addEventListener('message', onSocketMessage)
  // 'error' is always followed by 'close', so reconnecting on close alone
  // covers both a refused first connection and a mid-session drop.
  socket.addEventListener('close', scheduleReconnect)
}

export function initAgentBridge() {
  if (started || typeof window === 'undefined') return
  started = true
  window.addEventListener(AGENT_SCREEN_EVENT, onScreenChange)
  connect()
}
