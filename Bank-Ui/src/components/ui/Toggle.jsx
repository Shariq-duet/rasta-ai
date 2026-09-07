'use client'

import { useId } from 'react'
import { cn } from '@/lib/cn'

export function Toggle({ checked, onChange, label, disabled, className, ...props }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors duration-200 disabled:opacity-50',
        checked ? 'bg-brand-600' : 'bg-[#dce1eb]',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          'block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  )
}

/** A settings row: title, supporting copy and a switch, all labelled together. */
export function ToggleRow({ title, description, checked, onChange, icon, disabled, ...props }) {
  const titleId = useId()
  return (
    <div className="flex items-center gap-3 py-3.5">
      {icon ? (
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p id={titleId} className="type-row-title">
          {title}
        </p>
        {description ? <p className="mt-0.5 type-secondary">{description}</p> : null}
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} disabled={disabled} {...props} />
    </div>
  )
}
