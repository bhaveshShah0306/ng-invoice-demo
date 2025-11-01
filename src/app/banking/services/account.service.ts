// src/app/banking/services/account.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry, delay } from 'rxjs/operators';

import {
  Account,
  CreateAccountRequest,
  CreateAccountResponse,
  CloseAccountRequest,
  CloseAccountResponse,
  BalanceCheckResponse,
  AccountType,
  AccountStatus,
  ACCOUNT_RULES
} from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  
  // JSON Server Base URL
  private readonly baseUrl = 'http://localhost:3000';
  
  // API Endpoints
  private readonly endpoints = {
    accounts: `${this.baseUrl}/accounts`,
    accountById: (id: number) => `${this.baseUrl}/accounts/${id}`,
    transactions: `${this.baseUrl}/transactions`,
    notifications: `${this.baseUrl}/notifications`
  };

  constructor(private http: HttpClient) {}

  getAllAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(this.endpoints.accounts)
      .pipe(
        map(accounts => this.transformAccountDates(accounts)),
        retry(1),
        catchError(this.handleError)
      );
  }

  getAccountById(accountId: number): Observable<Account> {
    return this.http.get<Account>(this.endpoints.accountById(accountId))
      .pipe(
        map(account => this.transformAccountDate(account)),
        catchError(this.handleError)
      );
  }

  getAccountsByStatus(status: AccountStatus): Observable<Account[]> {
    const params = new HttpParams().set('status', status);
    
    return this.http.get<Account[]>(this.endpoints.accounts, { params })
      .pipe(
        map(accounts => this.transformAccountDates(accounts)),
        catchError(this.handleError)
      );
  }

  getAccountsByType(type: AccountType): Observable<Account[]> {
    const params = new HttpParams().set('accountType', type);
    
    return this.http.get<Account[]>(this.endpoints.accounts, { params })
      .pipe(
        map(accounts => this.transformAccountDates(accounts)),
        catchError(this.handleError)
      );
  }

  searchAccounts(searchTerm: string): Observable<Account[]> {
    const params = new HttpParams().set('q', searchTerm);
    
    return this.http.get<Account[]>(this.endpoints.accounts, { params })
      .pipe(
        map(accounts => this.transformAccountDates(accounts)),
        catchError(this.handleError)
      );
  }

  createAccount(request: CreateAccountRequest): Observable<CreateAccountResponse> {
    // Generate account number
    const accountNumber = this.generateAccountNumber();
    
    // Determine account-specific properties based on type
    const minBalance = request.accountType === AccountType.SAVINGS 
      ? ACCOUNT_RULES.SAVINGS.MIN_BALANCE 
      : ACCOUNT_RULES.CURRENT.MIN_BALANCE;
    
    const monthlyServiceCharge = request.accountType === AccountType.CURRENT 
      ? ACCOUNT_RULES.CURRENT.MONTHLY_SERVICE_CHARGE 
      : 0;
    
    const interestRate = request.accountType === AccountType.SAVINGS 
      ? ACCOUNT_RULES.SAVINGS.INTEREST_RATE 
      : 0;

    // Build account object
    const newAccount: Omit<Account, 'id'> = {
      accountNumber,
      accountType: request.accountType,
      accountHolderName: request.accountHolderName,
      email: request.email,
      phone: request.phone,
      balance: request.initialDeposit,
      minBalance,
      status: AccountStatus.ACTIVE,
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      monthlyServiceCharge,
      interestRate,
      // Add overdraft for current accounts
      ...(request.accountType === AccountType.CURRENT && {
        overdraftLimit: ACCOUNT_RULES.CURRENT.OVERDRAFT_LIMIT
      })
    };

    return this.http.post<Account>(this.endpoints.accounts, newAccount)
      .pipe(
        delay(500), // Simulate network delay
        map((account: Account) => ({
          success: true,
          message: `Account ${account.accountNumber} created successfully!`,
          account: this.transformAccountDate(account)
        })),
        catchError(this.handleError)
      );
  }

  /**
   * Check account balance
   * GET http://localhost:3000/accounts/:id
   */
  checkBalance(accountId: number): Observable<BalanceCheckResponse> {
    return this.http.get<Account>(this.endpoints.accountById(accountId))
      .pipe(
        map(account => {
          const threshold = account.accountType === AccountType.SAVINGS
            ? ACCOUNT_RULES.SAVINGS.LOW_BALANCE_THRESHOLD
            : ACCOUNT_RULES.CURRENT.LOW_BALANCE_THRESHOLD;
          
          const availableBalance = account.accountType === AccountType.CURRENT && account.overdraftLimit
            ? account.balance + account.overdraftLimit
            : account.balance;

          return {
            accountId: account.id,
            accountNumber: account.accountNumber,
            currentBalance: account.balance,
            availableBalance,
            isLowBalance: account.balance < threshold,
            minBalanceRequired: account.minBalance
          };
        }),
        catchError(this.handleError)
      );
  }

  // ============================================================================
  // PUT/PATCH OPERATIONS
  // ============================================================================

  /**
   * Update account balance
   * PATCH http://localhost:3000/accounts/:id
   */
  updateAccountBalance(accountId: number, newBalance: number): Observable<Account> {
    const updates = {
      balance: newBalance,
      lastModifiedDate: new Date()
    };

    return this.http.patch<Account>(this.endpoints.accountById(accountId), updates)
      .pipe(
        map(account => this.transformAccountDate(account)),
        catchError(this.handleError)
      );
  }

  /**
   * Update account status
   * PATCH http://localhost:3000/accounts/:id
   */
  updateAccountStatus(accountId: number, status: AccountStatus): Observable<Account> {
    const updates = {
      status,
      lastModifiedDate: new Date()
    };

    return this.http.patch<Account>(this.endpoints.accountById(accountId), updates)
      .pipe(
        map(account => this.transformAccountDate(account)),
        catchError(this.handleError)
      );
  }

  // ============================================================================
  // DELETE OPERATIONS
  // ============================================================================

  /**
   * Close an account
   * For JSON Server: We update status to CLOSED instead of deleting
   * PATCH http://localhost:3000/accounts/:id
   */
  closeAccount(accountId: number, reason: string = 'Customer request'): Observable<CloseAccountResponse> {
    const updates = {
      status: AccountStatus.CLOSED,
      lastModifiedDate: new Date()
    };

    return this.http.patch<Account>(this.endpoints.accountById(accountId), updates)
      .pipe(
        delay(300),
        map(() => ({
          success: true,
          message: 'Account closed successfully',
          closedDate: new Date()
        })),
        catchError(this.handleError)
      );
  }

  /**
   * Permanently delete account (use with caution)
   * DELETE http://localhost:3000/accounts/:id
   */
  deleteAccount(accountId: number): Observable<void> {
    return this.http.delete<void>(this.endpoints.accountById(accountId))
      .pipe(
        catchError(this.handleError)
      );
  }

  // ============================================================================
  // STATISTICS & REPORTING
  // ============================================================================

  /**
   * Get account statistics
   * Calculated client-side from all accounts
   */
  getAccountStatistics(): Observable<any> {
    return this.getAllAccounts().pipe(
      map(accounts => {
        const active = accounts.filter(a => a.status === AccountStatus.ACTIVE);
        const savings = accounts.filter(a => a.accountType === AccountType.SAVINGS);
        const current = accounts.filter(a => a.accountType === AccountType.CURRENT);
        
        return {
          totalAccounts: accounts.length,
          activeAccounts: active.length,
          closedAccounts: accounts.filter(a => a.status === AccountStatus.CLOSED).length,
          suspendedAccounts: accounts.filter(a => a.status === AccountStatus.SUSPENDED).length,
          savingsAccounts: savings.length,
          currentAccounts: current.length,
          totalBalance: active.reduce((sum, a) => sum + a.balance, 0)
        };
      })
    );
  }

  /**
   * Get low balance accounts
   * Filter client-side based on thresholds
   */
  getLowBalanceAccounts(): Observable<Account[]> {
    return this.getAllAccounts().pipe(
      map(accounts => accounts.filter(account => {
        if (account.status !== AccountStatus.ACTIVE) return false;
        
        const threshold = account.accountType === AccountType.SAVINGS
          ? ACCOUNT_RULES.SAVINGS.LOW_BALANCE_THRESHOLD
          : ACCOUNT_RULES.CURRENT.LOW_BALANCE_THRESHOLD;
        
        return account.balance < threshold;
      }))
    );
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Generate unique account number
   * Format: ACC + 9 random digits
   */
  private generateAccountNumber(): string {
    const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
    return `ACC${randomDigits}`;
  }

  /**
   * Get HTTP options with headers
   */
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  /**
   * Transform account dates from string to Date objects
   */
  private transformAccountDate(account: Account): Account {
    return {
      ...account,
      createdDate: new Date(account.createdDate),
      lastModifiedDate: new Date(account.lastModifiedDate)
    };
  }

  /**
   * Transform account dates for array
   */
  private transformAccountDates(accounts: Account[]): Account[] {
    return accounts.map(account => this.transformAccountDate(account));
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please ensure JSON Server is running on http://localhost:3000';
      } else if (error.status === 400) {
        errorMessage = 'Invalid request. Please check your input.';
      } else if (error.status === 404) {
        errorMessage = 'Account not found.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.statusText}`;
      }
    }

    console.error('Account Service Error:', {
      status: error.status,
      message: errorMessage,
      error: error.error,
      url: error.url
    });

    return throwError(() => new Error(errorMessage));
  }
}

/**
 * USAGE WITH JSON SERVER:
 * 
 * 1. Start JSON Server:
 *    json-server --watch src/data/db.json --port 3000
 * 
 * 2. Available Endpoints:
 *    GET    http://localhost:3000/accounts              - Get all accounts
 *    GET    http://localhost:3000/accounts/1            - Get account by ID
 *    GET    http://localhost:3000/accounts?status=ACTIVE - Filter by status
 *    POST   http://localhost:3000/accounts              - Create account
 *    PATCH  http://localhost:3000/accounts/1            - Update account
 *    DELETE http://localhost:3000/accounts/1            - Delete account
 * 
 * 3. Query Parameters:
 *    ?status=ACTIVE                 - Filter by status
 *    ?accountType=SAVINGS           - Filter by type
 *    ?q=Ravi                        - Full-text search
 *    ?_sort=balance&_order=desc     - Sort by balance descending
 *    ?_page=1&_limit=10             - Pagination
 * 
 * 4. Usage in Components:
 *    this.accountService.getAllAccounts().subscribe(accounts => {
 *      console.log(accounts);
 *    });
 */