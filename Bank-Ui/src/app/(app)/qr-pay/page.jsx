'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Home, Image as ImageIcon, ScanLine, Store, Zap } from 'lucide-react'
import { agentProps, broadcastScreen } from '@/lib/agent'
import { ROUTES } from '@/lib/constants'
import { formatCurrency, parseAmount, sanitiseAmount } from '@/lib/format'
import { merchants } from '@/lib/mock-data'
import { useAccounts, useBankStore } from '@/hooks/use-bank-store'
import { Badge, Button, Card, Input, Select } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { QrPlaceholder } from '@/components/qr/QrPlaceholder'
import { ReviewList } from '@/components/transfer/ReviewList'
import { FlowSuccessState } from '@/components/transfer/FlowSuccessState'

/**
 * Mock scan-to-pay. There is no camera access: "scanning" simply picks one of
 * the demo merchants and moves the flow to the confirmation step.
 */
export default function QrPayPage() {
  const router = useRouter()
  const accounts = useAccounts()
  const qr = useBankStore((state) => state.qr)
  const setQr = useBankStore((state) => state.setQr)
  const selectMerchant = useBankStore((state) => state.selectMerchant)
  const resetQr = useBankStore((state) => state.resetQr)
  const selectedAccountId = useBankStore((state) => state.selectedAccountId)
  const [step, setStep] = useState('scan')
  const [fromAccountId, setFromAccountId] = useState(selectedAccountId)
  const [reference, setReference] = useState('')
  const amount = parseAmount(qr.amount)
  const fromAccount = accounts.find((entry) => entry.id === fromAccountId) ?? accounts[0]
  // The scan → confirm → success transition is internal state, not a route
  // change, so broadcast it ourselves — the voice agent's guided flow and its
  // auto-advance key off these screen ids.
  useEffect(() => {
    const screen = step === 'success' ? 'qrpay-success-screen' : step === 'confirm' ? 'qrpay-confirm-screen' : 'qr-pay-screen'
    broadcastScreen(screen)
  }, [step])
  const completePayment = () => {
    setReference(`QRP${Math.floor(100_000_000 + Math.random() * 899_999_999)}`)
    setStep('success')
  }
  const onScan = (merchant) => {
    selectMerchant(merchant)
    setStep('confirm')
  }
  const restart = () => {
    resetQr()
    setStep('scan')
  }
  if (step === 'success' && qr.merchant) {
    return (
      <div className="flex flex-col gap-4 pt-4">
        <FlowSuccessState
          title="Payment sent"
          message={
            <>
              You paid {formatCurrency(amount)} to <strong className="text-ink">{qr.merchant.name}</strong>.
            </>
          }
          reference={reference}
          details={
            <ReviewList
              items={[
                { label: 'Merchant', value: qr.merchant.name, agentId: 'qrpay-success-merchant' },
                {
                  label: 'Amount',
                  value: formatCurrency(amount),
                  agentId: 'qrpay-success-amount',
                  emphasis: true,
                },
                {
                  label: 'Paid from',
                  value: `${fromAccount.nickname} ${fromAccount.maskedNumber}`,
                  agentId: 'qrpay-success-from',
                },
              ]}
            />
          }
          actions={
            <>
              <Button
                variant="secondary"
                fullWidth
                onClick={restart}
                {...agentProps('qrpay-success-another')}
              >
                Scan another
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  resetQr()
                  router.push(ROUTES.dashboard)
                }}
                {...agentProps('qrpay-success-home')}
              >
                <Home size={16} aria-hidden />
                Back to home
              </Button>
            </>
          }
        />
      </div>
    )
  }
  if (step === 'confirm' && qr.merchant) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader eyebrow="Merchant payment" title="Confirm payment" />

        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Store size={19} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.9375rem] font-bold text-ink">{qr.merchant.name}</p>
              <p className="mt-0.5 truncate type-secondary">
                {qr.merchant.category} • {qr.merchant.city}
              </p>
            </div>
            <Badge tone="positive" icon={<Zap size={10} aria-hidden />}>
              Raast P2M
            </Badge>
          </div>

          <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              if (amount > 0) completePayment()
            }}
          >
            <Select
              label="Pay from"
              value={fromAccountId}
              onChange={(event) => setFromAccountId(event.target.value)}
              options={accounts.map((account) => ({
                value: account.id,
                label: `${account.nickname} ${account.maskedNumber}`,
              }))}
              hint={`${formatCurrency(fromAccount.availableBalance)} available`}
              {...agentProps('qrpay-from-select')}
            />

            <Input
              label="Amount"
              inputMode="decimal"
              value={qr.amount}
              leading="PKR"
              placeholder="0.00"
              autoFocus
              error={amount > fromAccount.availableBalance ? 'More than the available balance' : undefined}
              onChange={(event) => setQr({ amount: sanitiseAmount(event.target.value) })}
              {...agentProps('qrpay-amount-input')}
            />

            <Input
              label="Note (optional)"
              value={qr.note}
              maxLength={40}
              placeholder="What is this for?"
              onChange={(event) => setQr({ note: event.target.value })}
              {...agentProps('qrpay-note-input')}
            />

            <ReviewList
              items={[
                { label: 'Merchant ID', value: qr.merchant.merchantId, agentId: 'qrpay-confirm-merchant-id' },
                { label: 'Fee', value: 'Free', agentId: 'qrpay-confirm-fee' },
              ]}
            />

            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={restart} {...agentProps('qrpay-confirm-back')}>
                <ArrowLeft size={16} aria-hidden />
                Cancel
              </Button>
              <Button
                type="submit"
                fullWidth
                disabled={amount <= 0 || amount > fromAccount.availableBalance}
                {...agentProps('qrpay-confirm-approve')}
              >
                Pay {amount > 0 ? formatCurrency(amount) : ''}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Raast QR"
        title="Scan & pay"
        subtitle="Point your camera at a Raast merchant code to pay instantly."
      />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
        <Card className="flex flex-col items-center py-6">
          <div className="relative">
            <QrPlaceholder seed="zenith-demo-scanner" size={168} />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-3 rounded-2xl border-2 border-brand-600/70"
              style={{
                clipPath:
                  'polygon(0 0, 22% 0, 22% 4%, 4% 4%, 4% 22%, 0 22%, 0 78%, 4% 78%, 4% 96%, 22% 96%, 22% 100%, 78% 100%, 78% 96%, 96% 96%, 96% 78%, 100% 78%, 100% 22%, 96% 22%, 96% 4%, 78% 4%, 78% 0)',
              }}
            />
          </div>
          <p className="mt-4 text-center text-xs leading-relaxed text-ink-muted">
            The camera is off in this demo. Pick a sample merchant below to carry on.
          </p>
          <div className="mt-4 flex w-full gap-2">
            <Button variant="secondary" fullWidth size="sm" {...agentProps('qrpay-upload-image')}>
              <ImageIcon size={15} aria-hidden />
              Upload code
            </Button>
            <Button
              fullWidth
              size="sm"
              onClick={() => onScan(merchants[0])}
              {...agentProps('qrpay-simulate-scan')}
            >
              <ScanLine size={15} aria-hidden />
              Simulate scan
            </Button>
          </div>
        </Card>

        <section aria-labelledby="qr-merchants-heading">
          <div className="mb-3">
            <p className="eyebrow mb-1">Sample codes</p>
            <h2 id="qr-merchants-heading" className="heading-md">
              Nearby merchants
            </h2>
          </div>
          <ul className="flex flex-col gap-2">
            {merchants.map((merchant) => (
              <li key={merchant.id}>
                <button
                  type="button"
                  onClick={() => onScan(merchant)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-3 text-left transition-colors hover:border-brand-200 hover:bg-brand-50"
                  {...agentProps(`qrpay-merchant-${merchant.id}`)}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-100 text-accent-600">
                    <Store size={18} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate type-row-title">
                      {merchant.name}
                    </span>
                    <span className="mt-0.5 block truncate type-secondary">
                      {merchant.category} • {merchant.city}
                    </span>
                  </span>
                  <ScanLine size={16} aria-hidden className="shrink-0 text-brand-600" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
