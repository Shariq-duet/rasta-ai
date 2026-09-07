/**
 * Shared active-route test so the bottom tab bar and the desktop sidebar
 * highlight exactly the same item for a given pathname.
 */
export function isRouteActive(pathname, item) {
  const prefixes = item.matches ?? [item.href]
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}
