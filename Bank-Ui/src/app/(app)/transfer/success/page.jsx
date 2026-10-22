'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Volume2, VolumeX, Share2 } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { ROUTES } from '@/lib/constants'
import { formatCurrency, parseAmount } from '@/lib/format'
import { useAccounts, useBankStore } from '@/hooks/use-bank-store'
import { Button } from '@/components/ui'
import { FlowSuccessState } from '@/components/transfer/FlowSuccessState'
import { ReviewList } from '@/components/transfer/ReviewList'

export default function TransferSuccessPage() {
  const router = useRouter()
  const accounts = useAccounts()
  const transfer = useBankStore((state) => state.transfer)
  const beneficiaries = useBankStore((state) => state.beneficiaries)
  const resetTransfer = useBankStore((state) => state.resetTransfer)
  const amount = parseAmount(transfer.amount)
  const fromAccount = accounts.find((entry) => entry.id === transfer.fromAccountId)
  const beneficiary = beneficiaries.find((entry) => entry.id === transfer.beneficiaryId)
  const toAccount = accounts.find((entry) => entry.id === transfer.toAccountId)
  const recipient = transfer.mode === 'ibft' ? beneficiary?.name : toAccount?.nickname
  // Generated once per visit so the reference stays stable while on screen.
  const reference = useMemo(() => `ZNB${Math.floor(100_000_000 + Math.random() * 899_999_999)}`, [])
  const [isPlayingReceipt, setIsPlayingReceipt] = useState(false)

  useEffect(() => {
    if (amount <= 0) router.replace(ROUTES.transfer)
  }, [amount, router])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  if (amount <= 0) return null

  const playAudioReceipt = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    if (isPlayingReceipt) {
      window.speechSynthesis.cancel()
      setIsPlayingReceipt(false)
      return
    }

    window.speechSynthesis.cancel()
    const text = `ٹرانسفر مکمل ہو گیا۔ ${amount} روپے ${recipient || 'ریسیپینٹ'} کو کامیابی سے منتقل کر دیے گئے ہیں۔ ریفرنس نمبر ہے ${reference}۔`
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ur-PK'
    utterance.rate = 0.95

    utterance.onend = () => setIsPlayingReceipt(false)
    utterance.onerror = () => setIsPlayingReceipt(false)

    setIsPlayingReceipt(true)
    window.speechSynthesis.speak(utterance)
  }

  const shareWhatsApp = () => {
    const text =
      `*Zenith Bank Transfer Confirmation*\n\n` +
      `• *Amount*: PKR ${amount.toLocaleString()}\n` +
      `• *To*: ${recipient || 'Beneficiary'}\n` +
      `• *Reference*: ${reference}\n` +
      `• *Status*: Completed\n\n` +
      `Processed seamlessly via Rasta AI Bilingual Voice Banking.`
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const startAnother = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    resetTransfer()
    router.push(ROUTES.transfer)
  }

  const goHome = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    resetTransfer()
    router.push(ROUTES.dashboard)
  }

  return (
    <div className="flex flex-col gap-4 pt-4 lg:mx-auto lg:w-full lg:max-w-2xl">
      <FlowSuccessState
        title="Transfer sent"
        message={
          <>
            Your {formatCurrency(amount)} transfer to{' '}
            <strong className="text-ink">{recipient ?? 'the recipient'}</strong> is on its way.
          </>
        }
        reference={reference}
        details={
          <div className="space-y-3.5">
            <ReviewList
              items={[
                {
                  label: 'From',
                  value: `${fromAccount?.nickname ?? '—'} ${fromAccount?.maskedNumber ?? ''}`,
                  agentId: 'sendmoney-success-from',
                },
                {
                  label: 'Amount',
                  value: formatCurrency(amount),
                  agentId: 'sendmoney-success-amount',
                  emphasis: true,
                },
                {
                  label: 'Status',
                  value: 'Completed',
                  agentId: 'sendmoney-success-status',
                },
              ]}
            />

            {/* Accessibility Audio Receipt Card */}
            <div className="rounded-2xl border border-brand-200/70 bg-gradient-to-br from-brand-50/70 via-white to-accent-50/40 p-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-white shadow-xs">
                    <Volume2 size={16} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-ink">Spoken Audio Receipt</p>
                    <p className="text-3xs text-ink-muted">آڈیو رسید سنیں • Accessibility Audio</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={playAudioReceipt}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-2xs font-bold transition-all ${
                    isPlayingReceipt
                      ? 'bg-danger-100 text-danger-700 hover:bg-danger-200'
                      : 'bg-brand-600 text-white hover:bg-brand-700 shadow-xs active:scale-95'
                  }`}
                >
                  {isPlayingReceipt ? (
                    <>
                      <VolumeX size={13} />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={13} />
                      <span>سنیں (Play)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* WhatsApp Proof of Payment Share */}
            <button
              type="button"
              onClick={shareWhatsApp}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/80 py-2.5 px-3 text-2xs font-bold text-emerald-800 transition-colors shadow-xs"
            >
              <Share2 size={14} className="text-emerald-600" />
              <span>رسید شیئر کریں (Share Receipt on WhatsApp)</span>
            </button>
          </div>
        }
        actions={
          <>
            <Button
              variant="secondary"
              fullWidth
              onClick={startAnother}
              {...agentProps('sendmoney-success-another')}
            >
              Send another
            </Button>
            <Button fullWidth onClick={goHome} {...agentProps('sendmoney-success-home')}>
              <Home size={16} aria-hidden />
              Back to home
            </Button>
          </>
        }
      />
    </div>
  )
}
