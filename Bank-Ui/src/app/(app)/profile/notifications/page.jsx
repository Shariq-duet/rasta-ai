'use client'

import { useState } from 'react'
import {
  ArrowLeftRight,
  CreditCard,
  Mail,
  Megaphone,
  MessageSquare,
  ShieldAlert,
  Smartphone,
} from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { Card, ToggleRow } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
const GROUPS = [
  {
    heading: 'Alerts',
    items: [
      {
        id: 'transactions',
        title: 'Transaction alerts',
        description: 'Every debit and credit on your accounts',
        icon: <ArrowLeftRight size={17} />,
        initial: true,
      },
      {
        id: 'card',
        title: 'Card activity',
        description: 'Card spend, declines and limit changes',
        icon: <CreditCard size={17} />,
        initial: true,
      },
      {
        id: 'security',
        title: 'Security alerts',
        description: 'Sign-ins, PIN changes and device activity',
        icon: <ShieldAlert size={17} />,
        initial: true,
      },
      {
        id: 'promotions',
        title: 'Offers and promotions',
        description: 'Product news and seasonal campaigns',
        icon: <Megaphone size={17} />,
        initial: false,
      },
    ],
  },
  {
    heading: 'Channels',
    items: [
      {
        id: 'push',
        title: 'Push notifications',
        description: 'In-app alerts on this device',
        icon: <Smartphone size={17} />,
        initial: true,
      },
      {
        id: 'sms',
        title: 'SMS',
        description: 'Sent to your registered mobile number',
        icon: <MessageSquare size={17} />,
        initial: true,
      },
      {
        id: 'email',
        title: 'Email',
        description: 'Summaries and statements by email',
        icon: <Mail size={17} />,
        initial: false,
      },
    ],
  },
]

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState(() =>
    Object.fromEntries(GROUPS.flatMap((group) => group.items.map((item) => [item.id, item.initial]))),
  )
  return (
    <div className="flex flex-col gap-4 lg:mx-auto lg:w-full lg:max-w-2xl">
      <PageHeader eyebrow="Account" subtitle="Choose what you hear about, and how it reaches you." />

      {GROUPS.map((group) => (
        <Card key={group.heading} padded={false} className="px-4">
          <h2 className="pb-1 pt-3 eyebrow">{group.heading}</h2>
          <div className="divide-y divide-line">
            {group.items.map((item) => (
              <ToggleRow
                key={item.id}
                title={item.title}
                description={item.description}
                icon={item.icon}
                checked={preferences[item.id]}
                onChange={(checked) => setPreferences((current) => ({ ...current, [item.id]: checked }))}
                {...agentProps(`notification-pref-${item.id}`)}
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
