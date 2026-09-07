/** Minimal class-name joiner — keeps conditional Tailwind lists readable. */
export function cn(...values) {
  const out = []
  for (const value of values) {
    if (!value || value === true) continue
    if (Array.isArray(value)) {
      const nested = cn(...value)
      if (nested) out.push(nested)
    } else {
      out.push(String(value))
    }
  }
  return out.join(' ')
}
