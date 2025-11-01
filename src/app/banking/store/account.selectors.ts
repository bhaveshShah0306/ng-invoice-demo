// src/app/banking/store/account.selectors.ts

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AccountState } from './account.state';
import { AccountStatus, AccountType } from '../models/account.model';

/**
 * Feature Selector - Entry point for all account selectors
 */
export const selectAccountState = createFeatureSelector<AccountState>('accounts');

/**
 * Basic Selectors
 */

// Select all accounts
export const selectAllAccounts = createSelector(
  selectAccountState,
  (state: AccountState) => state.accounts
);

// Select currently selected account
export const selectSelectedAccount = createSelector(
  selectAccountState,
  (state: AccountState) => state.selectedAccount
);

// Select selected account ID
export const selectSelectedAccountId = createSelector(
  selectAccountState,
  (state: AccountState) => state.selectedAccountId
);

// Select loading state
export const selectAccountsLoading = createSelector(
  selectAccountState,
  (state: AccountState) => state.loading
);

// Select error state
export const selectAccountError = createSelector(
  selectAccountState,
  (state: AccountState) => state.error
);

// Select last updated timestamp
export const selectLastUpdated = createSelector(
  selectAccountState,
  (state: AccountState) => state.lastUpdated
);

// Select initialized state
export const selectInitialized = createSelector(
  selectAccountState,
  (state: AccountState) => state.initialized
);

/**
 * Filtered Selectors
 */

// Select active accounts only
export const selectActiveAccounts = createSelector(
  selectAllAccounts,
  (accounts) => accounts.filter((account) => account.status === AccountStatus.ACTIVE)
);

// Select closed accounts
export const selectClosedAccounts = createSelector(
  selectAllAccounts,
  (accounts) => accounts.filter((account) => account.status === AccountStatus.CLOSED)
);

// Select suspended accounts
export const selectSuspendedAccounts = createSelector(
  selectAllAccounts,
  (accounts) => accounts.filter((account) => account.status === AccountStatus.SUSPENDED)
);

// Select savings accounts
export const selectSavingsAccounts = createSelector(
  selectAllAccounts,
  (accounts) => accounts.filter((account) => account.accountType === AccountType.SAVINGS)
);

// Select current accounts
export const selectCurrentAccounts = createSelector(
  selectAllAccounts,
  (accounts) => accounts.filter((account) => account.accountType === AccountType.CURRENT)
);

/**
 * Account by ID Selector Factory
 */
export const selectAccountById = (accountId: number) =>
  createSelector(selectAllAccounts, (accounts) =>
    accounts.find((account) => account.id === accountId)
  );

/**
 * Account by Account Number Selector Factory
 */
export const selectAccountByNumber = (accountNumber: string) =>
  createSelector(selectAllAccounts, (accounts) =>
    accounts.find((account) => account.accountNumber === accountNumber)
  );

/**
 * Calculated Selectors
 */

// Calculate total balance across all active accounts
export const selectTotalBalance = createSelector(
  selectActiveAccounts,
  (accounts) => accounts.reduce((total, account) => total + account.balance, 0)
);

// Calculate total available balance (including overdraft)
export const selectTotalAvailableBalance = createSelector(
  selectActiveAccounts,
  (accounts) =>
    accounts.reduce((total, account) => {
      const available =
        account.accountType === AccountType.CURRENT && account.overdraftLimit
          ? account.balance + account.overdraftLimit
          : account.balance;
      return total + available;
    }, 0)
);

// Get low balance accounts
export const selectLowBalanceAccounts = createSelector(
  selectActiveAccounts,
  (accounts) =>
    accounts.filter((account) => {
      const threshold = account.accountType === AccountType.SAVINGS ? 2000 : 7000;
      return account.balance < threshold;
    })
);

/**
 * Count Selectors
 */

// Total number of accounts
export const selectAccountsCount = createSelector(
  selectAllAccounts,
  (accounts) => accounts.length
);

// Number of active accounts
export const selectActiveAccountsCount = createSelector(
  selectActiveAccounts,
  (accounts) => accounts.length
);

// Number of closed accounts
export const selectClosedAccountsCount = createSelector(
  selectClosedAccounts,
  (accounts) => accounts.length
);

// Number of accounts with low balance
export const selectLowBalanceCount = createSelector(
  selectLowBalanceAccounts,
  (accounts) => accounts.length
);

/**
 * Statistics Selector
 */
export const selectAccountStatistics = createSelector(
  selectAllAccounts,
  selectActiveAccounts,
  selectClosedAccounts,
  selectSuspendedAccounts,
  selectSavingsAccounts,
  selectCurrentAccounts,
  selectTotalBalance,
  selectTotalAvailableBalance,
  selectLowBalanceAccounts,
  (
    allAccounts,
    activeAccounts,
    closedAccounts,
    suspendedAccounts,
    savingsAccounts,
    currentAccounts,
    totalBalance,
    totalAvailableBalance,
    lowBalanceAccounts
  ) => ({
    totalAccounts: allAccounts.length,
    activeAccounts: activeAccounts.length,
    closedAccounts: closedAccounts.length,
    suspendedAccounts: suspendedAccounts.length,
    savingsAccounts: savingsAccounts.length,
    currentAccounts: currentAccounts.length,
    totalBalance: totalBalance,
    totalAvailableBalance: totalAvailableBalance,
    lowBalanceCount: lowBalanceAccounts.length
  })
);

/**
 * UI State Selectors
 */

// Check if any operation is in progress
export const selectIsOperationInProgress = createSelector(
  selectAccountsLoading,
  (loading) => loading
);

// Check if there's an error
export const selectHasError = createSelector(
  selectAccountError,
  (error) => error !== null
);

// Check if data needs refresh (older than 5 minutes)
export const selectNeedsRefresh = createSelector(
  selectLastUpdated,
  (lastUpdated) => {
    if (!lastUpdated) {
      return true;
    }
    const FIVE_MINUTES = 5 * 60 * 1000;
    const now = new Date().getTime();
    const lastUpdate = new Date(lastUpdated).getTime();
    return now - lastUpdate > FIVE_MINUTES;
  }
);

// Check if data is ready (initialized and not loading)
export const selectIsDataReady = createSelector(
  selectInitialized,
  selectAccountsLoading,
  (initialized, loading) => initialized && !loading
);

/**
 * Composite Selectors
 */

// Get accounts with their status info
export const selectAccountsWithStatus = createSelector(
  selectAllAccounts,
  (accounts) =>
    accounts.map((account) => ({
      ...account,
      isLowBalance:
        account.balance <
        (account.accountType === AccountType.SAVINGS ? 2000 : 7000),
      canTransact: account.status === AccountStatus.ACTIVE,
      availableBalance:
        account.accountType === AccountType.CURRENT && account.overdraftLimit
          ? account.balance + account.overdraftLimit
          : account.balance
    }))
);

// Get selected account with enhanced info
export const selectSelectedAccountWithInfo = createSelector(
  selectSelectedAccount,
  (account) => {
    if (!account) {
      return null;
    }
    return {
      ...account,
      isLowBalance:
        account.balance <
        (account.accountType === AccountType.SAVINGS ? 2000 : 7000),
      canTransact: account.status === AccountStatus.ACTIVE,
      availableBalance:
        account.accountType === AccountType.CURRENT && account.overdraftLimit
          ? account.balance + account.overdraftLimit
          : account.balance
    };
  }
);