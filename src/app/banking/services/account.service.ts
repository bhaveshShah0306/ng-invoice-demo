// src/app/banking/services/account.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Environment } from '../../../environments/environment.interface';

import {
  Account,
  CreateAccountRequest,
  CreateAccountResponse,
  CloseAccountRequest,
  CloseAccountResponse,
  BalanceCheckResponse,
  AccountType,
  AccountStatus
} from '../models/account.model';

/**
 * Account Service
 * Handles all HTTP operations for banking accounts
 * Communicates with .NET 8 API backend
 */
@Injectable({
  providedIn: 'root'
})
export class AccountService {
  
  // API Base URL - can be configured in environment files
  private readonly baseUrl: string;
  
  // API Endpoints
  private readonly endpoints = {
    accounts: '/api/accounts',
    balance: (id: number) => `/api/accounts/${id}/balance`,
    accountById: (id: number) => `/api/accounts/${id}`,
    closeAccount: (id: number) => `/api/accounts/${id}`,
    statistics: '/api/accounts/statistics'
  };

  constructor(private http: HttpClient) {
    // Use BankingAPIUrl if available, otherwise fallback to APIUrl
    this.baseUrl = (environment as any).BankingAPIUrl ?? environment.APIUrl ?? 'https://localhost:7143';
  }

  // ============================================================================
  // GET OPERATIONS
  // ============================================================================

  /**
   * Get all accounts
   * GET /api/accounts
   * @returns Observable<Account[]>
   */
  getAllAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}${this.endpoints.accounts}`)
      .pipe(
        map(accounts => this.transformAccountDates(accounts)),
        retry(1), // Retry once on failure
        catchError(this.handleError)
      );
  }

  /**
   * Get account by ID
   * GET /api/accounts/{id}
   * @param accountId - Account ID
   * @returns Observable<Account>
   */
  getAccountById(accountId: number): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}${this.endpoints.accountById(accountId)}`)
      .pipe(
        map(account => this.transformAccountDate(account)),
        catchError(this.handleError)
      );
  }

  /**
   * Get accounts by status
   * GET /api/accounts?status={status}
   * @param status - Account status filter
   * @returns Observable<Account[]>
   */
  getAccountsByStatus(status: AccountStatus): Observable<Account[]> {
    const params = new HttpParams().set('status', status);
    
    return this.http.get<Account[]>(`${this.baseUrl}${this.endpoints.accounts}`, { params })
      .pipe(
        map(accounts => this.transformAccountDates(accounts)),
        catchError(this.handleError)
      );
  }

  /**
   * Get accounts by type
   * GET /api/accounts?type={type}
   * @param type - Account type filter
   * @returns Observable<Account[]>
   */
  getAccountsByType(type: AccountType): Observable<Account[]> {
    const params = new HttpParams().set('type', type);
    
    return this.http.get<Account[]>(`${this.baseUrl}${this.endpoints.accounts}`, { params })
      .pipe(
        map(accounts => this.transformAccountDates(accounts)),
        catchError(this.handleError)
      );
  }

  /**
   * Get accounts by account holder name
   * GET /api/accounts?search={name}
   * @param searchTerm - Search term for account holder name
   * @returns Observable<Account[]>
   */
  searchAccounts(searchTerm: string): Observable<Account[]> {
    const params = new HttpParams().set('search', searchTerm);
    
    return this.http.get<Account[]>(`${this.baseUrl}${this.endpoints.accounts}`, { params })
      .pipe(
        map(accounts => this.transformAccountDates(accounts)),
        catchError(this.handleError)
      );
  }

  // ============================================================================
  // POST OPERATIONS
  // ============================================================================

  /**
   * Create a new account
   * POST /api/accounts
   * @param request - CreateAccountRequest
   * @returns Observable<CreateAccountResponse>
   */
  createAccount(request: CreateAccountRequest): Observable<CreateAccountResponse> {
    return this.http.post<CreateAccountResponse>(
      `${this.baseUrl}${this.endpoints.accounts}`,
      request,
      this.getHttpOptions()
    ).pipe(
      map(response => ({
        ...response,
        account: this.transformAccountDate(response.account)
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Check account balance
   * POST /api/accounts/{id}/balance
   * Alternative: GET /api/accounts/{id}/balance
   * @param accountId - Account ID
   * @returns Observable<BalanceCheckResponse>
   */
  checkBalance(accountId: number): Observable<BalanceCheckResponse> {
    return this.http.get<BalanceCheckResponse>(
      `${this.baseUrl}${this.endpoints.balance(accountId)}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  // ============================================================================
  // DELETE OPERATIONS
  // ============================================================================

  /**
   * Close an account
   * DELETE /api/accounts/{id}
   * @param accountId - Account ID to close
   * @param reason - Reason for closing (optional)
   * @returns Observable<CloseAccountResponse>
   */
  closeAccount(accountId: number, reason: string = 'Customer request'): Observable<CloseAccountResponse> {
    const request: CloseAccountRequest = {
      accountId,
      reason
    };

    // Send reason as query parameter or in body based on API design
    const params = new HttpParams().set('reason', reason);

    return this.http.delete<CloseAccountResponse>(
      `${this.baseUrl}${this.endpoints.closeAccount(accountId)}`,
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // ============================================================================
  // STATISTICS & REPORTING
  // ============================================================================

  /**
   * Get account statistics
   * GET /api/accounts/statistics
   * @returns Observable with account statistics
   */
  getAccountStatistics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${this.endpoints.statistics}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get low balance accounts
   * GET /api/accounts/low-balance
   * @returns Observable<Account[]>
   */
  getLowBalanceAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}${this.endpoints.accounts}/low-balance`)
      .pipe(
        map(accounts => this.transformAccountDates(accounts)),
        catchError(this.handleError)
      );
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get HTTP options with headers
   * @private
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
   * Handles single account
   * @private
   */
  private transformAccountDate(account: Account): Account {
    return {
      ...account,
      createdDate: new Date(account.createdDate),
      lastModifiedDate: new Date(account.lastModifiedDate)
    };
  }

  /**
   * Transform account dates from string to Date objects
   * Handles array of accounts
   * @private
   */
  private transformAccountDates(accounts: Account[]): Account[] {
    return accounts.map(account => this.transformAccountDate(account));
  }

  /**
   * Handle HTTP errors
   * @private
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check your network connection.';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Invalid request. Please check your input.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = error.error?.message || 'Account not found.';
      } else if (error.status === 409) {
        errorMessage = error.error?.message || 'Conflict. The account may already exist.';
      } else if (error.status === 422) {
        errorMessage = error.error?.message || 'Validation failed. Please check your input.';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error. Please try again later.';
      } else {
        errorMessage = error.error?.message || `Server Error: ${error.status} - ${error.statusText}`;
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

  // ============================================================================
  // VALIDATION HELPERS (Optional - Can be used in components)
  // ============================================================================

  /**
   * Validate account holder name
   * @param name - Account holder name
   * @returns boolean
   */
  validateAccountHolderName(name: string): boolean {
        if (!name) {
      return false;
    }
    const trimmedName = name.trim();
    return trimmedName.length >= 3 && trimmedName.length <= 100;
  }

  /**
   * Validate email format
   * @param email - Email address
   * @returns boolean
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (10 digits)
   * @param phone - Phone number
   * @returns boolean
   */
  validatePhone(phone: string): boolean {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate initial deposit amount based on account type
   * @param amount - Deposit amount
   * @param accountType - Type of account
   * @returns boolean
   */
  validateInitialDeposit(amount: number, accountType: AccountType): boolean {
    if (accountType === AccountType.SAVINGS) {
      return amount >= 1000; // ACCOUNT_RULES.SAVINGS.INITIAL_DEPOSIT_MIN
    } else if (accountType === AccountType.CURRENT) {
      return amount >= 5000; // ACCOUNT_RULES.CURRENT.INITIAL_DEPOSIT_MIN
    }
    return false;
  }

  // ============================================================================
  // MOCK DATA (FOR DEVELOPMENT - Remove in production)
  // ============================================================================

  /**
   * Get mock accounts for development/testing
   * Remove this in production
   * @returns Observable<Account[]>
   */
  getMockAccounts(): Observable<Account[]> {
    const mockAccounts: Account[] = [
      {
        id: 1,
        accountNumber: 'ACC001234567',
        accountType: AccountType.SAVINGS,
        accountHolderName: 'Ravi Krishna',
        email: 'ravi.krishna@example.com',
        phone: '9876543210',
        balance: 15000,
        minBalance: 1000,
        status: AccountStatus.ACTIVE,
        createdDate: new Date('2024-01-15'),
        lastModifiedDate: new Date('2024-11-01'),
        monthlyServiceCharge: 0,
        interestRate: 4.5
      },
      {
        id: 2,
        accountNumber: 'ACC001234568',
        accountType: AccountType.CURRENT,
        accountHolderName: 'Ramesh Kannan',
        email: 'ramesh.kannan@example.com',
        phone: '9876543211',
        balance: 25000,
        minBalance: 5000,
        overdraftLimit: 10000,
        status: AccountStatus.ACTIVE,
        createdDate: new Date('2024-02-20'),
        lastModifiedDate: new Date('2024-11-01'),
        monthlyServiceCharge: 500,
        interestRate: 0
      },
      {
        id: 3,
        accountNumber: 'ACC001234569',
        accountType: AccountType.SAVINGS,
        accountHolderName: 'Kishore Kumar',
        email: 'kishore.kumar@example.com',
        phone: '9876543212',
        balance: 1500,
        minBalance: 1000,
        status: AccountStatus.ACTIVE,
        createdDate: new Date('2024-03-10'),
        lastModifiedDate: new Date('2024-11-01'),
        monthlyServiceCharge: 0,
        interestRate: 4.5
      }
    ];

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(mockAccounts);
        observer.complete();
      }, 500); // Simulate network delay
    });
  }
}

/**
 * Account Service
 * 
 * Features:
 * - CRUD operations for bank accounts
 * - Balance checking and validation
 * - Account search and filtering
 * - Statistics and reporting
 * - Comprehensive error handling
 * - Mock data support for development
 * 
 * API Endpoints:
 * - GET    /api/accounts              - Get all accounts
 * - GET    /api/accounts/{id}         - Get account by ID
 * - POST   /api/accounts              - Create new account
 * - DELETE /api/accounts/{id}         - Close account
 * - GET    /api/accounts/{id}/balance - Check balance
 * 
 * Usage in Components:
 * ```typescript
 * constructor(private accountService: AccountService) {}
 * 
 * loadAccounts() {
 *   this.accountService.getAllAccounts().subscribe(
 *     accounts => console.log(accounts),
 *     error => console.error(error)
 *   );
 * }
 * ```
 */