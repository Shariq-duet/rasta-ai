'use client'

import { useState } from 'react'
import { Fingerprint, KeyRound, Laptop, MapPin, ShieldCheck, Smartphone } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { Badge, Button, Card, ToggleRow } from '@/components/ui'
import { useToast } from '@/hooks/use-toast'
import { Toast } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
const DEVICES = [
  { id: 'iphone', name: 'iPhone 15', detail: 'Karachi • Active now', icon: Smartphone, current: true },
  { id: 'windows', name: 'Chrome on Windows', detail: 'Karachi • 3 hours ago', icon: Laptop, current: false },
]

export default function SecurityPage() {
  const { toast, showToast, dismissToast } = useToast()
  const [biometric, setBiometric] = useState(true)
  const [twoFactor, setTwoFactor] = useState(true)
  const [loginAlerts, setLoginAlerts] = useState(true)
  const [maskBalance, setMaskBalance] = useState(false)
  return (
    <div className="flex flex-col gap-4 lg:mx-auto lg:w-full lg:max-w-2xl">
      <PageHeader eyebrow="Account" subtitle="Control how your account is protected." />

      <Card className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-positive-50 text-positive-500">
          <ShieldCheck size={20} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.8125rem] font-bold text-ink">Your account is well protected</p>
          <p className="mt-0.5 type-secondary">
            Biometrics and two-factor authentication are both switched on.
          </p>
        </div>
        <Badge tone="positive">Strong</Badge>
      </Card>

      <Card padded={false} className="px-4">
        <h2 className="pb-1 pt-3 eyebrow">Sign-in</h2>
        <div className="divide-y divide-line">
          <ToggleRow
            title="Biometric login"
            description="Sign in with Face ID or a fingerprint"
            icon={<Fingerprint size={17} />}
            checked={biometric}
            onChange={setBiometric}
            {...agentProps('security-biometric-toggle')}
          />
          <ToggleRow
            title="Two-factor authentication"
            description="Ask for an OTP on high-value payments"
            icon={<KeyRound size={17} />}
            checked={twoFactor}
            onChange={setTwoFactor}
            {...agentProps('security-2fa-toggle')}
          />
          <ToggleRow
            title="New sign-in alerts"
            description="Tell me when a new device signs in"
            icon={<MapPin size={17} />}
            checked={loginAlerts}
            onChange={setLoginAlerts}
            {...agentProps('security-login-alerts-toggle')}
          />
          <ToggleRow
            title="Hide balance by default"
            description="Keep amounts hidden until you tap to reveal"
            icon={<ShieldCheck size={17} />}
            checked={maskBalance}
            onChange={setMaskBalance}
            {...agentProps('security-mask-balance-toggle')}
          />
        </div>
      </Card>

      <Card padded={false} className="px-4">
        <h2 className="pb-2 pt-3 eyebrow">Trusted devices</h2>
        <ul className="divide-y divide-line">
          {DEVICES.map((device) => {
            const Icon = device.icon
            return (
              <li key={device.id} className="flex items-center gap-3 py-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-canvas text-ink-muted">
                  <Icon size={17} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate type-row-title">{device.name}</p>
                  <p className="mt-0.5 truncate type-secondary">{device.detail}</p>
                </div>
                {device.current ? (
                  <Badge tone="positive">This device</Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => showToast(`Signed out of ${device.name}`)}
                    {...agentProps(`security-revoke-${device.id}`)}
                  >
                    Sign out
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      </Card>

      <div className="flex flex-col gap-2">
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => showToast('We have emailed you a link to change your password')}
          {...agentProps('security-change-password')}
        >
          Change password
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => showToast('PIN reset requested — we will text you shortly')}
          {...agentProps('security-reset-pin')}
        >
          Reset transaction PIN
        </Button>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} agentId="security-toast" />
    </div>
  )
}
