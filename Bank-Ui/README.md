# Zenith Bank — Banking UI

A responsive, front-end-only banking prototype: a phone app below 1024px and a desktop banking portal above it, from one component tree. **Fictionalised for UI demonstration: Zenith Bank is not a real institution, and nothing here is affiliated with, endorsed by, or connected to any real bank.** No branding, trademarks or assets of any real bank are reproduced.

Every screen is client-rendered from local mock data. There is **no backend**: no API calls, no `fetch`, no server actions, no database, and no real authentication.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Sign-in accepts any input — the form only flips a client-side flag.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint, zero warnings tolerated |
| `npm run format` | Prettier over `src/` |

## Stack

Next.js 15 (App Router) · JavaScript (JSX) · Tailwind CSS · Zustand · lucide-react · Plus Jakarta Sans + Inter via `next/font`.

There is no TypeScript build step. Shape contracts live as JSDoc `@typedef`s in `src/lib/types.js`, so editors still give completion and hover docs — reference them with `@typedef {import('@/lib/types').Account} Account`. Path aliases come from `jsconfig.json`.

## Layout

One shell, two compositions — same components, routes, mock data and state; only the composition changes per breakpoint.

| | `< 1024px` (phone / tablet portrait) | `>= 1024px` (desktop) |
| --- | --- | --- |
| Navigation | Sticky bottom tab bar (5 tabs) | Persistent left `Sidebar`, grouped Banking / Services / Account |
| Branding | `TopBar` brand mark | Sidebar header (TopBar shows the screen title instead) |
| Account & logout | Avatar in the TopBar, logout on `/profile` | Pinned to the sidebar footer |
| Content width | 440px column, framed from `md` | Fills the space beside the sidebar, capped at `--content-width` (1360px) |
| Page grids | Single column | `lg:`/`xl:` grids — see below |
| Assistant FAB | Above the tab bar, aligned to the phone column | Bottom-right of the content column |

The sidebar also collapses to a 76px icon rail.

Desktop grids are Tailwind breakpoint utilities on the existing pages, not duplicated screens:

- **Dashboard** — three-column grid. Balance card spans two columns beside the monthly snapshot; quick actions become a full-width row; recent transactions span two columns and two rows beside the beneficiary rail and services grid. Source order is the phone order, rearranged purely with `lg:order-*`, so mobile is byte-for-byte unchanged.
- **Transfer** — form on the left with a live `TransferSummaryAside` review on the right (same `ReviewList` the confirm step uses).
- **Bills** — biller list beside the payment form.
- **Statements** — sticky filter/total column beside a wide transaction list.
- **Cards** — up to three cards per row; card detail splits visual + limit from the controls.
- **Analytics** — spend hero and budget on the left, category breakdown on the right.
- **Locator / QR pay / Certificates** — two-column split of picker and detail.
- **Flow and confirmation screens** — capped at a `max-w-2xl` reading column rather than stretched.

## Structure

```
src/
  app/
    layout.tsx              root layout, fonts, metadata
    globals.css             Tailwind base + design tokens
    page.tsx                redirects to /login or /dashboard
    login/                  auth screen
    (app)/                  authenticated shell (Sidebar | TopBar + page + BottomNav + AssistantFab)
      dashboard/  cards/[cardId]/  analytics/
      transfer/{confirm,success,beneficiaries/new}
      bills/{confirm,success}
      qr-pay/  statements/  cheque-book/  certificates/  locator/  notifications/
      profile/{security,notifications}
  components/
    ui/          Button, Input, Select, Card, Modal, Sheet, Toggle, Slider,
                 Badge, Avatar, Tabs, ListRow, Toast, EmptyState, Skeleton
    layout/      Sidebar, TopBar, BottomNav, AssistantFab, PageHeader
    auth/ dashboard/ cards/ analytics/ transfer/ bills/ chat/
    statements/ locator/ qr/ services/ common/
  lib/
    types.js     JSDoc typedefs: Account, Transaction, Beneficiary, Biller, BankCard, drafts, …
    mock-data.js every value the app displays
    format.js    "Rs." currency and relative-date formatters
    constants.js routes, nav items, sidebar groups, screen titles
    nav.js       shared active-route test for both navigations
    agent.js     test/agent instrumentation (see below)
    cn.js        class-name joiner
  hooks/         use-auth, use-bank-store, use-toast, use-lock-body-scroll
  store/         bank-store.js (Zustand)
```

## State

One Zustand store (`src/store/bank-store.js`) holds the mock session flag, selected account, beneficiaries, card controls, notifications, the transfer/bill/QR drafts and chat messages.

Persisted to `localStorage` (key `zenith-ui`): `isAuthenticated`, `selectedAccountId`, `showBalance` and `beneficiaries` — a payee you add survives a reload. Everything else is session-only by design: in-progress transfer/bill/QR drafts, chat history, card toggles and notification read state all start clean on load, and signing out restores the seed payee list.

Because saved beneficiaries outlive the tab, they get collision-safe ids (`crypto.randomUUID()`) rather than the in-memory counter used for chat messages, which would restart at 1 on reload and clash with a stored record. Auth-dependent redirects wait on a `hydrated` flag so the persisted value never causes a hydration mismatch.

## Design tokens

Defined as CSS variables in `globals.css` and mapped into `tailwind.config.ts`:

| Role | Token | Value | Used for |
| --- | --- | --- | --- |
| Primary | `brand-600` | `#3D3AC7` indigo | Primary actions, balance-card gradient, active nav (white on it is 8.0:1) |
| Accent | `accent-300` | `#22D3EE` cyan | Card chip, badges, decorative fills |
| Accent on dark | `accent-200` | `#A5F3FC` | Text and icons over the indigo gradient (6.4:1; `accent-300` only reaches 4.4:1) |
| Positive | `positive-400` | `#059669` emerald | Success fills, chart series |
| Positive text | `positive-500` | `#047857` | Credit amounts on white (5.6:1 — `#059669` would only reach 3.8:1) |
| Canvas / surface / line | | `#F7F8FC` / `#FFFFFF` / `#E8EBF2` | Backgrounds and hairlines |
| Ink | `ink` … `ink-faint` | `#17233E` … `#9BA4B6` | Text scale |

Scale names map to intent, so `accent-*` and `positive-*` can be re-pointed at a different identity without touching component code.

## Content

All data is fabricated. Names, account references, branch addresses and merchant activity are invented; account references are deliberately masked (`PK•• MEZN •••• •••• •••• 2091`) and are **not** valid IBANs. Branch areas are locally plausible but the street addresses are made up and correspond to no real premises.

- **Currency** — `Rs. 284,650.00`. Grouping is `en-US`, not `en-PK`, because local banking apps show `2,845,600` rather than the lakh/crore grouping (`28,45,600`) that `en-PK` produces.
- **Dates are relative to now.** `TODAY` in `mock-data.js` is `new Date()`, and every transaction, notification and bill due date is an offset from it, so the feed always reads as recent. This is safe from hydration mismatch because the authenticated shell renders a skeleton until the store rehydrates in the browser — no date-derived text is ever in the prerendered HTML.
- **The assistant computes its replies from the data** rather than storing prose with numbers baked in, so the figures it quotes always match what is on screen.

## Typography

A six-role scale defined once in `globals.css`, used everywhere instead of ad-hoc `text-*` per component:

| Role | Class | Setting |
| --- | --- | --- |
| Display | `.type-display` | Plus Jakarta Sans 800, 30px, −0.03em, tabular — balance figures |
| h1 | `.heading-lg` | Plus Jakarta Sans 800, 22px, −0.025em — page titles |
| h2 | `.heading-md` | Plus Jakarta Sans 700, 17px, −0.018em — section titles |
| h3 | `.heading-sm` | Plus Jakarta Sans 700, 15px, −0.012em — card titles |
| Body | `.type-body` / `.type-row-title` | Inter 400/600, 13px, normal tracking |
| Secondary | `.type-secondary` | Inter 400, 12px, `ink-muted` — dates, categories |
| Caption | `.type-caption` | Inter 400, 11px, `ink-faint` |
| Eyebrow | `.eyebrow` | Inter 700, 10px, uppercase, +0.085em |
| Amount | `.type-amount` / `.type-amount-lg` | 700 weight + `tabular-nums` so columns of money align |

Tracking tightens as type grows (headings negative, body normal) — the eyebrow is the only place it goes loose. Text sits in a consistent three-tier hierarchy: `ink` for primary, `ink-muted` for secondary, `ink-faint` for labels and placeholders. Form controls, placeholders and WebKit date-input internals are explicitly styled so nothing is left at a browser default.

## Instrumentation hooks

Carried forward from the original Vite prototype and preserved deliberately:

- **`agentProps(id)`** (`src/lib/agent.js`) spreads **both** `data-agent-id` and `data-testid` with the same value onto interactive elements, so any harness written against the old attribute keeps working.
- **`broadcastScreen(screen)`** sets `window.__AGENT_SCREEN__` and dispatches an `AGENT_SCREEN_CHANGE` `CustomEvent` on every route change, exactly once per transition. `ScreenBroadcaster` (rendered in the authenticated layout and on `/login`) drives it from the pathname and also mirrors the value onto `<body data-agent-screen>`.
- Screen ids the prototype already published are preserved verbatim (`login-screen`, `home-screen`, `cards-screen`, `analytics-screen`, `sendmoney-screen`, `sendmoney-confirm-screen`, `sendmoney-success-screen`, `paybill-screen`, `paybill-confirm-screen`, `paybill-success-screen`, `profile-screen`). Screens added in this rebuild use new ids in the same style (`qr-pay-screen`, `statements-screen`, `locator-screen`, …). The mapping lives in `SCREEN_BY_ROUTE` in `src/lib/agent.js`.

## Mobile wrapping

The phone composition is designed for a ~390px viewport in a `440px` column. `pt-safe` / `pb-safe` utilities respect the notch and home indicator, and the viewport meta sets `viewport-fit=cover`, so the build drops into a Capacitor or WebView wrapper unchanged — the wrapper simply never reaches the `lg` breakpoint that swaps in the desktop portal.

## Verified

Checked with Playwright at 390px and 1440px across dashboard, cards, card detail, analytics, transfer, bills, statements, locator, QR pay and certificates: no horizontal overflow at either width, the breakpoint flips exactly at 1024px (sidebar in / tab bar out), every form field stays label-associated, one `h1` per screen, and the add-beneficiary flow still round-trips. `npm run lint` and `npm run build` are clean, with no console errors at either width. The transfer flow, the add-beneficiary flow and beneficiary persistence across a hard reload were re-verified after the JavaScript conversion, and every route was re-checked for truncation after the switch to longer PKR amounts and Pakistani names.
