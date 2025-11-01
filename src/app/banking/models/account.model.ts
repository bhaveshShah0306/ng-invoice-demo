// src/app/banking/models/account.model.ts

export enum AccountType {
  SAVINGS = 'SAVINGS',
  CURRENT = 'CURRENT'
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  SUSPENDED = 'SUSPENDED'
}

export interface Account {
  id: number;
  accountNumber: string;
  accountType: AccountType;
  accountHolderName: string;
  email: string;
  phone: string;
  balance: number;
  minBalance: number;
  overdraftLimit?: number; // Only for Current Account
  status: AccountStatus;
  createdDate: Date;
  lastModifiedDate: Date;
  monthlyServiceCharge: number;
  interestRate: number;
}

export interface SavingsAccount extends Account {
  accountType: AccountType.SAVINGS;
  withdrawalLimitPerTransaction: number;
}

export interface CurrentAccount extends Account {
  accountType: AccountType.CURRENT;
  overdraftLimit: number;  
}

export interface CreateAccountRequest {
  accountType: AccountType;
  accountHolderName: string;
  email: string;
  phone: string;
  initialDeposit: number;
}

export interface CreateAccountResponse {
  success: boolean;
  message: string;
  account: Account;
}

export interface CloseAccountRequest {
  accountId: number;
  reason: string;
}

export interface CloseAccountResponse {
  success: boolean;
  message: string;
  closedDate: Date;
}

export interface BalanceCheckResponse {
  accountId: number;
  accountNumber: string;
  currentBalance: number;
  availableBalance: number; // After considering overdraft for current account
  isLowBalance: boolean;
  minBalanceRequired: number;
}

// Constants for business rules
export const ACCOUNT_RULES = {
  SAVINGS: {
    MIN_BALANCE: 1000,
    LOW_BALANCE_THRESHOLD: 2000,
    WITHDRAWAL_LIMIT: 50000,
    INTEREST_RATE: 4.5,
    INITIAL_DEPOSIT_MIN: 1000
  },
  CURRENT: {
    MIN_BALANCE: 5000,
    LOW_BALANCE_THRESHOLD: 7000,
    OVERDRAFT_LIMIT: 10000,
    MONTHLY_SERVICE_CHARGE: 500,
    INITIAL_DEPOSIT_MIN: 5000
  }
};