import { cn } from '@/lib/cn'
import { BANK_NAME } from '@/lib/constants'
const GLYPH_SIZES = {
  sm: 'h-7 w-7 text-[0.8125rem]',
  md: 'h-8 w-8 text-[0.9375rem]',
  lg: 'h-11 w-11 text-xl',
}
const NAME_SIZES = {
  sm: 'text-sm',
  md: 'text-[0.9375rem]',
  lg: 'text-xl',
}

/**
 * The bank wordmark: a cyan-edged monogram beside the name. Fictionalised
 * identity — no real bank logo or trademark is reproduced.
 */
export function BrandMark({ inverted, size = 'md', showName = true, className }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        aria-hidden
        className={cn(
          'grid place-items-center rounded-[10px_10px_10px_3px] font-display font-extrabold shadow-sm ring-1',
          GLYPH_SIZES[size],
          inverted
            ? 'bg-white/15 text-accent-200 ring-white/25'
            : 'bg-brand-600 text-accent-200 ring-brand-700/20',
        )}
      >
        ZB
      </span>
      {showName ? (
        <span
          className={cn(
            'font-display font-extrabold tracking-[-0.03em]',
            NAME_SIZES[size],
            inverted ? 'text-white' : 'text-ink',
          )}
        >
          {BANK_NAME}
        </span>
      ) : null}
      <span className="sr-only">{BANK_NAME}</span>
    </span>
  )
}
