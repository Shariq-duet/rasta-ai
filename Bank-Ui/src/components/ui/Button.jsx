import Link from 'next/link'
import { cn } from '@/lib/cn'
const VARIANTS = {
  primary:
    'bg-brand-600 text-white shadow-brand-glow hover:bg-brand-700 hover:-translate-y-px active:translate-y-0 disabled:bg-brand-200',
  secondary:
    'border border-line bg-surface text-ink hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700',
  ghost: 'bg-transparent text-brand-600 hover:bg-brand-50',
  accent: 'bg-accent-300 text-brand-900 hover:bg-accent-400',
  danger: 'border border-danger-500/30 bg-danger-50 text-danger-600 hover:bg-danger-500 hover:text-white',
}
const SIZES = {
  sm: 'h-9 gap-1.5 rounded-lg px-3 text-xs',
  md: 'h-11 gap-2 rounded-xl px-4 text-[0.8125rem]',
  lg: 'h-12 gap-2 rounded-xl px-5 text-sm',
}
const BASE =
  'inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:shadow-none'

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  children,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {children}
    </button>
  )
}

/** Same visual language as Button, but renders a real anchor for navigation. */
export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  children,
  ...props
}) {
  return (
    <Link
      href={href}
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {children}
    </Link>
  )
}
