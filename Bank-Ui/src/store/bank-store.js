'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  ASSISTANT_FALLBACK,
  ASSISTANT_REPLIES,
  accounts,
  beneficiaries as seedBeneficiaries,
  cards as seedCards,
  notifications as seedNotifications,
} from '@/lib/mock-data'
const DEFAULT_ACCOUNT_ID = accounts[0].id
const emptyTransfer = {
  mode: 'ibft',
  fromAccountId: DEFAULT_ACCOUNT_ID,
  beneficiaryId: seedBeneficiaries[0].id,
  toAccountId: accounts[1].id,
  amount: '',
  note: '',
  raast: true,
}
const emptyBill = {
  billerId: null,
  fromAccountId: DEFAULT_ACCOUNT_ID,
  amount: '',
  standingInstruction: false,
  scheduledFor: '',
}
const emptyQr = {
  merchant: null,
  amount: '',
  note: '',
}
const AVATAR_TONES = ['lavender', 'peach', 'mint', 'sky', 'cyan']

function initialsFor(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

/** Canned, fully local assistant reply — no network request is ever made. */
function assistantReply(text) {
  const entry = ASSISTANT_REPLIES.find((candidate) => candidate.match.test(text))
  return entry ? entry.reply() : ASSISTANT_FALLBACK
}
let messageCounter = 0

/** Session-scoped id — fine for chat messages, which never persist. */
function nextId(prefix) {
  messageCounter += 1
  return `${prefix}-${messageCounter}`
}

/**
 * Collision-safe id for records that outlive the tab. A plain counter would
 * restart at 1 on reload and clash with an already-persisted beneficiary.
 */
function persistentId(prefix) {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  return `${prefix}-${random}`
}

export const useBankStore = create()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      hydrated: false,
      selectedAccountId: DEFAULT_ACCOUNT_ID,
      showBalance: true,
      beneficiaries: seedBeneficiaries,
      cards: seedCards,
      notifications: seedNotifications,
      transfer: emptyTransfer,
      bill: emptyBill,
      qr: emptyQr,
      chat: [],
      chatOpen: false,
      login: () => set({ isAuthenticated: true }),
      logout: () =>
        set({
          isAuthenticated: false,
          selectedAccountId: DEFAULT_ACCOUNT_ID,
          // Signing out resets the demo, saved payees included.
          beneficiaries: seedBeneficiaries,
          transfer: emptyTransfer,
          bill: emptyBill,
          qr: emptyQr,
          chat: [],
          chatOpen: false,
        }),
      setHydrated: () => set({ hydrated: true }),
      selectAccount: (accountId) =>
        set((state) => ({
          selectedAccountId: accountId,
          transfer: { ...state.transfer, fromAccountId: accountId },
          bill: { ...state.bill, fromAccountId: accountId },
        })),
      toggleBalance: () => set((state) => ({ showBalance: !state.showBalance })),
      addBeneficiary: (input) => {
        const beneficiary = {
          ...input,
          id: persistentId('beneficiary'),
          initials: initialsFor(input.name),
          tone: AVATAR_TONES[get().beneficiaries.length % AVATAR_TONES.length],
        }
        set((state) => ({ beneficiaries: [...state.beneficiaries, beneficiary] }))
        return beneficiary
      },
      removeBeneficiary: (beneficiaryId) =>
        set((state) => ({
          beneficiaries: state.beneficiaries.filter((entry) => entry.id !== beneficiaryId),
          transfer:
            state.transfer.beneficiaryId === beneficiaryId
              ? { ...state.transfer, beneficiaryId: null }
              : state.transfer,
        })),
      toggleFavourite: (beneficiaryId) =>
        set((state) => ({
          beneficiaries: state.beneficiaries.map((entry) =>
            entry.id === beneficiaryId ? { ...entry, favourite: !entry.favourite } : entry,
          ),
        })),
      updateCard: (cardId, patch) =>
        set((state) => ({
          cards: state.cards.map((card) => (card.id === cardId ? { ...card, ...patch } : card)),
        })),
      setTransfer: (patch) => set((state) => ({ transfer: { ...state.transfer, ...patch } })),
      setTransferMode: (mode) => set((state) => ({ transfer: { ...state.transfer, mode } })),
      resetTransfer: () =>
        set((state) => ({ transfer: { ...emptyTransfer, fromAccountId: state.selectedAccountId } })),
      setBill: (patch) => set((state) => ({ bill: { ...state.bill, ...patch } })),
      resetBill: () => set((state) => ({ bill: { ...emptyBill, fromAccountId: state.selectedAccountId } })),
      setQr: (patch) => set((state) => ({ qr: { ...state.qr, ...patch } })),
      selectMerchant: (merchant) => set((state) => ({ qr: { ...state.qr, merchant } })),
      resetQr: () => set({ qr: emptyQr }),
      openChat: () => set({ chatOpen: true }),
      closeChat: () => set({ chatOpen: false }),
      sendChatMessage: (text) =>
        set((state) => ({
          chat: [
            ...state.chat,
            { id: nextId('msg'), from: 'user', text },
            { id: nextId('msg'), from: 'assistant', text: assistantReply(text) },
          ],
        })),
      clearChat: () => set({ chat: [] }),
      markNotificationRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((entry) =>
            entry.id === notificationId ? { ...entry, read: true } : entry,
          ),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((entry) => ({ ...entry, read: true })),
        })),
    }),
    {
      name: 'zenith-ui',
      storage: createJSONStorage(() => localStorage),
      /*
       * Bump when the seeded demo data changes shape or content. Stored payees
       * from an older seed would otherwise shadow the new ones forever, since
       * persisted state wins over the defaults on rehydrate.
       */
      version: 2,
      migrate: (persisted, version) => {
        if (!persisted || version < 2) {
          // Drop the stale payee book, keep the session preferences.
          const { beneficiaries: _stale, ...rest } = persisted ?? {}
          return { ...rest, beneficiaries: seedBeneficiaries }
        }
        return persisted
      },
      // Preferences and the payee book survive a reload; in-progress drafts,
      // chat and transient UI state always start clean.
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        selectedAccountId: state.selectedAccountId,
        showBalance: state.showBalance,
        beneficiaries: state.beneficiaries,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
)

export function selectAccounts() {
  return accounts
}
