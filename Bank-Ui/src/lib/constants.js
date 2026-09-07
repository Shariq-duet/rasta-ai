import {
  BadgeCheck,
  BarChart3,
  Bell,
  BookText,
  CreditCard,
  FileSpreadsheet,
  Home,
  MapPin,
  QrCode,
  Receipt,
  ScanLine,
  Send,
  UserRound,
  Users,
  WalletCards,
} from 'lucide-react'

export const BANK_NAME = 'Zenith Bank'

export const BANK_SHORT = 'Zenith'

export const BANK_TAGLINE = 'Banking that keeps pace with you.'

/** Fictionalised brand for UI demonstration only — not affiliated with any real bank. */
export const BANK_DISCLAIMER = 'Demo interface • Not affiliated with any real financial institution'

export const ROUTES = {
  root: '/',
  login: '/login',
  dashboard: '/dashboard',
  cards: '/cards',
  card: (cardId) => `/cards/${cardId}`,
  analytics: '/analytics',
  transfer: '/transfer',
  transferConfirm: '/transfer/confirm',
  transferSuccess: '/transfer/success',
  beneficiaries: '/transfer/beneficiaries',
  beneficiaryNew: '/transfer/beneficiaries/new',
  bills: '/bills',
  billsConfirm: '/bills/confirm',
  billsSuccess: '/bills/success',
  qrPay: '/qr-pay',
  statements: '/statements',
  chequeBook: '/cheque-book',
  certificates: '/certificates',
  locator: '/locator',
  notifications: '/notifications',
  profile: '/profile',
  profileSecurity: '/profile/security',
  profileNotifications: '/profile/notifications',
}

export const SCREEN_TITLES = {
  '/dashboard': 'Overview',
  '/cards': 'Your cards',
  '/analytics': 'Spending insights',
  '/transfer': 'Send money',
  '/transfer/confirm': 'Review transfer',
  '/transfer/success': 'Transfer sent',
  '/transfer/beneficiaries': 'Beneficiaries',
  '/transfer/beneficiaries/new': 'Add beneficiary',
  '/bills': 'Pay a bill',
  '/bills/confirm': 'Review payment',
  '/bills/success': 'Bill paid',
  '/qr-pay': 'Scan & pay',
  '/statements': 'Account statement',
  '/cheque-book': 'Cheque services',
  '/certificates': 'Certificates',
  '/locator': 'Branch & ATM locator',
  '/notifications': 'Notifications',
  '/profile': 'Profile & settings',
  '/profile/security': 'Security & privacy',
  '/profile/notifications': 'Notification settings',
}

export const NAV_ITEMS = [
  { href: ROUTES.dashboard, label: 'Home', icon: Home, agentId: 'nav-home' },
  { href: ROUTES.cards, label: 'Cards', icon: WalletCards, agentId: 'nav-cards' },
  { href: ROUTES.qrPay, label: 'Scan', icon: QrCode, agentId: 'nav-qrpay' },
  { href: ROUTES.analytics, label: 'Insights', icon: BarChart3, agentId: 'nav-analytics' },
  {
    href: ROUTES.transfer,
    label: 'Transfer',
    icon: Send,
    agentId: 'nav-sendmoney',
    matches: [ROUTES.transfer, ROUTES.bills],
  },
]

/**
 * Desktop sidebar navigation (>=1024px). Same routes as the mobile tab bar plus
 * everything the phone layout tucks into the dashboard services grid, grouped so
 * the list stays scannable.
 */
export const SIDEBAR_GROUPS = [
  {
    label: 'Banking',
    items: [
      { href: ROUTES.dashboard, label: 'Dashboard', icon: Home, agentId: 'side-nav-dashboard' },
      { href: ROUTES.cards, label: 'Cards', icon: WalletCards, agentId: 'side-nav-cards' },
      {
        href: ROUTES.transfer,
        label: 'Transfer',
        icon: Send,
        agentId: 'side-nav-transfer',
        matches: [ROUTES.transfer],
      },
      { href: ROUTES.bills, label: 'Bills', icon: Receipt, agentId: 'side-nav-bills' },
      { href: ROUTES.qrPay, label: 'QR Pay', icon: QrCode, agentId: 'side-nav-qrpay' },
      { href: ROUTES.analytics, label: 'Analytics', icon: BarChart3, agentId: 'side-nav-analytics' },
    ],
  },
  {
    label: 'Services',
    items: [
      { href: ROUTES.statements, label: 'Statements', icon: FileSpreadsheet, agentId: 'side-nav-statements' },
      { href: ROUTES.chequeBook, label: 'Cheque Book', icon: BookText, agentId: 'side-nav-cheque-book' },
      {
        href: ROUTES.certificates,
        label: 'Certificates',
        icon: BadgeCheck,
        agentId: 'side-nav-certificates',
      },
      { href: ROUTES.locator, label: 'Branch Locator', icon: MapPin, agentId: 'side-nav-locator' },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: ROUTES.notifications, label: 'Notifications', icon: Bell, agentId: 'side-nav-notifications' },
      { href: ROUTES.profile, label: 'Profile', icon: UserRound, agentId: 'side-nav-profile' },
    ],
  },
]

export const SERVICE_LINKS = [
  {
    href: ROUTES.statements,
    label: 'Statement',
    description: 'Filter and export your account history',
    icon: FileSpreadsheet,
    agentId: 'service-statements',
  },
  {
    href: ROUTES.chequeBook,
    label: 'Cheques',
    description: 'Request a book or stop a cheque',
    icon: BookText,
    agentId: 'service-cheque-book',
  },
  {
    href: ROUTES.certificates,
    label: 'Certificates',
    description: 'Balance and tax certificates',
    icon: BadgeCheck,
    agentId: 'service-certificates',
  },
  {
    href: ROUTES.beneficiaries,
    label: 'Beneficiaries',
    description: 'Manage your saved payees',
    icon: Users,
    agentId: 'service-beneficiaries',
  },
  {
    href: ROUTES.bills,
    label: 'Bills',
    description: 'Utilities, internet and mobile',
    icon: Receipt,
    agentId: 'service-bills',
  },
  {
    href: ROUTES.locator,
    label: 'Locator',
    description: 'Find a branch or ATM near you',
    icon: MapPin,
    agentId: 'service-locator',
  },
]

export const QUICK_ACTIONS = [
  { href: ROUTES.transfer, label: 'Send', icon: Send, agentId: 'home-quick-action-send' },
  { href: ROUTES.bills, label: 'Pay bills', icon: Receipt, agentId: 'home-quick-action-paybill' },
  { href: ROUTES.qrPay, label: 'Scan QR', icon: ScanLine, agentId: 'home-quick-action-qr' },
  { href: ROUTES.cards, label: 'Cards', icon: CreditCard, agentId: 'home-quick-action-cards' },
]

export const ASSISTANT_NAME = 'Zenith Assistant'

export const ASSISTANT_SUGGESTIONS = [
  { id: 'check-balance', label: "What's my balance?" },
  { id: 'transfer-money', label: 'Send money' },
  { id: 'monthly-spend', label: 'Where did my money go?' },
  { id: 'pay-bill', label: 'Any bills due?' },
  { id: 'nearest-atm', label: 'Nearest ATM' },
]
