'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { ROUTES } from '@/lib/constants'
import { BANK_OPTIONS } from '@/lib/mock-data'
import { formatAmount, parseAmount, sanitiseAmount } from '@/lib/format'
import { useBankStore } from '@/hooks/use-bank-store'
import { Button, Card, Input, Select, ToggleRow } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
/** All client state — the new payee lives in the Zustand store only. */
export default function AddBeneficiaryPage() {
  const router = useRouter()
  const addBeneficiary = useBankStore((state) => state.addBeneficiary)
  const [name, setName] = useState('')
  const [bank, setBank] = useState('Zenith Bank')
  const [iban, setIban] = useState('')
  const [limit, setLimit] = useState('250000')
  const [raast, setRaast] = useState(true)
  const cleanIban = iban.replace(/\s+/g, '').toUpperCase()
  const ibanValid = cleanIban.length >= 16
  const ibanError = iban.length > 0 && !ibanValid ? 'Enter the full 24-character IBAN' : undefined
  const canSubmit = name.trim().length > 1 && ibanValid && parseAmount(limit) > 0
  const onSubmit = (event) => {
    event.preventDefault()
    if (!canSubmit) return
    addBeneficiary({
      name: name.trim(),
      bank,
      iban: cleanIban,
      maskedNumber: `••• ${cleanIban.slice(-4)}`,
      transferLimit: parseAmount(limit),
      raastEnabled: raast,
      favourite: false,
    })
    router.push(ROUTES.beneficiaries)
  }
  return (
    <div className="flex flex-col gap-4 lg:mx-auto lg:w-full lg:max-w-2xl">
      <PageHeader eyebrow="Payees" subtitle="Saved to this device only — nothing leaves the demo." />

      <Card>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <Input
            label="Beneficiary name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Hassan Raza"
            autoComplete="off"
            required
            {...agentProps('beneficiary-name-input')}
          />

          <Select
            label="Bank"
            value={bank}
            onChange={(event) => setBank(event.target.value)}
            options={BANK_OPTIONS.map((entry) => ({ value: entry, label: entry }))}
            {...agentProps('beneficiary-bank-select')}
          />

          <Input
            label="IBAN or account number"
            value={iban}
            onChange={(event) => setIban(event.target.value)}
            placeholder="PK36ALHB0000001123456702"
            autoComplete="off"
            error={ibanError}
            hint="24 characters, starting with PK"
            required
            {...agentProps('beneficiary-iban-input')}
          />

          <Input
            label="Daily transfer limit"
            inputMode="numeric"
            value={limit}
            leading="PKR"
            hint={`Currently ${formatAmount(parseAmount(limit))} per day`}
            onChange={(event) => setLimit(sanitiseAmount(event.target.value))}
            {...agentProps('beneficiary-limit-input')}
          />

          <div className="border-t border-line">
            <ToggleRow
              title="Enable Raast transfers"
              description="Instant, free settlement where the payee supports it"
              checked={raast}
              onChange={setRaast}
              {...agentProps('beneficiary-raast-toggle')}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            fullWidth
            disabled={!canSubmit}
            {...agentProps('beneficiary-submit')}
          >
            <UserPlus size={17} aria-hidden />
            Save beneficiary
          </Button>
        </form>
      </Card>
    </div>
  )
}
