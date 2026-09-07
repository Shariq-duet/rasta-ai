'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, Building2, ShieldCheck, Wallet } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { ROUTES } from '@/lib/constants'
import { formatCurrency, parseAmount, sanitiseAmount } from '@/lib/format'
import { useAccounts, useBankStore, useSelectedAccount } from '@/hooks/use-bank-store'
import { Badge, Button, Card, Input, Select, Tabs } from '@/components/ui'
import { BeneficiaryPicker } from './BeneficiaryPicker'
const MODES = [
  { value: 'ibft', label: 'Other bank', icon: <Building2 size={14} aria-hidden /> },
  { value: 'own', label: 'Own account', icon: <Wallet size={14} aria-hidden /> },
]
const QUICK_AMOUNTS = [5_000, 10_000, 25_000, 50_000]

export function TransferForm() {
  const router = useRouter()
  const accounts = useAccounts()
  const selectedAccount = useSelectedAccount()
  const transfer = useBankStore((state) => state.transfer)
  const setTransfer = useBankStore((state) => state.setTransfer)
  const setTransferMode = useBankStore((state) => state.setTransferMode)
  const beneficiaries = useBankStore((state) => state.beneficiaries)
  const beneficiary = beneficiaries.find((entry) => entry.id === transfer.beneficiaryId) ?? null
  const fromAccount = accounts.find((entry) => entry.id === transfer.fromAccountId) ?? selectedAccount
  const amount = parseAmount(transfer.amount)
  const destinations = accounts.filter((entry) => entry.id !== transfer.fromAccountId)
  const overLimit = transfer.mode === 'ibft' && beneficiary ? amount > beneficiary.transferLimit : false
  const overBalance = amount > fromAccount.availableBalance
  const missingTarget = transfer.mode === 'ibft' ? !beneficiary : !transfer.toAccountId
  const canContinue = amount > 0 && !overLimit && !overBalance && !missingTarget
  const amountError = overLimit
    ? `Above this payee's ${formatCurrency(beneficiary?.transferLimit ?? 0)} limit`
    : overBalance
      ? 'More than the available balance'
      : undefined
  const onModeChange = (mode) => {
    setTransferMode(mode)
    if (mode === 'own' && !transfer.toAccountId) {
      setTransfer({ toAccountId: destinations[0]?.id ?? null })
    }
  }
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">Step 1 of 2</p>
          <h2 className="heading-md">Transfer details</h2>
        </div>
        <Badge tone="positive" icon={<ShieldCheck size={12} aria-hidden />}>
          Secure
        </Badge>
      </div>

      <Tabs
        items={MODES}
        value={transfer.mode}
        onChange={onModeChange}
        agentId="transfer-mode"
        ariaLabel="Transfer type"
        className="mt-4"
      />

      <form
        className="mt-4 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (canContinue) router.push(ROUTES.transferConfirm)
        }}
      >
        <Select
          label="From account"
          value={transfer.fromAccountId}
          onChange={(event) => setTransfer({ fromAccountId: event.target.value })}
          options={accounts.map((account) => ({
            value: account.id,
            label: `${account.nickname} ${account.maskedNumber}`,
          }))}
          hint={`${formatCurrency(fromAccount.availableBalance)} available`}
          {...agentProps('sendmoney-from-input')}
        />

        {transfer.mode === 'ibft' ? (
          <BeneficiaryPicker
            value={transfer.beneficiaryId}
            onChange={(beneficiaryId) => setTransfer({ beneficiaryId })}
          />
        ) : (
          <Select
            label="To account"
            value={transfer.toAccountId ?? ''}
            placeholder="Choose an account"
            onChange={(event) => setTransfer({ toAccountId: event.target.value })}
            options={destinations.map((account) => ({
              value: account.id,
              label: `${account.nickname} ${account.maskedNumber}`,
            }))}
            {...agentProps('sendmoney-own-account-select')}
          />
        )}

        <div>
          <Input
            label="Amount"
            inputMode="decimal"
            value={transfer.amount}
            placeholder="0.00"
            leading="PKR"
            error={amountError}
            onChange={(event) => setTransfer({ amount: sanitiseAmount(event.target.value) })}
            {...agentProps('sendmoney-amount-input')}
          />
          <div className="mt-2 flex gap-2">
            {QUICK_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTransfer({ amount: String(preset) })}
                className="flex-1 rounded-lg border border-line bg-canvas py-1.5 text-[0.625rem] font-bold text-ink-muted transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                {...agentProps(`sendmoney-preset-${preset}`)}
              >
                {preset.toLocaleString('en-PK')}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Note (optional)"
          value={transfer.note}
          maxLength={40}
          placeholder="What is this for?"
          onChange={(event) => setTransfer({ note: event.target.value })}
          {...agentProps('sendmoney-note-input')}
        />

        <Button type="submit" size="lg" fullWidth disabled={!canContinue} {...agentProps('sendmoney-submit')}>
          Review transfer
          <ArrowRight size={17} aria-hidden />
        </Button>
      </form>
    </Card>
  )
}
