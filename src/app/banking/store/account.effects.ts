// src/app/banking/store/account.effects.ts

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { map, catchError, exhaustMap, switchMap, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { AccountService } from '../services/account.service';
import * as AccountActions from './account.actions';

/**
 * Account Effects
 * Handles side effects for all account-related actions
 * - API calls
 * - Navigation
 * - Notifications
 * - Error handling
 */
@Injectable()
export class AccountEffects {
  
  constructor(
    private actions$: Actions,
    private accountService: AccountService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  // ============================================================================
  // LOAD ALL ACCOUNTS EFFECT
  // ============================================================================
  
  /**
   * Load all accounts from the API
   * Triggered by: loadAccounts action
   * Success: Dispatches loadAccountsSuccess with accounts array
   * Failure: Dispatches loadAccountsFailure with error message
   */
  loadAccounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.loadAccounts),
      exhaustMap(() =>
        this.accountService.getAllAccounts().pipe(
          map(accounts => 
            AccountActions.loadAccountsSuccess({ accounts })
          ),
          catchError(error => {
            const errorMessage = this.extractErrorMessage(error);
            this.showErrorNotification('Failed to load accounts', errorMessage);
            return of(AccountActions.loadAccountsFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // ============================================================================
  // LOAD SINGLE ACCOUNT EFFECT
  // ============================================================================
  
  /**
   * Load a single account by ID
   * Triggered by: loadAccount action
   * Success: Dispatches loadAccountSuccess with account data
   * Failure: Dispatches loadAccountFailure with error message
   */
  loadAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.loadAccount),
      exhaustMap(action =>
        this.accountService.getAccountById(action.accountId).pipe(
          map(account => 
            AccountActions.loadAccountSuccess({ account })
          ),
          catchError(error => {
            const errorMessage = this.extractErrorMessage(error);
            this.showErrorNotification('Failed to load account', errorMessage);
            return of(AccountActions.loadAccountFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // ============================================================================
  // CREATE ACCOUNT EFFECT
  // ============================================================================
  
  /**
   * Create a new account
   * Triggered by: createAccount action
   * Success: 
   *   - Dispatches createAccountSuccess
   *   - Shows success notification
   *   - Navigates to accounts list
   * Failure: 
   *   - Dispatches createAccountFailure
   *   - Shows error notification
   */
  createAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.createAccount),
      switchMap(action =>
        this.accountService.createAccount(action.request).pipe(
          map(response => {
            this.showSuccessNotification(
              'Account Created',
              `Account ${response.account.accountNumber} created successfully!`
            );
            return AccountActions.createAccountSuccess({ response });
          }),
          catchError(error => {
            const errorMessage = this.extractErrorMessage(error);
            this.showErrorNotification('Account Creation Failed', errorMessage);
            return of(AccountActions.createAccountFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  /**
   * Navigate to accounts list after successful account creation
   */
  createAccountSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AccountActions.createAccountSuccess),
        tap(() => {
          // Navigate after a brief delay to allow user to see success message
          setTimeout(() => {
            this.router.navigateByUrl('/banking/accounts');
          }, 1500);
        })
      ),
    { dispatch: false }
  );

  // ============================================================================
  // DELETE ACCOUNT EFFECT
  // ============================================================================
  
  /**
   * Delete/Close an account
   * Triggered by: deleteAccount action
   * Success: 
   *   - Dispatches deleteAccountSuccess
   *   - Shows success notification
   * Failure: 
   *   - Dispatches deleteAccountFailure
   *   - Shows error notification
   */
  deleteAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.deleteAccount),
      switchMap(action =>
        this.accountService.closeAccount(action.accountId).pipe(
          map(response => {
            this.showSuccessNotification(
              'Account Closed',
              'Account closed successfully'
            );
            return AccountActions.deleteAccountSuccess({ 
              accountId: action.accountId,
              response 
            });
          }),
          catchError(error => {
            const errorMessage = this.extractErrorMessage(error);
            this.showErrorNotification('Failed to close account', errorMessage);
            return of(AccountActions.deleteAccountFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // ============================================================================
  // CHECK BALANCE EFFECT
  // ============================================================================
  
  /**
   * Check account balance
   * Triggered by: checkBalance action
   * Success: Dispatches checkBalanceSuccess with balance data
   * Failure: Dispatches checkBalanceFailure with error message
   */
  checkBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.checkBalance),
      switchMap(action =>
        this.accountService.checkBalance(action.accountId).pipe(
          map(response => {
            // Show low balance warning if applicable
            if (response.isLowBalance) {
              this.showWarningNotification(
                'Low Balance Alert',
                `Your balance (₹${response.currentBalance.toFixed(2)}) is below the minimum required (₹${response.minBalanceRequired.toFixed(2)})`
              );
            }
            return AccountActions.checkBalanceSuccess({ response });
          }),
          catchError(error => {
            const errorMessage = this.extractErrorMessage(error);
            this.showErrorNotification('Balance Check Failed', errorMessage);
            return of(AccountActions.checkBalanceFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  /**
   * Extract meaningful error message from error object
   */
  private extractErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Show success notification
   */
  private showSuccessNotification(title: string, message: string): void {
    this.toastr.success(message, title, {
      timeOut: 3000,
      progressBar: true,
      closeButton: true
    });
  }

  /**
   * Show error notification
   */
  private showErrorNotification(title: string, message: string): void {
    this.toastr.error(message, title, {
      timeOut: 5000,
      progressBar: true,
      closeButton: true
    });
  }

  /**
   * Show warning notification
   */
  private showWarningNotification(title: string, message: string): void {
    this.toastr.warning(message, title, {
      timeOut: 4000,
      progressBar: true,
      closeButton: true
    });
  }

  /**
   * Show info notification
   */
  private showInfoNotification(title: string, message: string): void {
    this.toastr.info(message, title, {
      timeOut: 3000,
      progressBar: true,
      closeButton: true
    });
  }
}