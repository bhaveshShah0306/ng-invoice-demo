// src/app/banking/models/transaction.model.ts

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  INTEREST_CREDIT = 'INTEREST_CREDIT',
  SERVICE_CHARGE_DEBIT = 'SERVICE_CHARGE_DEBIT',
  OVERDRAFT_FEE = 'OVERDRAFT_FEE',
  ACCOUNT_OPENING = 'ACCOUNT_OPENING',
  ACCOUNT_CLOSURE = 'ACCOUNT_CLOSURE'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED'
}

export interface Transaction {
  id: number;
  accountId: number;
  accountNumber: string;
  transactionType: TransactionType;
  amount: number;
  balanceBeforeTransaction: number;
  balanceAfterTransaction: number;
  status: TransactionStatus;
  remarks?: string;
  transactionDate: Date;
  createdBy?: string;
}

export interface DepositRequest {
  accountId: number;
  amount: number;
  remarks?: string;
}

export interface DepositResponse {
  success: boolean;
  message: string;
  transaction: Transaction;
  currentBalance: number;
}

export interface WithdrawalRequest {
  accountId: number;
  amount: number;
  remarks?: string;
}

export interface WithdrawalResponse {
  success: boolean;
  message: string;
  transaction: Transaction;
  currentBalance: number;
  availableBalance: number;
}

export interface TransactionHistoryRequest {
  accountId: number;
  startDate?: Date;
  endDate?: Date;
  transactionType?: TransactionType;
  pageNumber?: number;
  pageSize?: number;
}

export interface TransactionHistoryResponse {
  accountId: number;
  transactions: Transaction[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface TransactionSummary {
  accountId: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalInterestCredited: number;
  totalServiceCharges: number;
  netBalance: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

// Constants for transaction rules
export const TRANSACTION_RULES = {
  MIN_DEPOSIT_AMOUNT: 100,
  MIN_WITHDRAWAL_AMOUNT: 100,
  MAX_DEPOSIT_AMOUNT: 1000000,
  DAILY_WITHDRAWAL_LIMIT: 100000,
  OVERDRAFT_FEE_PERCENTAGE: 2
};