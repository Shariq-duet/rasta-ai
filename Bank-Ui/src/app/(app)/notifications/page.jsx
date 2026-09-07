'use client'

import { ArrowLeftRight, BellOff, Megaphone, ShieldAlert, Info } from 'lucide-react'
import { cn } from '@/lib/cn'
import { agentProps } from '@/lib/agent'
import { formatTimeAgo } from '@/lib/format'
import { TODAY } from '@/lib/mock-data'
import { useBankStore } from '@/hooks/use-bank-store'
import { Button, Card, EmptyState } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
const KIND_ICON = {
  transaction: ArrowLeftRight,
  security: ShieldAlert,
  promo: Megaphone,
  system: Info,
}
const KIND_TONE = {
  transaction: 'bg-positive-50 text-positive-500',
  security: 'bg-danger-50 text-danger-600',
  promo: 'bg-accent-100 text-accent-600',
  system: 'bg-brand-50 text-brand-600',
}

export default function NotificationsPage() {
  const notifications = useBankStore((state) => state.notifications)
  const markNotificationRead = useBankStore((state) => state.markNotificationRead)
  const markAllNotificationsRead = useBankStore((state) => state.markAllNotificationsRead)
  const unread = notifications.filter((entry) => !entry.read).length
  return (
    <div className="flex flex-col gap-4 lg:mx-auto lg:w-full lg:max-w-2xl">
      <PageHeader
        eyebrow="Alerts"
        subtitle={unread > 0 ? `${unread} unread` : 'You are all caught up'}
        action={
          unread > 0 ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={markAllNotificationsRead}
              {...agentProps('notifications-mark-all-read')}
            >
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BellOff size={20} />}
            title="No notifications"
            description="Transaction and security alerts will show up here."
          />
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {notifications.map((notification) => {
            const Icon = KIND_ICON[notification.kind]
            return (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => markNotificationRead(notification.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors',
                    notification.read
                      ? 'border-line bg-surface hover:bg-canvas'
                      : 'border-brand-200 bg-brand-50/60 hover:bg-brand-50',
                  )}
                  {...agentProps(`notification-${notification.id}`)}
                >
                  <span
                    className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                      KIND_TONE[notification.kind],
                    )}
                  >
                    <Icon size={18} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="type-row-title">{notification.title}</span>
                      {!notification.read ? (
                        <span
                          aria-label="Unread"
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600"
                        />
                      ) : null}
                    </span>
                    <span className="mt-1 block text-[0.6875rem] leading-relaxed text-ink-muted">
                      {notification.body}
                    </span>
                    <span className="mt-1.5 block type-caption">
                      {formatTimeAgo(notification.timestamp, TODAY)}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
