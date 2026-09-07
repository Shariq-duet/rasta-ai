import { Nfc } from 'lucide-react'
import { cn } from '@/lib/cn'
import { agentProps } from '@/lib/agent'
import { BANK_NAME } from '@/lib/constants'

export function DebitCardVisual({ card, size = 'md', className }) {
  const frozen = card.status === 'frozen'
  const blocked = card.status === 'blocked'
  return (
    <div
      className={cn(
        'relative isolate overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-white shadow-brand transition-all duration-300',
        card.gradient,
        size === 'sm' ? 'h-[11.5rem]' : 'h-[13rem]',
        (frozen || blocked) && 'saturate-[0.35]',
        className,
      )}
      {...agentProps(`card-visual-${card.id}`)}
    >
      <span
        aria-hidden
        className="absolute -right-20 -bottom-32 h-64 w-64 rounded-full border border-white/10"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-br from-white/12 to-transparent" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-[0.8125rem] font-extrabold tracking-tight">{BANK_NAME}</p>
            <p className="mt-0.5 text-[0.625rem] text-white/60">{card.label}</p>
          </div>
          <span className="text-[0.8125rem] font-bold italic">{card.network}</span>
        </div>

        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-7 w-10 rounded-md bg-gradient-to-br from-accent-200 to-accent-500 shadow-inner"
          />
          {card.contactlessEnabled ? <Nfc size={18} aria-hidden className="text-white/60" /> : null}
        </div>

        <div>
          <p
            className={cn(
              'font-display font-semibold tracking-[0.12em]',
              size === 'sm' ? 'text-sm' : 'text-base',
            )}
          >
            {card.maskedNumber}
          </p>
          <div className="mt-2.5 flex items-end justify-between gap-3 text-[0.625rem] uppercase tracking-wide text-white/65">
            <span className="truncate">{card.holder}</span>
            <span>
              <span className="mr-1 text-white/45">Valid thru</span>
              {card.expiry}
            </span>
          </div>
        </div>
      </div>

      {frozen || blocked ? (
        <div className="absolute inset-0 grid place-items-center bg-ink/45 backdrop-blur-[2px]">
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-2xs font-bold uppercase tracking-wide text-ink">
            {blocked ? 'Card blocked' : 'Card frozen'}
          </span>
        </div>
      ) : null}
    </div>
  )
}
