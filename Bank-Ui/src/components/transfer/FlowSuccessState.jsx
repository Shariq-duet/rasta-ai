import { Check } from 'lucide-react'
import { Card } from '@/components/ui'

/** Shared confirmation screen for transfers, bill payments and QR payments. */
export function FlowSuccessState({ title, message, reference, details, actions }) {
  return (
    <Card className="text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-positive-50 text-positive-500 animate-pop-in">
        <Check size={26} strokeWidth={2.6} aria-hidden />
      </span>
      <h2 className="mt-4 heading-md">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-[19rem] text-xs leading-relaxed text-ink-muted">{message}</p>
      {reference ? (
        <p className="mt-2 text-[0.625rem] font-semibold uppercase tracking-wide text-ink-faint">
          Ref {reference}
        </p>
      ) : null}
      {details ? <div className="mt-5 text-left">{details}</div> : null}
      <div className="mt-5 flex gap-2">{actions}</div>
    </Card>
  )
}
