import { cn } from '@/lib/cn'

/** The screen-level heading block: eyebrow, title, optional supporting copy. */
export function PageHeader({ eyebrow, title, subtitle, action, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        {eyebrow ? <p className={cn('eyebrow', title && 'mb-1.5')}>{eyebrow}</p> : null}
        {title ? <h2 className="heading-lg">{title}</h2> : null}
        {subtitle ? (
          <p className={cn('text-xs leading-relaxed text-ink-muted', (title || eyebrow) && 'mt-1.5')}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 pt-0.5">{action}</div> : null}
    </div>
  )
}
