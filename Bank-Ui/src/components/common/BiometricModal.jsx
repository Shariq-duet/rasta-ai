'use client'

import React, { useEffect, useState } from 'react'
import { ShieldCheck, CheckCircle2, Fingerprint, Lock } from 'lucide-react'

export function BiometricModal({ open, title = 'Authorizing Transfer', onComplete, onCancel }) {
  const [phase, setPhase] = useState('scanning') // scanning | success

  useEffect(() => {
    if (!open) {
      setPhase('scanning')
      return
    }

    setPhase('scanning')
    const scanTimer = setTimeout(() => {
      setPhase('success')
    }, 1500)

    const finishTimer = setTimeout(() => {
      onComplete?.()
    }, 2400)

    return () => {
      clearTimeout(scanTimer)
      clearTimeout(finishTimer)
    }
  }, [open, onComplete])

  useEffect(() => {
    if (!open) return
    const handleCancel = () => onCancel?.()
    window.addEventListener('AGENT_CANCEL', handleCancel)
    return () => window.removeEventListener('AGENT_CANCEL', handleCancel)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="biometric-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-md p-4 animate-fade-in"
    >
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/20 bg-surface/98 p-6 shadow-2xl backdrop-blur-2xl text-center animate-sheet-up">
        {/* Animated Biometric Scanner Icon */}
        <div className="mx-auto my-4 relative grid h-20 w-20 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          {phase === 'scanning' ? (
            <>
              <Fingerprint size={48} className="animate-pulse text-brand-600" />
              {/* Laser scanning beam */}
              <span className="absolute inset-x-2 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce rounded-full shadow-lg" />
            </>
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 animate-scale-in">
              <CheckCircle2 size={50} className="text-emerald-500" />
            </div>
          )}
        </div>

        <h3 id="biometric-modal-title" className="font-display text-lg font-bold text-ink">
          {phase === 'scanning' ? title : 'Identity Verified'}
        </h3>
        <p className="mt-1 text-xs text-ink-muted">
          {phase === 'scanning'
            ? 'Scanning biometric credentials for secure payment…'
            : 'Authorized by 256-bit Secure Banking Gateway'}
        </p>

        <div className="mt-6 flex items-center justify-center gap-1.5 rounded-full bg-canvas py-2 px-3 text-3xs font-semibold text-ink-muted">
          <Lock size={12} className="text-secondary" />
          <span>Biometric &amp; OTP Human Authorization Step</span>
        </div>
      </div>
    </div>
  )
}
