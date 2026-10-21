'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Mic,
  Square,
  Loader2,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Zap,
  CheckCircle2,
  Languages,
  ShieldCheck,
  ChevronUp,
} from 'lucide-react'
import { sendAgentAudio, sendLanguageChoice, sendAgentUtterance, stopAgentAudio } from '@/lib/agentBridge'
import { useBankStore } from '@/hooks/use-bank-store'
import { ROUTES } from '@/lib/constants'
import { VoiceWaveform } from './VoiceWaveform'

const MAX_RECORDING_MS = 30000

const LANGUAGES = [
  { code: 'ur', label: 'اردو', short: 'اُ' },
  { code: 'en', label: 'English', short: 'EN' },
]

const DEMO_SCENARIOS = [
  {
    id: 'balance-ur',
    title: 'Check Balance (Urdu)',
    urduTitle: 'بیلنس معلوم کریں',
    utterance: 'میرا بیلنس کتنا ہے',
    category: 'Urdu Voice',
    description: 'Highlights account balance and plays native Pakistani neural audio.',
  },
  {
    id: 'send-hamza',
    title: 'Send PKR 5,000 to Hamza',
    urduTitle: 'حمزہ کو 5000 بھیجیں',
    utterance: 'حمزہ کو 5000 روپے بھیجو',
    category: 'Smart Autofill',
    description: 'Extracts slots, autofills transfer to Hamza, and stops for human review.',
  },
  {
    id: 'pay-kelectric',
    title: 'Pay K-Electric Bill',
    urduTitle: 'کے الیکٹرک کا بل',
    utterance: 'Pay my K-Electric electricity bill',
    category: 'Bill Payment',
    description: 'Navigates to Bills, selects K-Electric biller, and guides confirmation.',
  },
  {
    id: 'qr-pay',
    title: 'QR Scan & Pay',
    urduTitle: 'کیو آر اسکین اور پے',
    utterance: 'کیو آر کوڈ اسکین کر کے پیمنٹ کرنی ہے',
    category: 'QR Payment',
    description: 'Simulates merchant retail QR scan, sets amount, and guides instant approval.',
  },
  {
    id: 'emergency-card',
    title: 'Emergency Card Freeze',
    urduTitle: 'کارڈ گم / فریز',
    utterance: 'I lost my card, please freeze it immediately',
    category: 'Security',
    description: 'Emergency security flow: navigates to cards and highlights freeze switch.',
  },
  {
    id: 'cheque-request',
    title: 'Order Cheque Book',
    urduTitle: 'نئی چیک بک منگوائیں',
    utterance: 'مجھے نئی چیک بک چاہیے',
    category: 'Cheque Service',
    description: 'Navigates to cheque book services, selects account & leaves, and prepares request.',
  },
  {
    id: 'certificate-request',
    title: 'Download Account Certificate',
    urduTitle: 'اکاؤنٹ سرٹیفکیٹ بنائیں',
    utterance: 'مجھے اکاؤنٹ سرٹیفکیٹ چاہیے',
    category: 'Certificates',
    description: 'Generates official bank maintenance or balance certificate for visa/tax.',
  },
  {
    id: 'helpline',
    title: 'Human Support Helpline',
    urduTitle: 'ہیلپ لائن رابطہ',
    utterance: 'Talk to human representative helpline',
    category: 'Support',
    description: 'Opens profile & helpline assistance with 24/7 bank contact details.',
  },
]

export function VoiceHud() {
  const router = useRouter()
  const pathname = usePathname()
  const setTransfer = useBankStore((state) => state.setTransfer)
  const setBill = useBankStore((state) => state.setBill)
  const beneficiaries = useBankStore((state) => state.beneficiaries)

  // Voice Interaction State
  const [state, setState] = useState('idle') // idle | recording | processing
  const [recordDuration, setRecordDuration] = useState(0)
  const [activeLangIndex, setActiveLangIndex] = useState(0) // default 0 = Urdu
  const [showScenarios, setShowScenarios] = useState(false)

  // Speech & AI Status
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [latestAgentMessage, setLatestAgentMessage] = useState(null)
  const [subtitlesVisible, setSubtitlesVisible] = useState(false)

  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const stopTimerRef = useRef(null)
  const durationTimerRef = useRef(null)
  const hideSubtitlesTimerRef = useRef(null)

  const currentLang = LANGUAGES[activeLangIndex]

  // Synchronize language choice to backend on mount and whenever it changes
  useEffect(() => {
    sendLanguageChoice(LANGUAGES[activeLangIndex].code)
  }, [activeLangIndex])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupStream()
      clearTimeout(hideSubtitlesTimerRef.current)
    }
  }, [])

  // Listen to WebSocket events from agentBridge.js
  useEffect(() => {
    const handleAgentUpdate = (event) => {
      const data = event.detail
      if (!data) return
      setLatestAgentMessage(data)
      setSubtitlesVisible(true)

      // Auto-hide subtitles after 10 seconds unless renewed
      clearTimeout(hideSubtitlesTimerRef.current)
      hideSubtitlesTimerRef.current = setTimeout(() => {
        setSubtitlesVisible(false)
      }, 10000)

      // Dynamic Voice Navigation: Route to the respective page on intent!
      const intent = data.intent
      if (intent) {
        const navigateIfDifferent = (targetPath) => {
          if (targetPath && pathname !== targetPath) {
            router.push(targetPath)
          }
        }

        if (intent === 'qr_pay') {
          navigateIfDifferent(ROUTES.qrPay)
        } else if (intent === 'manage_card' || intent === 'view_cards') {
          navigateIfDifferent(ROUTES.cards)
        } else if (intent === 'emergency_card_freeze') {
          navigateIfDifferent(ROUTES.card('card-debit-visa'))
        } else if (intent === 'view_profile' || intent === 'human_support_helpline') {
          navigateIfDifferent(ROUTES.profile)
        } else if (intent === 'view_notifications') {
          navigateIfDifferent(ROUTES.notifications)
        } else if (intent === 'request_cheque_book') {
          navigateIfDifferent(ROUTES.chequeBook)
        } else if (intent === 'stop_cheque') {
          navigateIfDifferent(ROUTES.chequeBook)
        } else if (intent === 'request_certificate') {
          navigateIfDifferent(ROUTES.certificates)
        } else if (intent === 'check_transactions' || intent === 'view_statements') {
          navigateIfDifferent(ROUTES.statements)
        } else if (intent === 'view_analytics') {
          navigateIfDifferent(ROUTES.analytics)
        } else if (intent === 'find_branch') {
          navigateIfDifferent(ROUTES.locator)
        } else if (intent === 'add_beneficiary_guidance') {
          navigateIfDifferent(ROUTES.beneficiaryNew)
        } else if (intent === 'check_balance' || intent === 'cancel_or_back') {
          navigateIfDifferent(ROUTES.dashboard)
        } else if (intent === 'send_money' && !data.autofill) {
          navigateIfDifferent(ROUTES.transfer)
        } else if (intent === 'pay_bill' && !data.autofill) {
          navigateIfDifferent(ROUTES.bills)
        }
      }
    }

    const handleSpeechState = (event) => {
      setIsSpeaking(Boolean(event.detail?.speaking))
    }

    const handleAutofill = (event) => {
      const autofill = event.detail
      if (!autofill) return

      if (autofill.type === 'transfer') {
        let matchedId = null
        if (autofill.recipient) {
          const search = autofill.recipient.toLowerCase().trim()
          const found = beneficiaries.find(
            (b) =>
              b.name.toLowerCase().includes(search) ||
              search.includes(b.name.toLowerCase()) ||
              (b.initials && b.initials.toLowerCase() === search)
          )
          if (found) matchedId = found.id
        }
        const currentTransfer = useBankStore.getState().transfer
        if (!matchedId) {
          matchedId = currentTransfer?.beneficiaryId || (beneficiaries.length > 0 ? beneficiaries[0].id : null)
        }

        const cleanAmount = autofill.amount
          ? String(autofill.amount).replace(/[^0-9.]/g, '')
          : (currentTransfer?.amount || '')

        setTransfer({
          beneficiaryId: matchedId,
          amount: cleanAmount,
          note: autofill.note || 'Voice Transfer',
          mode: 'ibft',
        })

        // Route to transfer screen so user sees filled inputs
        router.push(ROUTES.transfer)
      } else if (autofill.type === 'bill') {
        const rawBiller = String(autofill.biller || '').toLowerCase().trim()
        let billerId = 'ssgc'
        let defaultAmt = '3640'

        if (rawBiller.includes('electric') || rawBiller.includes('bijli') || rawBiller.includes('kelectric')) {
          billerId = 'k-electric'
          defaultAmt = '14820'
        } else if (rawBiller.includes('ptcl') || rawBiller.includes('internet') || rawBiller.includes('wifi') || rawBiller.includes('broadband')) {
          billerId = 'ptcl'
          defaultAmt = '4499'
        } else if (rawBiller.includes('jazz')) {
          billerId = 'jazz-postpaid'
          defaultAmt = '2890'
        } else if (rawBiller.includes('zong')) {
          billerId = 'zong-postpaid'
          defaultAmt = '1750'
        } else if (rawBiller.includes('water') || rawBiller.includes('kwsb')) {
          billerId = 'kwsb'
          defaultAmt = '1980'
        } else if (autofill.biller && (autofill.biller === 'ssgc' || rawBiller.includes('gas') || rawBiller.includes('sui'))) {
          billerId = 'ssgc'
          defaultAmt = '3640'
        } else if (autofill.biller) {
          billerId = autofill.biller
        }

        const cleanAmount = String(autofill.amount || defaultAmt).replace(/[^0-9.]/g, '')

        setBill({
          billerId,
          amount: cleanAmount,
        })
        router.push(ROUTES.bills)
      }
    }

    window.addEventListener('AGENT_UPDATE', handleAgentUpdate)
    window.addEventListener('AGENT_SPEECH_STATE', handleSpeechState)
    window.addEventListener('AGENT_AUTOFILL', handleAutofill)

    return () => {
      window.removeEventListener('AGENT_UPDATE', handleAgentUpdate)
      window.removeEventListener('AGENT_SPEECH_STATE', handleSpeechState)
      window.removeEventListener('AGENT_AUTOFILL', handleAutofill)
    }
  }, [beneficiaries, router, pathname, setTransfer, setBill])

  function cleanupStream() {
    clearTimeout(stopTimerRef.current)
    clearInterval(durationTimerRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    recorderRef.current = null
    setRecordDuration(0)
  }

  function handleLanguageToggle() {
    const next = (activeLangIndex + 1) % LANGUAGES.length
    setActiveLangIndex(next)
    sendLanguageChoice(LANGUAGES[next].code)
  }

  async function startRecording() {
    if (state !== 'idle') return
    stopAgentAudio()
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
          const base64 = String(reader.result).split(',')[1] || ''
          sendAgentAudio(base64, blob.type)
          setTimeout(() => setState('idle'), 2500)
        }
        reader.readAsDataURL(blob)
      }

      recorder.start()
      setState('recording')
      setRecordDuration(0)

      durationTimerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1)
      }, 1000)

      stopTimerRef.current = setTimeout(() => {
        if (recorderRef.current?.state === 'recording') {
          recorderRef.current.stop()
        }
      }, MAX_RECORDING_MS)
    } catch (err) {
      console.warn('[voice-hud] Mic access notice:', err)
      cleanupStream()
      setState('idle')
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
    }
  }

  function handleScenarioClick(scenario) {
    stopAgentAudio()
    setShowScenarios(false)
    setState('processing')
    sendAgentUtterance(scenario.utterance)
    setTimeout(() => setState('idle'), 1800)
  }

  return (
    <>
      {/* 1. Live Subtitles & AI Reasoning Floating HUD */}
      {subtitlesVisible && latestAgentMessage && (
        <aside
          role="region"
          aria-live="polite"
          aria-label="Voice guidance captions"
          className="fixed inset-x-4 bottom-[calc(var(--bottomnav-height)+6rem)] z-40 mx-auto max-w-xl animate-fade-in"
        >
          <div className="overflow-hidden rounded-2xl border border-white/20 bg-surface/95 p-4 shadow-modal backdrop-blur-xl transition-all">
            {/* Header: Intent Badge & Dismiss */}
            <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-2xs font-bold uppercase tracking-wider text-brand-700">
                  <Sparkles size={13} className="text-brand-600 animate-spin-slow" />
                  {latestAgentMessage.intent
                    ? `Intent: ${latestAgentMessage.intent.replace(/_/g, ' ')}`
                    : 'AI Banking Assistant'}
                </span>
                {latestAgentMessage.confidence && (
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-2xs font-semibold text-emerald-700">
                    {latestAgentMessage.confidence} confidence
                  </span>
                )}
                {isSpeaking && (
                  <span className="flex items-center gap-1 text-2xs font-semibold text-brand-600 animate-pulse">
                    <Volume2 size={13} /> Speaking…
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSubtitlesVisible(false)}
                aria-label="Dismiss subtitles"
                className="grid h-6 w-6 place-items-center rounded-lg text-ink-muted hover:bg-canvas hover:text-ink"
              >
                <X size={14} />
              </button>
            </div>

            {/* Recognized User Speech */}
            {latestAgentMessage.transcript && (
              <div className="mt-2 text-xs text-ink-muted" dir="auto">
                <span className="font-semibold text-ink">
                  {currentLang.code === 'ur' ? 'آپ کا سوال:' : 'You said:'}
                </span>{' '}
                <span className="font-medium text-brand-700 italic">
                  &ldquo;{latestAgentMessage.transcript}&rdquo;
                </span>
              </div>
            )}

            {/* AI Assistant Spoken Captions */}
            {latestAgentMessage.flowGuidance && (
              <p className="mt-2 font-display text-sm font-semibold leading-relaxed text-ink" dir="auto">
                {latestAgentMessage.flowGuidance}
              </p>
            )}

            {/* Safe Guardrail Disclaimer Badge */}
            <div className="mt-3 flex items-center gap-1.5 text-3xs font-medium text-ink-muted">
              <ShieldCheck size={12} className="text-secondary" />
              <span>Human verification required: AI guides & fills forms but never submits money without your approval.</span>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Interactive Stage Demo Scenarios Drawer */}
      {showScenarios && (
        <section
          role="region"
          aria-label="Interactive demo scenarios"
          className="fixed inset-x-4 bottom-[calc(var(--bottomnav-height)+5.5rem)] z-40 mx-auto max-w-xl animate-sheet-up"
        >
          <div className="overflow-hidden rounded-3xl border border-white/30 bg-surface/98 p-5 shadow-2xl backdrop-blur-2xl ring-1 ring-line">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent-500/15 text-accent-600 font-bold">
                  <Zap size={16} />
                </span>
                <div>
                  <h3 className="font-display text-xs font-bold text-ink uppercase tracking-wider">
                    Stage Demo Scenarios
                  </h3>
                  <p className="text-2xs text-ink-muted">
                    1-click instant voice & flow simulation for high-stakes presentation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowScenarios(false)}
                aria-label="Close scenarios"
                className="grid h-7 w-7 place-items-center rounded-lg text-ink-muted hover:bg-canvas hover:text-ink"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
              {DEMO_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => handleScenarioClick(scenario)}
                  className="flex items-start gap-3 rounded-xl border border-line bg-canvas/60 p-2.5 text-left transition-all hover:border-brand-300 hover:bg-brand-50/60 group"
                >
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand-100 text-brand-700 text-xs font-bold group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    ⚡
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs text-ink group-hover:text-brand-700">
                        {scenario.title}
                      </span>
                      <span className="text-3xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                        {scenario.category}
                      </span>
                    </div>
                    <p className="mt-0.5 text-2xs text-ink-muted line-clamp-1">
                      {scenario.description}
                    </p>
                    <p className="mt-1 text-2xs font-medium text-emerald-600">
                      &ldquo;{scenario.utterance}&rdquo;
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Sleek Floating Voice Control Island */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--bottomnav-height)+1.25rem)] z-30 flex justify-center px-4 lg:bottom-6 lg:left-[var(--sidebar-width)]">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/30 bg-surface/90 px-3 py-2 shadow-modal backdrop-blur-xl ring-1 ring-black/5 transition-all">
          {/* Language Toggle Pill */}
          <button
            type="button"
            onClick={handleLanguageToggle}
            aria-label={`Language: ${currentLang.label}. Click to toggle.`}
            title="Toggle speech recognition language"
            className="flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1.5 text-2xs font-bold text-ink transition-colors hover:bg-brand-50 hover:text-brand-700"
          >
            <Languages size={13} className="text-ink-muted" />
            <span>{currentLang.short}</span>
          </button>

          {/* Dynamic Voice Core */}
          {state === 'idle' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={startRecording}
                aria-label="Start voice command"
                className="group relative flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-white shadow-brand transition-all hover:scale-102 hover:shadow-lg active:scale-98"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-300" />
                </span>
                <Mic size={17} className="transition-transform group-hover:scale-110" />
                <span className="font-display text-xs font-bold tracking-tight">
                  {currentLang.code === 'ur' ? 'بولیں (Voice)' : 'Talk to Agent'}
                </span>
              </button>

              {/* Active neural speaking waveform & quick-mute button */}
              {isSpeaking && (
                <div className="flex items-center gap-1.5 pl-1 pr-1 animate-fade-in">
                  <VoiceWaveform active={true} barCount={8} />
                  <button
                    type="button"
                    onClick={stopAgentAudio}
                    aria-label="Mute voice guidance"
                    title="Stop speaking"
                    className="grid h-7 w-7 place-items-center rounded-full bg-canvas text-ink-muted hover:bg-danger-50 hover:text-danger-600 transition-colors shadow-xs"
                  >
                    <VolumeX size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {state === 'recording' && (
            <div className="flex items-center gap-2 px-1">
              <VoiceWaveform active={true} barCount={16} />
              <div className="flex items-center gap-1.5 text-2xs font-bold text-danger-600">
                <span className="h-2 w-2 rounded-full bg-danger-500 animate-ping" />
                <span>{currentLang.code === 'ur' ? 'سن رہا ہوں…' : 'Listening…'}</span>
              </div>
              <button
                type="button"
                onClick={stopRecording}
                aria-label="Stop recording and send"
                title="Tap when finished speaking"
                className="flex items-center gap-1 rounded-full bg-danger-600 px-3 py-1 text-2xs font-bold text-white shadow transition-transform hover:scale-105 active:scale-95"
              >
                <Square size={10} fill="currentColor" />
                <span>{currentLang.code === 'ur' ? 'مکمل' : 'Done'}</span>
              </button>
            </div>
          )}

          {state === 'processing' && (
            <div className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-brand-700">
              <Loader2 size={16} className="animate-spin text-brand-600" />
              <span className="font-display text-2xs font-bold tracking-tight">
                Processing intent…
              </span>
            </div>
          )}

          {/* Quick Stage Scenarios Trigger */}
          <button
            type="button"
            onClick={() => setShowScenarios((prev) => !prev)}
            aria-label="Stage demo scenarios"
            title="Open stage demo scenarios"
            className={`grid h-8 w-8 place-items-center rounded-full transition-all ${
              showScenarios
                ? 'bg-accent-500 text-white shadow-fab'
                : 'bg-canvas text-ink-muted hover:bg-brand-50 hover:text-brand-600'
            }`}
          >
            <Zap size={15} />
          </button>
        </div>
      </div>
    </>
  )
}
