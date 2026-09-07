/**
 * Every value in this module is fabricated for UI demonstration. There is no
 * backend: screens read from these arrays and mutate only client-side state.
 *
 * Names, account references, branch addresses and merchant activity are
 * invented. Account references are deliberately masked and are not valid IBANs.
 */

/**
 * "Now" for the whole demo, resolved once per page load so the activity feed
 * always reads as recent rather than frozen in a hardcoded month.
 *
 * Safe against hydration mismatch: the authenticated shell renders a skeleton
 * until the persisted store rehydrates in the browser, so no date-derived text
 * is ever part of the prerendered HTML.
 */
export const TODAY = new Date()

/** A date `days` back, pinned to a specific wall-clock time. */
function daysAgo(days, hours, minutes = 0) {
  const date = new Date(TODAY)
  date.setDate(date.getDate() - days)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

/** A date `days` forward, for bill due dates. */
function daysAhead(days) {
  const date = new Date(TODAY)
  date.setDate(date.getDate() + days)
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

export const CUSTOMER = {
  name: 'Ayesha Siddiqui',
  initials: 'AS',
  email: 'ayesha.siddiqui@example.com',
  phone: '+92 300 214 7788',
  cnic: '42101-•••••••-8',
  memberSince: '2016',
  city: 'Karachi',
  tier: 'Priority Banking',
  homeBranch: 'Clifton Branch, Karachi',
}

export const accounts = [
  {
    id: 'acc-current',
    nickname: 'Everyday Current',
    productName: 'Zenith Current Account',
    kind: 'current',
    maskedNumber: '••• 4821',
    iban: 'PK••ZNTH••••••••••••4821',
    branch: 'Clifton Branch, Karachi',
    currency: 'PKR',
    balance: 486_240,
    availableBalance: 471_890,
    changePercent: 6.2,
    monthlyIncome: 385_000,
    monthlySpend: 168_430,
  },
  {
    id: 'acc-savings',
    nickname: 'Rainy Day Savings',
    productName: 'Zenith Savings Account',
    kind: 'savings',
    maskedNumber: '••• 7130',
    iban: 'PK••ZNTH••••••••••••7130',
    branch: 'Clifton Branch, Karachi',
    currency: 'PKR',
    balance: 1_240_500,
    availableBalance: 1_240_500,
    changePercent: 1.8,
    monthlyIncome: 14_600,
    monthlySpend: 0,
  },
  {
    id: 'acc-deposit',
    nickname: 'Term Deposit',
    productName: 'Zenith Term Deposit — 1 Year',
    kind: 'deposit',
    maskedNumber: '••• 9052',
    iban: 'PK••ZNTH••••••••••••9052',
    branch: 'Gulberg Branch, Lahore',
    currency: 'PKR',
    balance: 2_500_000,
    availableBalance: 0,
    changePercent: 0,
    monthlyIncome: 26_040,
    monthlySpend: 0,
  },
]

export const transactions = [
  {
    id: 'imtiaz-superstore',
    accountId: 'acc-current',
    merchant: 'Imtiaz Super Market',
    category: 'Groceries',
    date: daysAgo(0, 11, 24),
    amount: 6_480,
    direction: 'debit',
    initials: 'IM',
    tone: 'green',
    reference: 'POS-4471',
  },
  {
    id: 'foodpanda-lunch',
    accountId: 'acc-current',
    merchant: 'foodpanda',
    category: 'Dining',
    date: daysAgo(0, 13, 52),
    amount: 1_340,
    direction: 'debit',
    initials: 'FP',
    tone: 'violet',
    reference: 'ECOM-8823',
  },
  {
    id: 'careem-ride',
    accountId: 'acc-current',
    merchant: 'Careem',
    category: 'Transport',
    date: daysAgo(1, 9, 15),
    amount: 620,
    direction: 'debit',
    initials: 'CA',
    tone: 'sky',
    reference: 'ECOM-8790',
  },
  {
    id: 'salary-credit',
    accountId: 'acc-current',
    merchant: 'Horizon Textiles',
    category: 'Salary',
    date: daysAgo(2, 9, 5),
    amount: 385_000,
    direction: 'credit',
    initials: 'HT',
    tone: 'brand',
    reference: 'SAL-0392',
  },
  {
    id: 'k-electric-bill',
    accountId: 'acc-current',
    merchant: 'K-Electric',
    category: 'Utilities',
    date: daysAgo(3, 16, 40),
    amount: 14_820,
    direction: 'debit',
    initials: 'KE',
    tone: 'cyan',
    reference: 'BILL-2201',
  },
  {
    id: 'daraz-order',
    accountId: 'acc-current',
    merchant: 'Daraz.pk',
    category: 'Shopping',
    date: daysAgo(4, 21, 12),
    amount: 4_299,
    direction: 'debit',
    initials: 'DZ',
    tone: 'violet',
    reference: 'ECOM-8654',
  },
  {
    id: 'netflix-sub',
    accountId: 'acc-current',
    merchant: 'Netflix',
    category: 'Subscriptions',
    date: daysAgo(5, 6, 30),
    amount: 1_650,
    direction: 'debit',
    initials: 'NF',
    tone: 'violet',
    reference: 'ECOM-8611',
  },
  {
    id: 'ibft-in-hamza',
    accountId: 'acc-current',
    merchant: 'Hamza Iqbal',
    category: 'Transfer',
    date: daysAgo(6, 14, 8),
    amount: 25_000,
    direction: 'credit',
    initials: 'HI',
    tone: 'green',
    reference: 'IBFT-5510',
  },
  {
    id: 'kolachi-dinner',
    accountId: 'acc-current',
    merchant: 'Kolachi Restaurant',
    category: 'Dining',
    date: daysAgo(7, 21, 45),
    amount: 8_950,
    direction: 'debit',
    initials: 'KR',
    tone: 'violet',
    reference: 'POS-4390',
  },
  {
    id: 'jazz-postpaid',
    accountId: 'acc-current',
    merchant: 'Jazz Postpaid',
    category: 'Mobile',
    date: daysAgo(8, 10, 20),
    amount: 2_890,
    direction: 'debit',
    initials: 'JZ',
    tone: 'cyan',
    reference: 'BILL-2188',
  },
  {
    id: 'al-fatah-grocery',
    accountId: 'acc-current',
    merchant: 'Al-Fatah Store',
    category: 'Groceries',
    date: daysAgo(9, 18, 5),
    amount: 9_240,
    direction: 'debit',
    initials: 'AF',
    tone: 'green',
    reference: 'POS-4288',
  },
  {
    id: 'indrive-ride',
    accountId: 'acc-current',
    merchant: 'InDrive',
    category: 'Transport',
    date: daysAgo(10, 8, 40),
    amount: 450,
    direction: 'debit',
    initials: 'ID',
    tone: 'sky',
    reference: 'ECOM-8502',
  },
  {
    id: 'ssgc-gas',
    accountId: 'acc-current',
    merchant: 'Sui Southern Gas',
    category: 'Utilities',
    date: daysAgo(12, 11, 30),
    amount: 3_640,
    direction: 'debit',
    initials: 'SS',
    tone: 'cyan',
    reference: 'BILL-2140',
  },
  {
    id: 'rent-housing',
    accountId: 'acc-current',
    merchant: 'Monthly Rent',
    category: 'Housing',
    date: daysAgo(14, 9, 0),
    amount: 85_000,
    direction: 'debit',
    initials: 'MR',
    tone: 'brand',
    reference: 'IBFT-5402',
  },
  {
    id: 'metro-cash-carry',
    accountId: 'acc-current',
    merchant: 'Metro Cash & Carry',
    category: 'Groceries',
    date: daysAgo(16, 17, 25),
    amount: 12_760,
    direction: 'debit',
    initials: 'MC',
    tone: 'green',
    reference: 'POS-4155',
  },
  {
    id: 'profit-savings',
    accountId: 'acc-savings',
    merchant: 'Monthly Profit Credit',
    category: 'Salary',
    date: daysAgo(3, 8, 0),
    amount: 14_600,
    direction: 'credit',
    initials: 'ZN',
    tone: 'green',
    reference: 'PRF-0071',
  },
  {
    id: 'savings-topup',
    accountId: 'acc-savings',
    merchant: 'From Everyday Current',
    category: 'Transfer',
    date: daysAgo(5, 15, 10),
    amount: 40_000,
    direction: 'credit',
    initials: 'TC',
    tone: 'sky',
    reference: 'IFT-3320',
  },
  {
    id: 'savings-withdrawal',
    accountId: 'acc-savings',
    merchant: 'To Everyday Current',
    category: 'Transfer',
    date: daysAgo(13, 12, 45),
    amount: 30_000,
    direction: 'debit',
    initials: 'TC',
    tone: 'sky',
    reference: 'IFT-3211',
  },
  {
    id: 'deposit-profit',
    accountId: 'acc-deposit',
    merchant: 'Term Deposit Profit',
    category: 'Salary',
    date: daysAgo(6, 10, 0),
    amount: 26_040,
    direction: 'credit',
    initials: 'ZN',
    tone: 'green',
    reference: 'PRF-0068',
  },
]

export const beneficiaries = [
  {
    id: 'hamza-iqbal',
    name: 'Hamza Iqbal',
    initials: 'HI',
    tone: 'lavender',
    bank: 'Meezan Bank',
    maskedNumber: '••• 2091',
    iban: 'PK••MEZN••••••••••••2091',
    transferLimit: 1_000_000,
    raastEnabled: true,
    favourite: true,
  },
  {
    id: 'sana-mahmood',
    name: 'Sana Mahmood',
    initials: 'SM',
    tone: 'peach',
    bank: 'HBL',
    maskedNumber: '••• 7712',
    iban: 'PK••HABB••••••••••••7712',
    transferLimit: 500_000,
    raastEnabled: true,
    favourite: true,
  },
  {
    id: 'bilal-rehman',
    name: 'Bilal ur Rehman',
    initials: 'BR',
    tone: 'mint',
    bank: 'Zenith Bank',
    maskedNumber: '••• 3480',
    iban: 'PK••ZNTH••••••••••••3480',
    transferLimit: 2_500_000,
    raastEnabled: true,
    favourite: true,
  },
  {
    id: 'nadia-farooq',
    name: 'Nadia Farooq',
    initials: 'NF',
    tone: 'sky',
    bank: 'MCB Bank',
    maskedNumber: '••• 6155',
    iban: 'PK••MUCB••••••••••••6155',
    transferLimit: 250_000,
    raastEnabled: true,
    favourite: false,
  },
  {
    id: 'usman-tariq',
    name: 'Usman Tariq',
    initials: 'UT',
    tone: 'cyan',
    bank: 'UBL',
    maskedNumber: '••• 8834',
    iban: 'PK••UNIL••••••••••••8834',
    transferLimit: 500_000,
    raastEnabled: false,
    favourite: false,
  },
  {
    id: 'zoya-hassan',
    name: 'Zoya Hassan',
    initials: 'ZH',
    tone: 'lavender',
    bank: 'Faysal Bank',
    maskedNumber: '••• 5027',
    iban: 'PK••FAYS••••••••••••5027',
    transferLimit: 300_000,
    raastEnabled: true,
    favourite: false,
  },
]

/** Banks selectable when adding a payee. */
export const BANK_OPTIONS = [
  'Zenith Bank',
  'Allied Bank',
  'Bank Alfalah',
  'Faysal Bank',
  'HBL',
  'MCB Bank',
  'Meezan Bank',
  'Standard Chartered Pakistan',
  'UBL',
]

export const billers = [
  {
    id: 'k-electric',
    name: 'K-Electric',
    category: 'Electricity',
    consumerNumber: '04 21 3389 4410',
    dueDate: daysAhead(6),
    amountDue: 14_820,
    tone: 'accent',
  },
  {
    id: 'ssgc',
    name: 'Sui Southern Gas Company',
    category: 'Gas',
    consumerNumber: '11 5522 8890 3',
    dueDate: daysAhead(11),
    amountDue: 3_640,
    tone: 'brand',
  },
  {
    id: 'ptcl',
    name: 'PTCL Broadband',
    category: 'Internet',
    consumerNumber: '021 3587 0021',
    dueDate: daysAhead(9),
    amountDue: 4_499,
    tone: 'sky',
  },
  {
    id: 'jazz-postpaid',
    name: 'Jazz Postpaid',
    category: 'Mobile',
    consumerNumber: '0300 214 7788',
    dueDate: daysAhead(14),
    amountDue: 2_890,
    tone: 'positive',
  },
  {
    id: 'zong-postpaid',
    name: 'Zong Postpaid',
    category: 'Mobile',
    consumerNumber: '0311 448 2210',
    dueDate: daysAhead(17),
    amountDue: 1_750,
    tone: 'positive',
  },
  {
    id: 'kwsb',
    name: 'Karachi Water Board',
    category: 'Water',
    consumerNumber: '07 4412 9987',
    dueDate: daysAhead(19),
    amountDue: 1_980,
    tone: 'sky',
  },
  {
    id: 'beaconhouse-fee',
    name: 'Beaconhouse School System',
    category: 'Education',
    consumerNumber: 'STU-2024-88214',
    dueDate: daysAhead(4),
    amountDue: 32_500,
    tone: 'brand',
  },
  {
    id: 'onebill-card',
    name: 'Credit Card Bill via 1Bill',
    category: 'Credit Card',
    consumerNumber: '1B 7741 2093 55',
    dueDate: daysAhead(8),
    amountDue: 46_310,
    tone: 'accent',
  },
]

export const cards = [
  {
    id: 'card-debit-visa',
    accountId: 'acc-current',
    label: 'Everyday Debit',
    kind: 'debit',
    network: 'VISA',
    holder: 'AYESHA SIDDIQUI',
    maskedNumber: '•••• •••• •••• 4821',
    expiry: '09/28',
    pin: '4417',
    status: 'active',
    ecommerceEnabled: true,
    contactlessEnabled: true,
    internationalEnabled: false,
    dailyLimit: 200_000,
    maxLimit: 500_000,
    spentToday: 7_820,
    gradient: 'from-brand-600 via-brand-700 to-brand-900',
  },
  {
    id: 'card-paypak',
    accountId: 'acc-savings',
    label: 'Savings PayPak',
    kind: 'debit',
    network: 'PayPak',
    holder: 'AYESHA SIDDIQUI',
    maskedNumber: '•••• •••• •••• 7130',
    expiry: '05/29',
    pin: '9032',
    status: 'active',
    ecommerceEnabled: false,
    contactlessEnabled: true,
    internationalEnabled: false,
    dailyLimit: 75_000,
    maxLimit: 300_000,
    spentToday: 0,
    gradient: 'from-ink via-[#1e2c4c] to-[#0d1831]',
  },
  {
    id: 'card-credit-gold',
    accountId: 'acc-current',
    label: 'Signature Credit',
    kind: 'credit',
    network: 'Mastercard',
    holder: 'AYESHA SIDDIQUI',
    maskedNumber: '•••• •••• •••• 6604',
    expiry: '11/27',
    pin: '2288',
    status: 'active',
    ecommerceEnabled: true,
    contactlessEnabled: true,
    internationalEnabled: true,
    dailyLimit: 400_000,
    maxLimit: 1_000_000,
    spentToday: 4_299,
    gradient: 'from-brand-800 via-brand-500 to-accent-400',
  },
]

export const spendingCategories = [
  { id: 'housing', label: 'Rent & housing', amount: 85_000, percent: 50, colorClass: 'bg-brand-600', hex: '#3d3ac7' },
  {
    id: 'groceries',
    label: 'Groceries & dining',
    amount: 38_770,
    percent: 23,
    colorClass: 'bg-positive-400',
    hex: '#059669',
  },
  { id: 'utilities', label: 'Utilities & bills', amount: 25_990, percent: 16, colorClass: 'bg-accent-400', hex: '#06b6d4' },
  { id: 'shopping', label: 'Shopping', amount: 12_620, percent: 7, colorClass: 'bg-[#8b5cf6]', hex: '#8b5cf6' },
  { id: 'transport', label: 'Transport', amount: 6_050, percent: 4, colorClass: 'bg-[#f59e0b]', hex: '#f59e0b' },
]

export const merchants = [
  {
    id: 'chai-wala',
    name: 'Dera Chai House',
    city: 'Karachi',
    category: 'Café',
    merchantId: 'RAAST-P2M-88214',
  },
  {
    id: 'naheed-store',
    name: 'Naheed Supermarket',
    city: 'Karachi',
    category: 'Grocery',
    merchantId: 'RAAST-P2M-31099',
  },
  {
    id: 'gulberg-pharmacy',
    name: 'Gulberg Pharmacy',
    city: 'Lahore',
    category: 'Pharmacy',
    merchantId: 'RAAST-P2M-77410',
  },
]

/**
 * Fictional branches. Area names are locally plausible; the street addresses
 * are invented and do not correspond to any real bank premises.
 */
export const branches = [
  {
    id: 'clifton',
    name: 'Clifton Branch',
    type: 'branch',
    address: 'Plot 12-C, Main Clifton Road',
    city: 'Karachi',
    timings: 'Mon–Fri, 9:00 am – 5:00 pm',
    services: ['Cash counter', 'Lockers', 'Foreign exchange'],
    distanceKm: 1.4,
  },
  {
    id: 'seaview-atm',
    name: 'Sea View ATM',
    type: 'atm',
    address: 'Beachfront Plaza, Block 4',
    city: 'Karachi',
    timings: 'Open 24 hours',
    services: ['Cash withdrawal', 'Balance enquiry'],
    distanceKm: 2.7,
  },
  {
    id: 'shahrah-e-faisal',
    name: 'Shahrah-e-Faisal Branch',
    type: 'branch',
    address: 'Suite 4, Corporate Avenue',
    city: 'Karachi',
    timings: 'Mon–Fri, 9:00 am – 5:00 pm',
    services: ['Cash counter', 'Cheque clearing', 'Account opening'],
    distanceKm: 6.1,
  },
  {
    id: 'tariq-road-atm',
    name: 'Tariq Road ATM',
    type: 'atm',
    address: 'Ground Floor, Crescent Arcade',
    city: 'Karachi',
    timings: 'Open 24 hours',
    services: ['Cash withdrawal', 'Cash deposit'],
    distanceKm: 7.9,
  },
  {
    id: 'gulberg',
    name: 'Gulberg Branch',
    type: 'branch',
    address: '48-B, Commercial Boulevard',
    city: 'Lahore',
    timings: 'Mon–Fri, 9:00 am – 5:00 pm',
    services: ['Cash counter', 'Lockers', 'Trade finance'],
    distanceKm: 1_020,
  },
  {
    id: 'blue-area',
    name: 'Blue Area Branch',
    type: 'branch',
    address: 'Office 7, Jinnah Business Centre',
    city: 'Islamabad',
    timings: 'Mon–Fri, 9:00 am – 5:00 pm',
    services: ['Cash counter', 'Remittances'],
    distanceKm: 1_128,
  },
]

export const notifications = [
  {
    id: 'n-debit-imtiaz',
    kind: 'transaction',
    title: 'Card payment of Rs. 6,480.00',
    body: 'Imtiaz Super Market • Everyday Debit ••• 4821',
    timestamp: daysAgo(0, 11, 25),
    read: false,
  },
  {
    id: 'n-login',
    kind: 'security',
    title: 'New device signed in',
    body: 'Chrome on Windows, Karachi. Not you? Change your password right away.',
    timestamp: daysAgo(0, 8, 12),
    read: false,
  },
  {
    id: 'n-bill-due',
    kind: 'system',
    title: 'K-Electric bill due in 6 days',
    body: 'Rs. 14,820.00 is due. Set a standing instruction so you never miss it.',
    timestamp: daysAgo(1, 7, 30),
    read: false,
  },
  {
    id: 'n-salary',
    kind: 'transaction',
    title: 'Salary credited — Rs. 385,000.00',
    body: 'Horizon Textiles • Everyday Current ••• 4821',
    timestamp: daysAgo(2, 9, 6),
    read: true,
  },
  {
    id: 'n-raast',
    kind: 'promo',
    title: 'Raast transfers are free',
    body: 'Send money to any bank in Pakistan in seconds, at no cost.',
    timestamp: daysAgo(4, 13, 0),
    read: true,
  },
  {
    id: 'n-limit',
    kind: 'security',
    title: 'Card limit updated',
    body: 'Everyday Debit now has a Rs. 200,000.00 daily limit.',
    timestamp: daysAgo(9, 17, 45),
    read: true,
  },
]

/**
 * The assistant is a canned lookup, never a network call. Replies are built
 * from the data above so the figures it quotes always match the screens.
 */
export const ASSISTANT_REPLIES = [
  {
    match: /balance|how much|kitna/i,
    reply: () =>
      `Everyday Current has ${money(accounts[0].availableBalance)} available, out of ${money(
        accounts[0].balance,
      )} total. Savings adds another ${money(accounts[1].balance)}.`,
  },
  {
    match: /transfer|send money|send to|ibft|raast|payee|beneficiar/i,
    reply: () =>
      `You have ${beneficiaries.length} saved payees. Transfers over Raast land in seconds and cost nothing — open Send money and pick who you are paying.`,
  },
  {
    match: /spend|spent|budget|month|insight|where did|money go|categor/i,
    reply: () =>
      `You have spent ${money(accounts[0].monthlySpend)} this month. Rent is the biggest slice at ${money(
        spendingCategories[0].amount,
      )}, then groceries and dining at ${money(spendingCategories[1].amount)}.`,
  },
  {
    match: /atm|branch|near|locat/i,
    reply: () =>
      `${branches[0].name} is closest at ${branches[0].distanceKm} km, open ${branches[0].timings}. ${branches[1].name} is ${branches[1].distanceKm} km away and open 24 hours.`,
  },
  {
    match: /bill|electric|gas|internet|utility|due/i,
    reply: () =>
      `Your K-Electric bill of ${money(billers[0].amountDue)} is due soon. I can open Pay a bill so you can settle it now or schedule it.`,
  },
  {
    match: /card|freeze|block|pin|limit/i,
    reply: () =>
      `You have ${cards.length} cards. Everyday Debit ••• 4821 is active with a ${money(
        cards[0].dailyLimit,
      )} daily limit — freeze it or reveal the PIN from Cards.`,
  },
  {
    match: /statement|history|export/i,
    reply: () =>
      'Open Statements to filter by date and type, then email or download it. Nothing is generated in this demo.',
  },
  {
    match: /salary|paid|income/i,
    reply: () => `Your last salary credit was ${money(accounts[0].monthlyIncome)} from Horizon Textiles.`,
  },
  {
    match: /hello|hi|salam|assalam/i,
    reply: () => 'Walaikum Assalam. What would you like to do — check a balance, send money, or pay a bill?',
  },
]

export const ASSISTANT_FALLBACK =
  'I can help with balances, transfers, bills, card controls and finding a branch. Try one of the suggestions below.'

/** Local currency helper for the canned replies. */
function money(value) {
  return `Rs. ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`
}
