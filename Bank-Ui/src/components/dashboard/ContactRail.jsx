'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Plus } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { ROUTES } from '@/lib/constants'
import { useBankStore } from '@/hooks/use-bank-store'
import { Avatar } from '@/components/ui'

/** Horizontal rail of saved payees — tapping one seeds the transfer draft. */
export function ContactRail() {
  const router = useRouter()
  const beneficiaries = useBankStore((state) => state.beneficiaries)
  const setTransfer = useBankStore((state) => state.setTransfer)
  const startTransfer = (beneficiaryId) => {
    setTransfer({ beneficiaryId, mode: 'ibft' })
    router.push(ROUTES.transfer)
  }
  return (
    <section aria-labelledby="quick-transfer-heading">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">Quick transfer</p>
          <h2 id="quick-transfer-heading" className="heading-md">
            Send money to
          </h2>
        </div>
        <Link
          href={ROUTES.beneficiaries}
          className="flex items-center gap-1 text-[0.6875rem] font-bold text-brand-600 transition-colors hover:text-brand-700"
          {...agentProps('home-contacts-manage')}
        >
          Manage
          <ChevronRight size={13} aria-hidden />
        </Link>
      </div>

      <ul className="no-scrollbar mt-3 flex gap-4 overflow-x-auto pb-1 pt-1">
        {beneficiaries.slice(0, 6).map((beneficiary) => (
          <li key={beneficiary.id}>
            <button
              type="button"
              onClick={() => startTransfer(beneficiary.id)}
              className="group flex w-[4.25rem] flex-col items-center gap-2"
              {...agentProps(`home-contact-${beneficiary.id}`)}
            >
              <Avatar
                initials={beneficiary.initials}
                tone={beneficiary.tone}
                size="lg"
                className="transition-transform duration-200 group-hover:scale-105 group-hover:shadow-card"
              />
              <span className="w-full truncate text-center text-[0.625rem] font-medium text-ink-muted">
                {beneficiary.name.split(' ')[0]}
              </span>
            </button>
          </li>
        ))}
        <li>
          <Link
            href={ROUTES.beneficiaryNew}
            className="group flex w-[4.25rem] flex-col items-center gap-2"
            {...agentProps('home-contact-add-new')}
          >
            <span className="grid h-12 w-12 place-items-center rounded-full border border-dashed border-brand-300 text-brand-600 transition-colors group-hover:border-brand-600 group-hover:bg-brand-50">
              <Plus size={18} aria-hidden />
            </span>
            <span className="text-[0.625rem] font-medium text-ink-muted">Add new</span>
          </Link>
        </li>
      </ul>
    </section>
  )
}
