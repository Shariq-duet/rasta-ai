/**
 * Instrumentation hooks carried over from the original prototype.
 *
 * The Vite build tagged interactive nodes with `data-agent-id` and broadcast the
 * active screen on `window.__AGENT_SCREEN__` plus an `AGENT_SCREEN_CHANGE` event —
 * the single integration point for the voice-agent / test harness. Both survive
 * here: `agentProps` emits the legacy attribute *and* a matching `data-testid`,
 * and `broadcastScreen` fires the identical global + event.
 */
/** Spread onto any interactive element: `<button {...agentProps('nav-home')}>`. */
export function agentProps(id) {
  return { 'data-agent-id': id, 'data-testid': id }
}

export const AGENT_SCREEN_EVENT = 'AGENT_SCREEN_CHANGE'

export function broadcastScreen(screen) {
  if (typeof window === 'undefined') return
  window.__AGENT_SCREEN__ = screen
  window.dispatchEvent(new CustomEvent(AGENT_SCREEN_EVENT, { detail: { screen } }))
}

/**
 * Route → screen id. The ids the prototype already published (`home-screen`,
 * `sendmoney-confirm-screen`, …) are preserved verbatim so any existing harness
 * keeps matching; screens added in this rebuild get new ids in the same style.
 * Ordered longest-prefix-first so nested routes resolve before their parents.
 */
const SCREEN_BY_ROUTE = [
  ['/login', 'login-screen'],
  ['/dashboard', 'home-screen'],
  ['/cards', 'cards-screen'],
  ['/analytics', 'analytics-screen'],
  ['/transfer/beneficiaries/new', 'beneficiary-add-screen'],
  ['/transfer/beneficiaries', 'beneficiaries-screen'],
  ['/transfer/confirm', 'sendmoney-confirm-screen'],
  ['/transfer/success', 'sendmoney-success-screen'],
  ['/transfer', 'sendmoney-screen'],
  ['/bills/confirm', 'paybill-confirm-screen'],
  ['/bills/success', 'paybill-success-screen'],
  ['/bills', 'paybill-screen'],
  ['/qr-pay', 'qr-pay-screen'],
  ['/statements', 'statements-screen'],
  ['/cheque-book', 'cheque-book-screen'],
  ['/certificates', 'certificates-screen'],
  ['/locator', 'locator-screen'],
  ['/notifications', 'notifications-screen'],
  ['/profile/security', 'profile-security-screen'],
  ['/profile/notifications', 'profile-notifications-screen'],
  ['/profile', 'profile-screen'],
]

export function screenIdForPath(pathname) {
  if (pathname.startsWith('/cards/') && pathname.length > '/cards/'.length) return 'card-detail-screen'
  const match = SCREEN_BY_ROUTE.slice()
    .sort((a, b) => b[0].length - a[0].length)
    .find(([route]) => pathname === route || pathname.startsWith(`${route}/`))
  return match ? match[1] : 'home-screen'
}
