'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Volume2, VolumeX, Share2 } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { ROUTES } from '@/lib/constants'
import { formatCurrency, parseAmount } from '@/lib/format'
import { billers } from '@/lib/mock-data'
import { useAccounts, useBankStore } from '@/hooks/use-bank-store'
import { Button } from '@/components/ui'
import { FlowSuccessState } from '@/components/transfer/FlowSuccessState'
import { ReviewList } from '@/components/transfer/ReviewList'

export default function BillSuccessPage() {
  const router = useRouter()
  const accounts = useAccounts()
  const bill = useBankStore((state) => state.bill)
  const resetBill = useBankStore((state) => state.resetBill)
  const biller = billers.find((entry) => entry.id === bill.billerId)
  const fromAccount = accounts.find((entry) => entry.id === bill.fromAccountId)
  const amount = parseAmount(bill.amount)
  const standing = bill.standingInstruction
  const reference = useMemo(() => `BIL${Math.floor(100_000_000 + Math.random() * 899_999_999)}`, [])
  const [isPlayingReceipt, setIsPlayingReceipt] = useState(false)

  useEffect(() => {
    if (!biller || amount <= 0) router.replace(ROUTES.bills)
  }, [biller, amount, router])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  if (!biller || amount <= 0) return null

  const playAudioReceipt = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    if (isPlayingReceipt) {
      window.speechSynthesis.cancel()
      setIsPlayingReceipt(false)
      return
    }

    window.speechSynthesis.cancel()
    const text = `بل کی ادائیگی مکمل ہو گئی ہے۔ ${biller.name} کو ${amount} روپے ادا کر دیے گئے ہیں۔ ریفرنس نمبر ہے ${reference}۔`
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
      `*Zenith Bank Bill Payment Confirmation*\n\n` +
      `• *Biller*: ${biller.name}\n` +
      `• *Amount*: PKR ${amount.toLocaleString()}\n` +
      `• *Reference*: ${reference}\n` +
      `• *Status*: Paid Successfully\n\n` +
      `Processed via Rasta AI Bilingual Voice Banking.`
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const payAnother = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    resetBill()
    router.push(ROUTES.bills)
  }

  const goHome = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    resetBill()
    router.push(ROUTES.dashboard)
  }

  return (
    <div className="flex flex-col gap-4 pt-4 lg:mx-auto lg:w-full lg:max-w-2xl">
      <FlowSuccessState
        title="Bill paid"
        message={
          <>
            Your {formatCurrency(amount)} payment to <strong className="text-ink">{biller.name}</strong> is
            confirmed.
            {standing ? ' Your standing instruction is now active.' : ''}
          </>
        }
        reference={reference}
        details={
          <div className="space-y-3.5">
            <ReviewList
              items={[
                {
                  label: 'Paid from',
                  value: `${fromAccount?.nickname ?? '—'} ${fromAccount?.maskedNumber ?? ''}`,
                  agentId: 'paybill-success-from',
                },
                {
                  label: 'Amount',
                  value: formatCurrency(amount),
                  agentId: 'paybill-success-amount',
                  emphasis: true,
                },
                {
                  label: 'Standing instruction',
                  value: standing ? 'Active' : 'Not set',
                  agentId: 'paybill-success-standing',
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
              onClick={payAnother}
              {...agentProps('paybill-success-another')}
            >
              Pay another bill
            </Button>
            <Button fullWidth onClick={goHome} {...agentProps('paybill-success-home')}>
              <Home size={16} aria-hidden />
              Back to home
            </Button>
          </>
        }
      />
    </div>
  )
}
