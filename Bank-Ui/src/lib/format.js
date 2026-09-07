/** The rupee prefix used everywhere. Digital banking here writes "Rs." not "₨". */
export const CURRENCY_PREFIX = 'Rs.'

// en-US grouping, not en-PK: local banking apps show 2,845,600 — never the
// lakh/crore grouping (28,45,600) that en-PK would produce.
const DECIMAL = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const WHOLE = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function toNumber(value) {
  const amount = typeof value === 'string' ? Number.parseFloat(value) : value
  return Number.isFinite(amount) ? amount : 0
}

/** "Rs. 284,650.00" — the canonical amount format used across the app. */
export function formatCurrency(value) {
  return `${CURRENCY_PREFIX} ${DECIMAL.format(toNumber(value))}`
}

/** "Rs. 284,650" — no decimals, for slider ends and chart labels. */
export function formatCurrencyShort(value) {
  return `${CURRENCY_PREFIX} ${WHOLE.format(toNumber(value))}`
}

/** "284,650" — the bare grouped number, when the prefix is already on screen. */
export function formatAmount(value) {
  return WHOLE.format(toNumber(value))
}

/** Signed amount for transaction rows, e.g. "+ Rs. 284,650.00". */
export function formatSigned(value, direction) {
  return `${direction === 'credit' ? '+' : '−'} ${formatCurrency(Math.abs(value))}`
}
// en-GB renders dates as "21 Mar 2024"; en-PK hyphenates them.
const DATE_FULL = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const DATE_SHORT = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
const DATE_DAY_MONTH = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const TIME_SHORT = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true })

/** "Thursday, 21 March 2024" — used by the dashboard eyebrow. */
export function formatFullDate(date) {
  return DATE_FULL.format(toDate(date))
}

/** "21 Mar 2024" */
export function formatDate(date) {
  return DATE_SHORT.format(toDate(date))
}

/** "21 Mar 2024 • 10:42 am" */
export function formatDateTime(date) {
  const parsed = toDate(date)
  return `${DATE_SHORT.format(parsed)} • ${TIME_SHORT.format(parsed)}`
}

/**
 * Human-friendly relative label with a time suffix, e.g. "Today, 10:42 am".
 * Falls back to an absolute date beyond yesterday.
 */
export function formatRelativeDateTime(date, now = new Date()) {
  const parsed = toDate(date)
  const days = dayDifference(parsed, now)
  const time = TIME_SHORT.format(parsed)
  if (days === 0) return `Today, ${time}`
  if (days === 1) return `Yesterday, ${time}`
  // Same-year dates drop the year so list rows do not truncate.
  const datePart =
    parsed.getFullYear() === now.getFullYear() ? DATE_DAY_MONTH.format(parsed) : DATE_SHORT.format(parsed)
  return `${datePart}, ${time}`
}

/** "2 hours ago" / "3 days ago" — used in the notifications list. */
export function formatTimeAgo(date, now = new Date()) {
  const minutes = Math.max(1, Math.round((now.getTime() - toDate(date).getTime()) / 60000))
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`
  return formatDate(date)
}

/**
 * Groups an already-masked account reference into readable blocks, e.g.
 * "PK•• BAHL •••• •••• •••1234". Input is never a real IBAN — see mock-data.
 */
export function formatIban(reference) {
  return reference
    .replace(/\s+/g, '')
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

/** Percentage with a single decimal only when it needs one. */
export function formatPercent(value) {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`
}

/** Strips everything but digits and a single decimal point, for amount inputs. */
export function sanitiseAmount(input) {
  const cleaned = input.replace(/[^\d.]/g, '')
  const [whole, ...rest] = cleaned.split('.')
  return rest.length ? `${whole}.${rest.join('').slice(0, 2)}` : whole
}

export function parseAmount(input) {
  const value = Number.parseFloat(input)
  return Number.isFinite(value) ? value : 0
}

function toDate(date) {
  return date instanceof Date ? date : new Date(date)
}

function dayDifference(date, now) {
  const a = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.round((b - a) / 86_400_000)
}
