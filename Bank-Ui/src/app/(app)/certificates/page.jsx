'use client'

import { useEffect, useState } from 'react'
import { BadgeCheck, FileText, Home, Landmark, Receipt } from 'lucide-react'
import { agentProps, broadcastScreen } from '@/lib/agent'
import { ROUTES } from '@/lib/constants'
import { CUSTOMER } from '@/lib/mock-data'
import { useAccounts, useBankStore } from '@/hooks/use-bank-store'
import { Button, ButtonLink, Card, Select } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { FlowSuccessState } from '@/components/transfer/FlowSuccessState'
import { ReviewList } from '@/components/transfer/ReviewList'
const CERTIFICATES = [
  {
    id: 'balance',
    label: 'Balance certificate',
    description: 'Confirms your closing balance on a given date — often needed for visas.',
    icon: Landmark,
    turnaround: '1 working day',
  },
  {
    id: 'tax',
    label: 'Tax deduction certificate',
    description: 'Withholding tax deducted during a financial year, for your tax return.',
    icon: Receipt,
    turnaround: '2 working days',
  },
  {
    id: 'account-maintenance',
    label: 'Account maintenance certificate',
    description: 'Confirms the account is active and in good standing.',
    icon: FileText,
    turnaround: '1 working day',
  },
]
const PERIODS = [
  { value: '2023-2024', label: 'FY 2023–2024' },
  { value: '2022-2023', label: 'FY 2022–2023' },
  { value: '2021-2022', label: 'FY 2021–2022' },
]
const DELIVERY = [
  { value: 'email', label: 'Email as PDF' },
  { value: 'branch', label: 'Collect from branch' },
  { value: 'courier', label: 'Courier to registered address' },
]

export default function CertificatesPage() {
  const accounts = useAccounts()
  const selectedAccountId = useBankStore((state) => state.selectedAccountId)
  const [selected, setSelected] = useState('balance')
  const [accountId, setAccountId] = useState(selectedAccountId)
  const [period, setPeriod] = useState(PERIODS[0].value)
  const [delivery, setDelivery] = useState('email')
  const [submitted, setSubmitted] = useState(false)
  const account = accounts.find((entry) => entry.id === accountId) ?? accounts[0]
  const certificate = CERTIFICATES.find((entry) => entry.id === selected) ?? CERTIFICATES[0]
  const reference = `CRT${Math.floor(10_000_000 + Math.random() * 89_999_999)}`
  // Success is internal state (no route change) — broadcast it so the voice
  // agent can end its guided flow and highlight the "Back to home" button.
  useEffect(() => {
    broadcastScreen(submitted ? 'certificate-success-screen' : 'certificates-screen')
  }, [submitted])
  if (submitted) {
    return (
      <div className="flex flex-col gap-4 pt-4 lg:mx-auto lg:w-full lg:max-w-2xl">
        <FlowSuccessState
          title="Request received"
          message={
            <>
              Your {certificate.label.toLowerCase()} will be ready in {certificate.turnaround}.
              {delivery === 'email' ? ` We will send it to ${CUSTOMER.email}.` : ''}
            </>
          }
          reference={reference}
          details={
            <ReviewList
              items={[
                { label: 'Certificate', value: certificate.label, agentId: 'certificate-success-type' },
                {
                  label: 'Account',
                  value: `${account.nickname} ${account.maskedNumber}`,
                  agentId: 'certificate-success-account',
                },
                {
                  label: 'Period',
                  value: PERIODS.find((entry) => entry.value === period)?.label ?? period,
                  agentId: 'certificate-success-period',
                },
                {
                  label: 'Delivery',
                  value: DELIVERY.find((entry) => entry.value === delivery)?.label ?? delivery,
                  agentId: 'certificate-success-delivery',
                },
              ]}
            />
          }
          actions={
            <>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setSubmitted(false)}
                {...agentProps('certificate-success-another')}
              >
                New request
              </Button>
              <ButtonLink href={ROUTES.dashboard} fullWidth {...agentProps('certificate-success-home')}>
                <Home size={16} aria-hidden />
                Back to home
              </ButtonLink>
            </>
          }
        />
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-4">
      <PageHeader eyebrow="Documents" subtitle="Order an official document for your records." />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
        <fieldset>
          <legend className="eyebrow mb-2">Choose a certificate</legend>
          <ul className="flex flex-col gap-2">
            {CERTIFICATES.map((entry) => {
              const Icon = entry.icon
              const active = entry.id === selected
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(entry.id)}
                    aria-pressed={active}
                    className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors ${active ? 'border-brand-300 bg-brand-50' : 'border-line bg-surface hover:bg-canvas'}`}
                    {...agentProps(`certificate-option-${entry.id}`)}
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${active ? 'bg-brand-600 text-accent-200' : 'bg-canvas text-ink-muted'}`}
                    >
                      <Icon size={18} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block type-row-title">{entry.label}</span>
                      <span className="mt-0.5 block text-[0.6875rem] leading-relaxed text-ink-muted">
                        {entry.description}
                      </span>
                      <span className="mt-1 block text-[0.625rem] font-semibold text-brand-600">
                        Ready in {entry.turnaround}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </fieldset>

        <Card>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              setSubmitted(true)
            }}
          >
            <Select
              label="Account"
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              options={accounts.map((entry) => ({
                value: entry.id,
                label: `${entry.nickname} ${entry.maskedNumber}`,
              }))}
              {...agentProps('certificate-account-select')}
            />
            <Select
              label="Period"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              options={PERIODS}
              {...agentProps('certificate-period-select')}
            />
            <Select
              label="Delivery"
              value={delivery}
              onChange={(event) => setDelivery(event.target.value)}
              options={DELIVERY}
              hint="Charges apply as per the schedule of charges."
              {...agentProps('certificate-delivery-select')}
            />
            <Button type="submit" size="lg" fullWidth {...agentProps('certificate-submit')}>
              <BadgeCheck size={17} aria-hidden />
              Request certificate
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
