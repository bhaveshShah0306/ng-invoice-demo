// src/app/banking/store/account.state.ts

import { Account, AccountType, AccountStatus } from '../models/account.model';

/**
 * Account State Interface
 * Manages the complete state for banking accounts in the application
 */
export interface AccountState {
  // Collection of all accounts
  accounts: Account[];
  
  // Currently selected account for detail view
  selectedAccount: Account | null;
  
  // ID of the currently selected account
  selectedAccountId: number | null;
  
  // Loading state for async operations
  loading: boolean;
  
  // Error message if any operation fails
  error: string | null;
  
  // Last updated timestamp for cache invalidation
  lastUpdated: Date | null;
  
  // Indicates if data has been loaded at least once
  initialized: boolean;
}

/**
 * Initial State
 * Default values when the application starts
 */
export const initialAccountState: AccountState = {
  accounts: [],
  selectedAccount: null,
  selectedAccountId: null,
  loading: false,
  error: null,
  lastUpdated: null,
  initialized: false
};

/**
 * State Helper Functions
 * Utility functions to work with account state
 */

/**
 * Get active accounts from state
 */
export function getActiveAccounts(state: AccountState): Account[] {
  return state.accounts.filter(account => account.status === AccountStatus.ACTIVE);
}

/**
 * Get closed accounts from state
 */
export function getClosedAccounts(state: AccountState): Account[] {
  return state.accounts.filter(account => account.status === AccountStatus.CLOSED);
}

/**
 * Get suspended accounts from state
 */
export function getSuspendedAccounts(state: AccountState): Account[] {
  return state.accounts.filter(account => account.status === AccountStatus.SUSPENDED);
}

/**
 * Get savings accounts from state
 */
export function getSavingsAccounts(state: AccountState): Account[] {
  return state.accounts.filter(account => account.accountType === AccountType.SAVINGS);
}

/**
 * Get current accounts from state
 */
export function getCurrentAccounts(state: AccountState): Account[] {
  return state.accounts.filter(account => account.accountType === AccountType.CURRENT);
}

/**
 * Calculate total balance across all active accounts
 */
export function calculateTotalBalance(state: AccountState): number {
  return getActiveAccounts(state).reduce((total, account) => total + account.balance, 0);
}

/**
 * Calculate total available balance (including overdraft for current accounts)
 */
export function calculateTotalAvailableBalance(state: AccountState): number {
  return getActiveAccounts(state).reduce((total, account) => {
    const available = account.accountType === AccountType.CURRENT && account.overdraftLimit
      ? account.balance + account.overdraftLimit
      : account.balance;
    return total + available;
  }, 0);
}

/**
 * Get account by ID from state
 */
export function getAccountById(state: AccountState, accountId: number): Account | undefined {
  return state.accounts.find(account => account.id === accountId);
}

/**
 * Get account by account number from state
 */
export function getAccountByNumber(state: AccountState, accountNumber: string): Account | undefined {
  return state.accounts.find(account => account.accountNumber === accountNumber);
}

/**
 * Check if account exists in state
 */
export function accountExists(state: AccountState, accountId: number): boolean {
  return state.accounts.some(account => account.id === accountId);
}

/**
 * Get accounts with low balance
 */
export function getLowBalanceAccounts(state: AccountState): Account[] {
  return getActiveAccounts(state).filter(account => {
    const threshold = account.accountType === AccountType.SAVINGS ? 2000 : 7000;
    return account.balance < threshold;
  });
}

/**
 * Get accounts statistics
 */
export interface AccountStatistics {
  totalAccounts: number;
  activeAccounts: number;
  closedAccounts: number;
  suspendedAccounts: number;
  savingsAccounts: number;
  currentAccounts: number;
  totalBalance: number;
  totalAvailableBalance: number;
  lowBalanceCount: number;
}

export function getAccountStatistics(state: AccountState): AccountStatistics {
  return {
    totalAccounts: state.accounts.length,
    activeAccounts: getActiveAccounts(state).length,
    closedAccounts: getClosedAccounts(state).length,
    suspendedAccounts: getSuspendedAccounts(state).length,
    savingsAccounts: getSavingsAccounts(state).length,
    currentAccounts: getCurrentAccounts(state).length,
    totalBalance: calculateTotalBalance(state),
    totalAvailableBalance: calculateTotalAvailableBalance(state),
    lowBalanceCount: getLowBalanceAccounts(state).length
  };
}

/**
 * Check if state needs refresh (data older than 5 minutes)
 */
export function needsRefresh(state: AccountState): boolean {
  if (!state.lastUpdated) {
    return true;
  }
  const FIVE_MINUTES = 5 * 60 * 1000;
  const now = new Date().getTime();
  const lastUpdate = new Date(state.lastUpdated).getTime();
  return (now - lastUpdate) > FIVE_MINUTES;
}

/**
 * Validate if account can perform transactions
 */
export function canPerformTransactions(account: Account): boolean {
  return account.status === AccountStatus.ACTIVE;
}

/**
 * Check if account has sufficient balance for withdrawal
 */
export function hasSufficientBalance(account: Account, amount: number): boolean {
  if (account.accountType === AccountType.CURRENT && account.overdraftLimit) {
    const availableBalance = account.balance + account.overdraftLimit;
    return availableBalance >= amount;
  }
  return account.balance >= amount;
}

/**
 * Check if withdrawal amount exceeds limit
 */
export function exceedsWithdrawalLimit(account: Account, amount: number): boolean {
  if (account.accountType === AccountType.SAVINGS) {
    const SAVINGS_WITHDRAWAL_LIMIT = 50000;
    return amount > SAVINGS_WITHDRAWAL_LIMIT;
  }
  // No limit for current accounts
  return false;
}

/**
 * Check if account has low balance
 */
export function hasLowBalance(account: Account): boolean {
  const threshold = account.accountType === AccountType.SAVINGS ? 2000 : 7000;
  return account.balance < threshold && account.status === AccountStatus.ACTIVE;
}

/**
 * Calculate available balance for account
 */
export function getAvailableBalance(account: Account): number {
  if (account.accountType === AccountType.CURRENT && account.overdraftLimit) {
    return account.balance + account.overdraftLimit;
  }
  return account.balance;
}

/**
 * Get account type display name
 */
export function getAccountTypeDisplayName(accountType: AccountType): string {
  return accountType === AccountType.SAVINGS ? 'Savings Account' : 'Current Account';
}

/**
 * Get status display color
 */
export function getStatusDisplayColor(status: AccountStatus): string {
  switch (status) {
    case AccountStatus.ACTIVE:
      return 'primary';
    case AccountStatus.CLOSED:
      return 'warn';
    case AccountStatus.SUSPENDED:
      return 'accent';
    default:
      return '';
  }
}

/**
 * Export all helper functions as a utility object
 */
export const AccountStateHelpers = {
  getActiveAccounts,
  getClosedAccounts,
  getSuspendedAccounts,
  getSavingsAccounts,
  getCurrentAccounts,
  calculateTotalBalance,
  calculateTotalAvailableBalance,
  getAccountById,
  getAccountByNumber,
  accountExists,
  getLowBalanceAccounts,
  getAccountStatistics,
  needsRefresh,
  canPerformTransactions,
  hasSufficientBalance,
  exceedsWithdrawalLimit,
  hasLowBalance,
  getAvailableBalance,
  getAccountTypeDisplayName,
  getStatusDisplayColor
};