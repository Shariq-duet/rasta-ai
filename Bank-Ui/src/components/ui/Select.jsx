'use client'

import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { FieldShell } from './Input'

export function Select({ label, options, hint, error, placeholder, className, id, ...props }) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  return (
    <FieldShell label={label} htmlFor={fieldId} hint={hint} error={error}>
      <div className="relative">
        <select
          id={fieldId}
          aria-invalid={error ? true : undefined}
          className={cn(
            'h-11 w-full appearance-none rounded-xl border border-line bg-surface pl-3.5 pr-10 text-[0.8125rem] text-ink transition-colors focus:border-brand-400',
            error && 'border-danger-500',
            className,
          )}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
        />
      </div>
    </FieldShell>
  )
}
