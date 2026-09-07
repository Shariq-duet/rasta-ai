'use client'

import { useId } from 'react'
import { cn } from '@/lib/cn'
const FIELD =
  'h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[0.8125rem] text-ink placeholder:text-ink-faint transition-colors focus:border-brand-400 disabled:bg-canvas disabled:text-ink-muted read-only:bg-canvas read-only:text-ink-muted'

/** Shared label + hint + error wrapper so every form field is announced the same way. */
export function FieldShell({ label, htmlFor, hint, error, children, className }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="type-label">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[0.6875rem] font-medium text-danger-600">{error}</p>
      ) : hint ? (
        <p className="text-[0.6875rem] text-ink-faint">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({ label, hint, error, leading, trailing, className, wrapperClassName, id, ...props }) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  if (!leading && !trailing) {
    return (
      <FieldShell label={label} htmlFor={fieldId} hint={hint} error={error} className={wrapperClassName}>
        <input
          id={fieldId}
          aria-invalid={error ? true : undefined}
          className={cn(FIELD, error && 'border-danger-500', className)}
          {...props}
        />
      </FieldShell>
    )
  }
  return (
    <FieldShell label={label} htmlFor={fieldId} hint={hint} error={error} className={wrapperClassName}>
      <div
        className={cn(
          'flex h-11 items-center rounded-xl border border-line bg-surface transition-colors focus-within:border-brand-400',
          error && 'border-danger-500',
        )}
      >
        {leading ? (
          <span className="pl-3.5 type-row-title-muted">{leading}</span>
        ) : null}
        <input
          id={fieldId}
          aria-invalid={error ? true : undefined}
          className={cn(
            'h-full min-w-0 flex-1 rounded-xl bg-transparent px-3.5 text-[0.8125rem] text-ink placeholder:text-ink-faint focus:outline-none',
            leading && 'pl-2',
            className,
          )}
          {...props}
        />
        {trailing}
      </div>
    </FieldShell>
  )
}
