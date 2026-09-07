import { cn } from '@/lib/cn'
const TONES = {
  brand: 'bg-brand-50 text-brand-700',
  accent: 'bg-accent-100 text-accent-600',
  positive: 'bg-positive-50 text-positive-500',
  neutral: 'bg-canvas text-ink-muted',
  danger: 'bg-danger-50 text-danger-600',
  sky: 'bg-[#e5eefb] text-[#3d6bb5]',
}

export function Badge({ children, tone = 'neutral', icon, className }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-2xs font-semibold',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}
