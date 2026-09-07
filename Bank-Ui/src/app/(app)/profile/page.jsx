'use client'

import {
  BadgeCheck,
  Bell,
  BookText,
  FileSpreadsheet,
  LogOut,
  MapPin,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { BANK_DISCLAIMER, ROUTES } from '@/lib/constants'
import { CUSTOMER } from '@/lib/mock-data'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, Badge, Button, Card, ListRowLink } from '@/components/ui'
const ACCOUNT_LINKS = [
  {
    href: ROUTES.profileSecurity,
    label: 'Security & privacy',
    icon: ShieldCheck,
    agentId: 'profile-security',
  },
  {
    href: ROUTES.profileNotifications,
    label: 'Notification settings',
    icon: Bell,
    agentId: 'profile-notifications',
  },
  { href: ROUTES.beneficiaries, label: 'Beneficiaries', icon: Users, agentId: 'profile-beneficiaries' },
]
const SERVICE_LINKS = [
  { href: ROUTES.statements, label: 'Statements', icon: FileSpreadsheet, agentId: 'profile-statements' },
  { href: ROUTES.chequeBook, label: 'Cheque services', icon: BookText, agentId: 'profile-cheque-book' },
  { href: ROUTES.certificates, label: 'Certificates', icon: BadgeCheck, agentId: 'profile-certificates' },
  { href: ROUTES.locator, label: 'Branch & ATM locator', icon: MapPin, agentId: 'profile-locator' },
]

export default function ProfilePage() {
  const { signOut } = useAuth()
  return (
    <div className="flex flex-col gap-4 lg:mx-auto lg:w-full lg:max-w-4xl lg:gap-6">
      <Card className="flex items-center gap-4 p-4">
        <Avatar initials={CUSTOMER.initials} tone="peach" size="xl" />
        <div className="min-w-0 flex-1">
          <h2 className="heading-md truncate">{CUSTOMER.name}</h2>
          <p className="mt-0.5 truncate type-secondary">{CUSTOMER.email}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone="accent">{CUSTOMER.tier}</Badge>
            <Badge tone="neutral">Member since {CUSTOMER.memberSince}</Badge>
          </div>
        </div>
      </Card>

      <Card padded={false} className="px-3 py-1">
        <h2 className="flex items-center gap-1.5 px-2 pb-1 pt-3 eyebrow">
          <UserRound size={12} aria-hidden />
          Personal details
        </h2>
        <dl className="divide-y divide-line">
          {[
            ['Registered mobile', CUSTOMER.phone],
            ['CNIC', CUSTOMER.cnic],
            ['City', CUSTOMER.city],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 px-2 py-3">
              <dt className="type-label">{label}</dt>
              <dd className="text-xs font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card padded={false} className="px-3 py-1">
        <h2 className="px-2 pb-1 pt-3 eyebrow">Account</h2>
        <ul className="divide-y divide-line">
          {ACCOUNT_LINKS.map((link) => {
            const Icon = link.icon
            return (
              <li key={link.href}>
                <ListRowLink
                  href={link.href}
                  title={link.label}
                  chevron
                  agentId={link.agentId}
                  leading={
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon size={17} aria-hidden />
                    </span>
                  }
                />
              </li>
            )
          })}
        </ul>
      </Card>

      <Card padded={false} className="px-3 py-1">
        <h2 className="px-2 pb-1 pt-3 eyebrow">Services</h2>
        <ul className="divide-y divide-line">
          {SERVICE_LINKS.map((link) => {
            const Icon = link.icon
            return (
              <li key={link.href}>
                <ListRowLink
                  href={link.href}
                  title={link.label}
                  chevron
                  agentId={link.agentId}
                  leading={
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-100 text-accent-600">
                      <Icon size={17} aria-hidden />
                    </span>
                  }
                />
              </li>
            )
          })}
        </ul>
      </Card>

      <Button variant="danger" size="lg" fullWidth onClick={signOut} {...agentProps('profile-logout')}>
        <LogOut size={17} aria-hidden />
        Log out
      </Button>

      <p className="pb-2 text-center text-[0.625rem] leading-relaxed text-ink-faint">{BANK_DISCLAIMER}</p>
    </div>
  )
}
