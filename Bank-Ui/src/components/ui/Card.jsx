import { cn } from '@/lib/cn'

export function Card({ children, className, interactive, padded = true, as: Tag = 'section', ...rest }) {
  return (
    <Tag
      className={cn(
        'surface-card transition-shadow duration-200',
        padded && 'p-4',
        interactive && 'hover:shadow-deep',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/** Eyebrow + title on the left, an optional link or control on the right. */
export function SectionHeading({ eyebrow, title, action, className }) {
  return (
    <div className={cn('flex items-end justify-between gap-3', className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow mb-1">{eyebrow}</p> : null}
        <h2 className="heading-md truncate">{title}</h2>
      </div>
      {action}
    </div>
  )
}
