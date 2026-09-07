'use client'

import { accounts, transactions } from '@/lib/mock-data'
import { useBankStore } from '@/store/bank-store'

export { useBankStore }

/** The account currently driving the dashboard, statement and transfer screens. */
export function useSelectedAccount() {
  const selectedAccountId = useBankStore((state) => state.selectedAccountId)
  return accounts.find((account) => account.id === selectedAccountId) ?? accounts[0]
}

export function useAccounts() {
  return accounts
}

/** Transactions for one account, newest first. */
export function useAccountTransactions(accountId, limit) {
  const rows = transactions
    .filter((transaction) => transaction.accountId === accountId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return typeof limit === 'number' ? rows.slice(0, limit) : rows
}

export function useUnreadNotificationCount() {
  return useBankStore((state) => state.notifications.filter((entry) => !entry.read).length)
}
