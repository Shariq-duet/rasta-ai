'use client'

import { useEffect, useState } from 'react'
import { BookText, Home, Ban } from 'lucide-react'
import { agentProps, broadcastScreen } from '@/lib/agent'
import { ROUTES } from '@/lib/constants'
import { useAccounts, useBankStore } from '@/hooks/use-bank-store'
import { Button, ButtonLink, Card, Input, Select, Tabs } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { FlowSuccessState } from '@/components/transfer/FlowSuccessState'
import { ReviewList } from '@/components/transfer/ReviewList'
const TABS = [
  { value: 'request', label: 'Request book', icon: <BookText size={14} aria-hidden /> },
  { value: 'stop', label: 'Stop cheque', icon: <Ban size={14} aria-hidden /> },
]
const LEAF_OPTIONS = [
  { value: '25', label: '25 leaves' },
  { value: '50', label: '50 leaves' },
  { value: '100', label: '100 leaves' },
]
const STOP_REASONS = [
  { value: 'lost', label: 'Cheque lost' },
  { value: 'stolen', label: 'Cheque stolen' },
  { value: 'error', label: 'Written in error' },
  { value: 'dispute', label: 'Payment dispute' },
]

/** Both forms are mock: submitting only swaps in a local confirmation state. */
export default function ChequeBookPage() {
  const accounts = useAccounts()
  const selectedAccountId = useBankStore((state) => state.selectedAccountId)
  const [tab, setTab] = useState('request')
  const [submitted, setSubmitted] = useState(null)
  const [accountId, setAccountId] = useState(selectedAccountId)
  const [leaves, setLeaves] = useState('50')
  const [delivery, setDelivery] = useState('branch')
  const [chequeNumber, setChequeNumber] = useState('')
  const [reason, setReason] = useState('lost')
  const account = accounts.find((entry) => entry.id === accountId) ?? accounts[0]
  const reference = `CHQ${Math.floor(10_000_000 + Math.random() * 89_999_999)}`
  // Success is internal state (no route change) — broadcast it so the voice
  // agent can end its guided flow and highlight the "Back to home" button.
  useEffect(() => {
    broadcastScreen(submitted ? 'cheque-success-screen' : 'cheque-book-screen')
  }, [submitted])
  if (submitted) {
    const isRequest = submitted === 'request'
    return (
      <div className="flex flex-col gap-4 pt-4 lg:mx-auto lg:w-full lg:max-w-2xl">
        <FlowSuccessState
          title={isRequest ? 'Cheque book requested' : 'Stop instruction placed'}
          message={
            isRequest
              ? 'Your cheque book will be ready within 3 to 5 working days. We will notify you when it is available.'
              : 'The cheque has been marked as stopped. It will be declined if presented for payment.'
          }
          reference={reference}
          details={
            <ReviewList
              items={
                isRequest
                  ? [
                      {
                        label: 'Account',
                        value: `${account.nickname} ${account.maskedNumber}`,
                        agentId: 'cheque-success-account',
                      },
                      { label: 'Leaves', value: `${leaves} leaves`, agentId: 'cheque-success-leaves' },
                      {
                        label: 'Collection',
                        value: delivery === 'branch' ? account.branch : 'Courier to registered address',
                        agentId: 'cheque-success-delivery',
                      },
                    ]
                  : [
                      {
                        label: 'Account',
                        value: `${account.nickname} ${account.maskedNumber}`,
                        agentId: 'cheque-success-account',
                      },
                      {
                        label: 'Cheque no.',
                        value: chequeNumber,
                        agentId: 'cheque-success-number',
                        emphasis: true,
                      },
                      {
                        label: 'Reason',
                        value: STOP_REASONS.find((entry) => entry.value === reason)?.label ?? reason,
                        agentId: 'cheque-success-reason',
                      },
                    ]
              }
            />
          }
          actions={
            <>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setSubmitted(null)}
                {...agentProps('cheque-success-another')}
              >
                New request
              </Button>
              <ButtonLink href={ROUTES.dashboard} fullWidth {...agentProps('cheque-success-home')}>
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
    <div className="flex flex-col gap-4 lg:mx-auto lg:w-full lg:max-w-2xl">
      <PageHeader eyebrow="Cheque services" subtitle="Order a new book, or stop a cheque you have already issued." />

      <Tabs items={TABS} value={tab} onChange={setTab} agentId="cheque-tab" ariaLabel="Cheque service" />

      <Card>
        {tab === 'request' ? (
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              setSubmitted('request')
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
              {...agentProps('cheque-account-select')}
            />
            <Select
              label="Number of leaves"
              value={leaves}
              onChange={(event) => setLeaves(event.target.value)}
              options={LEAF_OPTIONS}
              {...agentProps('cheque-leaves-select')}
            />
            <Select
              label="Collection method"
              value={delivery}
              onChange={(event) => setDelivery(event.target.value)}
              options={[
                { value: 'branch', label: `Collect from ${account.branch}` },
                { value: 'courier', label: 'Courier to registered address' },
              ]}
              hint="Issuance charges apply as per the schedule of charges."
              {...agentProps('cheque-delivery-select')}
            />
            <Button type="submit" size="lg" fullWidth {...agentProps('cheque-request-submit')}>
              <BookText size={17} aria-hidden />
              Request cheque book
            </Button>
          </form>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              setSubmitted('stop')
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
              {...agentProps('cheque-stop-account-select')}
            />
            <Input
              label="Cheque number"
              inputMode="numeric"
              value={chequeNumber}
              placeholder="e.g. 0041237"
              onChange={(event) => setChequeNumber(event.target.value.replace(/\D/g, '').slice(0, 8))}
              hint="Found at the bottom left of the cheque leaf"
              required
              {...agentProps('cheque-stop-number-input')}
            />
            <Select
              label="Reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              options={STOP_REASONS}
              {...agentProps('cheque-stop-reason-select')}
            />
            <Button
              type="submit"
              size="lg"
              fullWidth
              variant="danger"
              disabled={chequeNumber.length < 4}
              {...agentProps('cheque-stop-submit')}
            >
              <Ban size={17} aria-hidden />
              Stop this cheque
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
