// src/app/banking/store/account.reducer.ts

import { createReducer, on } from '@ngrx/store';
import { AccountState, initialAccountState } from './account.state';
import * as AccountActions from './account.actions';

/**
 * Account Reducer
 * Handles all state transitions for the banking accounts feature
 */
export const accountReducer = createReducer(
  initialAccountState,

  // ============================================================================
  // LOAD ALL ACCOUNTS
  // ============================================================================
  
  /**
   * When loading accounts starts
   * - Set loading to true
   * - Clear any previous errors
   * - Keep existing accounts data during reload
   */
  on(AccountActions.loadAccounts, (state): AccountState => ({
    ...state,
    loading: true,
    error: null
  })),

  /**
   * When accounts are loaded successfully
   * - Store the accounts array
   * - Set loading to false
   * - Mark as initialized
   * - Update lastUpdated timestamp
   * - Clear any errors
   */
  on(AccountActions.loadAccountsSuccess, (state, { accounts }): AccountState => ({
    ...state,
    accounts,
    loading: false,
    error: null,
    initialized: true,
    lastUpdated: new Date()
  })),

  /**
   * When loading accounts fails
   * - Set loading to false
   * - Store the error message
   * - Keep existing accounts data
   */
  on(AccountActions.loadAccountsFailure, (state, { error }): AccountState => ({
    ...state,
    loading: false,
    error
  })),

  // ============================================================================
  // LOAD SINGLE ACCOUNT
  // ============================================================================
  
  /**
   * When loading a single account starts
   * - Set loading to true
   * - Clear any previous errors
   */
  on(AccountActions.loadAccount, (state): AccountState => ({
    ...state,
    loading: true,
    error: null
  })),

  /**
   * When a single account is loaded successfully
   * - Set as the selected account
   * - Store the account ID
   * - Update the account in the accounts array if it exists
   * - Set loading to false
   * - Clear any errors
   */
  on(AccountActions.loadAccountSuccess, (state, { account }): AccountState => {
    // Check if account already exists in the array
    const accountExists = state.accounts.some(a => a.id === account.id);
    
    // Update or add the account to the array
    const updatedAccounts = accountExists
      ? state.accounts.map(a => a.id === account.id ? account : a)
      : [...state.accounts, account];

    return {
      ...state,
      accounts: updatedAccounts,
      selectedAccount: account,
      selectedAccountId: account.id,
      loading: false,
      error: null,
      lastUpdated: new Date()
    };
  }),

  /**
   * When loading a single account fails
   * - Set loading to false
   * - Store the error message
   */
  on(AccountActions.loadAccountFailure, (state, { error }): AccountState => ({
    ...state,
    loading: false,
    error
  })),

  // ============================================================================
  // CREATE ACCOUNT
  // ============================================================================
  
  /**
   * When creating an account starts
   * - Set loading to true
   * - Clear any previous errors
   */
  on(AccountActions.createAccount, (state): AccountState => ({
    ...state,
    loading: true,
    error: null
  })),

  /**
   * When an account is created successfully
   * - Add the new account to the accounts array
   * - Set loading to false
   * - Update lastUpdated timestamp
   * - Clear any errors
   */
  on(AccountActions.createAccountSuccess, (state, { response }): AccountState => ({
    ...state,
    accounts: [...state.accounts, response.account],
    loading: false,
    error: null,
    lastUpdated: new Date()
  })),

  /**
   * When creating an account fails
   * - Set loading to false
   * - Store the error message
   */
  on(AccountActions.createAccountFailure, (state, { error }): AccountState => ({
    ...state,
    loading: false,
    error
  })),

  // ============================================================================
  // DELETE/CLOSE ACCOUNT
  // ============================================================================
  
  /**
   * When deleting an account starts
   * - Set loading to true
   * - Clear any previous errors
   */
  on(AccountActions.deleteAccount, (state): AccountState => ({
    ...state,
    loading: true,
    error: null
  })),

  /**
   * When an account is deleted successfully
   * - Remove the account from the accounts array
   * - Clear selected account if it was the deleted one
   * - Set loading to false
   * - Update lastUpdated timestamp
   * - Clear any errors
   */
  on(AccountActions.deleteAccountSuccess, (state, { accountId }): AccountState => {
    const updatedAccounts = state.accounts.filter(account => account.id !== accountId);
    const selectedAccountCleared = state.selectedAccountId === accountId;

    return {
      ...state,
      accounts: updatedAccounts,
      selectedAccount: selectedAccountCleared ? null : state.selectedAccount,
      selectedAccountId: selectedAccountCleared ? null : state.selectedAccountId,
      loading: false,
      error: null,
      lastUpdated: new Date()
    };
  }),

  /**
   * When deleting an account fails
   * - Set loading to false
   * - Store the error message
   */
  on(AccountActions.deleteAccountFailure, (state, { error }): AccountState => ({
    ...state,
    loading: false,
    error
  })),

  // ============================================================================
  // CHECK BALANCE
  // ============================================================================
  
  /**
   * When checking balance starts
   * - Set loading to true
   * - Clear any previous errors
   */
  on(AccountActions.checkBalance, (state): AccountState => ({
    ...state,
    loading: true,
    error: null
  })),

  /**
   * When balance check succeeds
   * - Update the account's balance in the accounts array
   * - Update selected account if it's the same account
   * - Set loading to false
   * - Update lastUpdated timestamp
   * - Clear any errors
   */
  on(AccountActions.checkBalanceSuccess, (state, { response }): AccountState => {
    const updatedAccounts = state.accounts.map(account => {
      if (account.id === response.accountId) {
        return {
          ...account,
          balance: response.currentBalance,
          lastModifiedDate: new Date()
        };
      }
      return account;
    });

    // Update selected account if it matches
    const updatedSelectedAccount = state.selectedAccount?.id === response.accountId
      ? {
          ...state.selectedAccount,
          balance: response.currentBalance,
          lastModifiedDate: new Date()
        }
      : state.selectedAccount;

    return {
      ...state,
      accounts: updatedAccounts,
      selectedAccount: updatedSelectedAccount,
      loading: false,
      error: null,
      lastUpdated: new Date()
    };
  }),

  /**
   * When balance check fails
   * - Set loading to false
   * - Store the error message
   */
  on(AccountActions.checkBalanceFailure, (state, { error }): AccountState => ({
    ...state,
    loading: false,
    error
  })),

  // ============================================================================
  // UTILITY ACTIONS
  // ============================================================================
  
  /**
   * Select an account by ID
   * - Find and set the selected account from the accounts array
   * - Set the selected account ID
   * - If accountId is null, clear the selection
   */
  on(AccountActions.selectAccount, (state, { accountId }): AccountState => {
    if (accountId === null) {
      return {
        ...state,
        selectedAccount: null,
        selectedAccountId: null
      };
    }

    const account = state.accounts.find(a => a.id === accountId);
    
    return {
      ...state,
      selectedAccount: account || null,
      selectedAccountId: accountId
    };
  }),

  /**
   * Clear any error messages
   * - Reset error to null
   */
  on(AccountActions.clearError, (state): AccountState => ({
    ...state,
    error: null
  }))
);

/**
 * Export the reducer function
 * This is required for AOT compilation
 */
export function AccountReducer(state: AccountState | undefined, action: any): AccountState {
  return accountReducer(state, action);
}