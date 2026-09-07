/**
 * Shared shape definitions.
 *
 * This module emits no runtime code — it exists so every record the app renders
 * has one documented shape. Editors read these JSDoc typedefs for completion and
 * hover docs; import them in other files with:
 *
 *   \@typedef {import('@/lib/types').Account} Account
 */

/** @typedef {'current' | 'savings' | 'deposit'} AccountKind */

/**
 * @typedef {object} Account
 * @property {string} id
 * @property {string} nickname
 * @property {string} productName
 * @property {AccountKind} kind
 * @property {string} maskedNumber Masked display number, e.g. "••• 4821".
 * @property {string} iban Masked reference, e.g. "PK••ZNTH••••••••••••4821" — never a real IBAN.
 * @property {string} branch
 * @property {'PKR'} currency
 * @property {number} balance
 * @property {number} availableBalance
 * @property {number} changePercent Month-over-month balance change, as a percentage.
 * @property {number} monthlyIncome
 * @property {number} monthlySpend
 */

/** @typedef {'credit' | 'debit'} TransactionDirection */

/**
 * @typedef {'Groceries' | 'Salary' | 'Utilities' | 'Shopping' | 'Transport' | 'Dining'
 *   | 'Transfer' | 'Mobile' | 'Housing' | 'Subscriptions'} TransactionCategory
 */

/** @typedef {'green' | 'brand' | 'cyan' | 'violet' | 'sky'} TransactionTone */

/**
 * @typedef {object} Transaction
 * @property {string} id
 * @property {string} accountId
 * @property {string} merchant
 * @property {TransactionCategory} category
 * @property {string} date ISO-8601 date string.
 * @property {number} amount
 * @property {TransactionDirection} direction
 * @property {string} initials
 * @property {TransactionTone} tone
 * @property {string} reference
 */

/**
 * Selectable banks — see BANK_OPTIONS in mock-data for the canonical list.
 * @typedef {'Zenith Bank' | 'Allied Bank' | 'Bank Alfalah' | 'Faysal Bank' | 'HBL'
 *   | 'MCB Bank' | 'Meezan Bank' | 'Standard Chartered Pakistan' | 'UBL'} BeneficiaryBank
 */

/** @typedef {'lavender' | 'peach' | 'mint' | 'sky' | 'cyan'} AvatarTone */

/**
 * @typedef {object} Beneficiary
 * @property {string} id
 * @property {string} name
 * @property {string} initials
 * @property {AvatarTone} tone
 * @property {BeneficiaryBank} bank
 * @property {string} maskedNumber
 * @property {string} iban Masked reference, not a real IBAN.
 * @property {number} transferLimit Per-payee daily transfer ceiling, in PKR.
 * @property {boolean} raastEnabled
 * @property {boolean} favourite
 */

/**
 * @typedef {'Electricity' | 'Gas' | 'Internet' | 'Mobile' | 'Water' | 'Education'
 *   | 'Credit Card'} BillerCategory
 */

/**
 * @typedef {object} Biller
 * @property {string} id
 * @property {string} name
 * @property {BillerCategory} category
 * @property {string} consumerNumber
 * @property {string} dueDate ISO-8601 date string.
 * @property {number} amountDue
 * @property {'brand' | 'accent' | 'positive' | 'sky'} tone
 */

/** @typedef {'debit' | 'credit'} CardKind */
/** @typedef {'VISA' | 'Mastercard' | 'PayPak'} CardNetwork */
/** @typedef {'active' | 'frozen' | 'blocked'} CardStatus */

/**
 * @typedef {object} BankCard
 * @property {string} id
 * @property {string} accountId
 * @property {string} label
 * @property {CardKind} kind
 * @property {CardNetwork} network
 * @property {string} holder
 * @property {string} maskedNumber
 * @property {string} expiry
 * @property {string} pin
 * @property {CardStatus} status
 * @property {boolean} ecommerceEnabled
 * @property {boolean} contactlessEnabled
 * @property {boolean} internationalEnabled
 * @property {number} dailyLimit
 * @property {number} maxLimit
 * @property {number} spentToday
 * @property {string} gradient Tailwind gradient classes for the card face.
 */

/**
 * @typedef {object} SpendingCategory
 * @property {string} id
 * @property {string} label
 * @property {number} amount
 * @property {number} percent
 * @property {string} colorClass
 * @property {string} hex
 */

/** @typedef {'ibft' | 'own'} TransferMode */

/**
 * @typedef {object} TransferDraft
 * @property {TransferMode} mode
 * @property {string} fromAccountId
 * @property {string | null} beneficiaryId
 * @property {string | null} toAccountId
 * @property {string} amount
 * @property {string} note
 * @property {boolean} raast
 */

/**
 * @typedef {object} BillDraft
 * @property {string | null} billerId
 * @property {string} fromAccountId
 * @property {string} amount
 * @property {boolean} standingInstruction
 * @property {string} scheduledFor
 */

/**
 * @typedef {object} Merchant
 * @property {string} id
 * @property {string} name
 * @property {string} city
 * @property {string} category
 * @property {string} merchantId
 */

/**
 * @typedef {object} QrPaymentDraft
 * @property {Merchant | null} merchant
 * @property {string} amount
 * @property {string} note
 */

/**
 * @typedef {object} Branch
 * @property {string} id
 * @property {string} name
 * @property {'branch' | 'atm'} type
 * @property {string} address
 * @property {string} city
 * @property {string} timings
 * @property {string[]} services
 * @property {number} distanceKm
 */

/** @typedef {'transaction' | 'security' | 'promo' | 'system'} NotificationKind */

/**
 * @typedef {object} AppNotification
 * @property {string} id
 * @property {NotificationKind} kind
 * @property {string} title
 * @property {string} body
 * @property {string} timestamp
 * @property {boolean} read
 */

/**
 * @typedef {object} ChatMessage
 * @property {string} id
 * @property {'user' | 'assistant'} from
 * @property {string} text
 */

/**
 * @typedef {object} NavItem
 * @property {string} href
 * @property {string} label
 * @property {import('lucide-react').LucideIcon} icon
 * @property {string} agentId
 * @property {string[]} [matches] Route prefixes that should also light up this item.
 */

/**
 * @typedef {object} NavGroup
 * @property {string} label
 * @property {NavItem[]} items
 */

/**
 * @typedef {object} ServiceLink
 * @property {string} href
 * @property {string} label
 * @property {string} description
 * @property {import('lucide-react').LucideIcon} icon
 * @property {string} agentId
 */

export {}
