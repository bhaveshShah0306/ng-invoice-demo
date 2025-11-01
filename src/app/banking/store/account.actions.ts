import { createAction, props } from '@ngrx/store';
import {
  Account,
  CreateAccountRequest,
  CreateAccountResponse,
  CloseAccountResponse,
  BalanceCheckResponse
} from '../models/account.model';

// Load Actions
export const loadAccounts = createAction('[Account] Load Accounts');

export const loadAccountsSuccess = createAction(
  '[Account] Load Accounts Success',
  props<{ accounts: Account[] }>()
);

export const loadAccountsFailure = createAction(
  '[Account] Load Accounts Failure',
  props<{ error: string }>()
);

// Load Single Account
export const loadAccount = createAction(
  '[Account] Load Account',
  props<{ accountId: number }>()
);

export const loadAccountSuccess = createAction(
  '[Account] Load Account Success',
  props<{ account: Account }>()
);

export const loadAccountFailure = createAction(
  '[Account] Load Account Failure',
  props<{ error: string }>()
);

// Create Account Actions
export const createAccount = createAction(
  '[Account] Create Account',
  props<{ request: CreateAccountRequest }>()
);

export const createAccountSuccess = createAction(
  '[Account] Create Account Success',
  props<{ response: CreateAccountResponse }>()
);

export const createAccountFailure = createAction(
  '[Account] Create Account Failure',
  props<{ error: string }>()
);

// Delete Account Actions
export const deleteAccount = createAction(
  '[Account] Delete Account',
  props<{ accountId: number }>()
);

export const deleteAccountSuccess = createAction(
  '[Account] Delete Account Success',
  props<{ accountId: number; response: CloseAccountResponse }>()
);

export const deleteAccountFailure = createAction(
  '[Account] Delete Account Failure',
  props<{ error: string }>()
);

// Check Balance Actions
export const checkBalance = createAction(
  '[Account] Check Balance',
  props<{ accountId: number }>()
);

export const checkBalanceSuccess = createAction(
  '[Account] Check Balance Success',
  props<{ response: BalanceCheckResponse }>()
);

export const checkBalanceFailure = createAction(
  '[Account] Check Balance Failure',
  props<{ error: string }>()
);

// Clear Error
export const clearError = createAction('[Account] Clear Error');

// Select Account
export const selectAccount = createAction(
  '[Account] Select Account',
  props<{ accountId: number | null }>()
);