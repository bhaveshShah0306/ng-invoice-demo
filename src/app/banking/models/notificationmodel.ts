// src/app/banking/models/notification.model.ts

export enum NotificationType {
  LOW_BALANCE = 'LOW_BALANCE',
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',
  ACCOUNT_CLOSED = 'ACCOUNT_CLOSED',
  DEPOSIT_SUCCESS = 'DEPOSIT_SUCCESS',
  WITHDRAWAL_SUCCESS = 'WITHDRAWAL_SUCCESS',
  WITHDRAWAL_FAILED = 'WITHDRAWAL_FAILED',
  INTEREST_CREDITED = 'INTEREST_CREDITED',
  SERVICE_CHARGE_DEDUCTED = 'SERVICE_CHARGE_DEDUCTED',
  OVERDRAFT_WARNING = 'OVERDRAFT_WARNING',
  DAILY_LIMIT_REACHED = 'DAILY_LIMIT_REACHED',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  ACCOUNT_REACTIVATED = 'ACCOUNT_REACTIVATED'
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED',
  DISMISSED = 'DISMISSED'
}

export interface Notification {
  id: number;
  accountId: number;
  accountNumber: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  status: NotificationStatus;
  metadata?: NotificationMetadata;
  createdDate: Date;
  readDate?: Date;
  expiryDate?: Date;
}

export interface NotificationMetadata {
  transactionId?: number;
  amount?: number;
  balance?: number;
  threshold?: number;
  actionRequired?: boolean;
  actionUrl?: string;
  [key: string]: any;
}

export interface CreateNotificationRequest {
  accountId: number;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  metadata?: NotificationMetadata;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  notification: Notification;
}

export interface GetNotificationsRequest {
  accountId: number;
  status?: NotificationStatus;
  type?: NotificationType;
  priority?: NotificationPriority;
  startDate?: Date;
  endDate?: Date;
  pageNumber?: number;
  pageSize?: number;
}

export interface GetNotificationsResponse {
  accountId: number;
  notifications: Notification[];
  unreadCount: number;
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface MarkNotificationRequest {
  notificationId: number;
  status: NotificationStatus;
}

export interface MarkAllNotificationsRequest {
  accountId: number;
  status: NotificationStatus;
  type?: NotificationType;
}

export interface LowBalanceCheckRequest {
  accountId: number;
}

export interface LowBalanceCheckResponse {
  accountId: number;
  currentBalance: number;
  minBalanceRequired: number;
  isLowBalance: boolean;
  notification?: Notification;
}

export interface NotificationPreferences {
  accountId: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notificationTypes: {
    [key in NotificationType]?: boolean;
  };
}

// Notification templates for different types
export const NOTIFICATION_TEMPLATES = {
  LOW_BALANCE: {
    title: 'Low Balance Alert',
    getMessage: (balance: number, minBalance: number) => 
      `Your account balance (₹${balance.toFixed(2)}) is below the minimum required balance of ₹${minBalance.toFixed(2)}.`
  },
  ACCOUNT_CREATED: {
    title: 'Account Created Successfully',
    getMessage: (accountNumber: string) => 
      `Your account ${accountNumber} has been created successfully. Welcome aboard!`
  },
  ACCOUNT_CLOSED: {
    title: 'Account Closed',
    getMessage: (accountNumber: string) => 
      `Your account ${accountNumber} has been closed successfully.`
  },
  DEPOSIT_SUCCESS: {
    title: 'Deposit Successful',
    getMessage: (amount: number, balance: number) => 
      `₹${amount.toFixed(2)} deposited successfully. Current balance: ₹${balance.toFixed(2)}.`
  },
  WITHDRAWAL_SUCCESS: {
    title: 'Withdrawal Successful',
    getMessage: (amount: number, balance: number) => 
      `₹${amount.toFixed(2)} withdrawn successfully. Current balance: ₹${balance.toFixed(2)}.`
  },
  WITHDRAWAL_FAILED: {
    title: 'Withdrawal Failed',
    getMessage: (reason: string) => 
      `Your withdrawal request failed. Reason: ${reason}`
  },
  INTEREST_CREDITED: {
    title: 'Interest Credited',
    getMessage: (amount: number, balance: number) => 
      `Interest of ₹${amount.toFixed(2)} credited to your account. Current balance: ₹${balance.toFixed(2)}.`
  },
  SERVICE_CHARGE_DEDUCTED: {
    title: 'Service Charge Deducted',
    getMessage: (amount: number, balance: number) => 
      `Monthly service charge of ₹${amount.toFixed(2)} deducted. Current balance: ₹${balance.toFixed(2)}.`
  },
  OVERDRAFT_WARNING: {
    title: 'Overdraft Warning',
    getMessage: (overdraftUsed: number, overdraftLimit: number) => 
      `You are using ₹${overdraftUsed.toFixed(2)} of your ₹${overdraftLimit.toFixed(2)} overdraft limit.`
  },
  DAILY_LIMIT_REACHED: {
    title: 'Daily Withdrawal Limit Reached',
    getMessage: (limit: number) => 
      `You have reached your daily withdrawal limit of ₹${limit.toFixed(2)}.`
  },
  ACCOUNT_SUSPENDED: {
    title: 'Account Suspended',
    getMessage: (reason: string) => 
      `Your account has been suspended. Reason: ${reason}. Please contact support.`
  },
  ACCOUNT_REACTIVATED: {
    title: 'Account Reactivated',
    getMessage: (accountNumber: string) => 
      `Your account ${accountNumber} has been reactivated successfully.`
  }
};

// Priority mapping based on notification type
export const NOTIFICATION_PRIORITY_MAP: Record<NotificationType, NotificationPriority> = {
  [NotificationType.LOW_BALANCE]: NotificationPriority.HIGH,
  [NotificationType.ACCOUNT_CREATED]: NotificationPriority.MEDIUM,
  [NotificationType.ACCOUNT_CLOSED]: NotificationPriority.HIGH,
  [NotificationType.DEPOSIT_SUCCESS]: NotificationPriority.LOW,
  [NotificationType.WITHDRAWAL_SUCCESS]: NotificationPriority.MEDIUM,
  [NotificationType.WITHDRAWAL_FAILED]: NotificationPriority.HIGH,
  [NotificationType.INTEREST_CREDITED]: NotificationPriority.LOW,
  [NotificationType.SERVICE_CHARGE_DEDUCTED]: NotificationPriority.MEDIUM,
  [NotificationType.OVERDRAFT_WARNING]: NotificationPriority.CRITICAL,
  [NotificationType.DAILY_LIMIT_REACHED]: NotificationPriority.HIGH,
  [NotificationType.ACCOUNT_SUSPENDED]: NotificationPriority.CRITICAL,
  [NotificationType.ACCOUNT_REACTIVATED]: NotificationPriority.MEDIUM
};