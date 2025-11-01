// src/app/banking/components/account-details/account-details.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Account, AccountType, AccountStatus, ACCOUNT_RULES } from '../../models/account.model';
import { loadAccount, deleteAccount, checkBalance } from '../../store/account.actions';
import { selectSelectedAccount, selectAccountsLoading, selectAccountError } from '../../store/account.selectors';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule
  ],
  templateUrl: './account-details.component.html',
  styleUrl: './account-details.component.css'
})
export class AccountDetailsComponent implements OnInit, OnDestroy {
  account$: Observable<Account | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  
  accountId: number = 0;
  accountRules = ACCOUNT_RULES;
  AccountType = AccountType;
  AccountStatus = AccountStatus;
  
  private subscription = new Subscription();

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.account$ = this.store.select(selectSelectedAccount);
    this.loading$ = this.store.select(selectAccountsLoading);
    this.error$ = this.store.select(selectAccountError);
  }

  ngOnInit(): void {
    const routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.accountId = parseInt(id, 10);
        this.store.dispatch(loadAccount({ accountId: this.accountId }));
      }
    });
    
    this.subscription.add(routeSub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getAccountTypeLabel(type: AccountType): string {
    return type === AccountType.SAVINGS ? 'Savings Account' : 'Current Account';
  }

  getAccountTypeIcon(type: AccountType): string {
    return type === AccountType.SAVINGS ? 'savings' : 'business';
  }

  getStatusColor(status: AccountStatus): string {
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

  getAccountFeatures(account: Account): string[] {
    if (account.accountType === AccountType.SAVINGS) {
      return [
        `Minimum Balance: ₹${this.accountRules.SAVINGS.MIN_BALANCE}`,
        `Interest Rate: ${account.interestRate}% per annum`,
        `Low Balance Alert: < ₹${this.accountRules.SAVINGS.LOW_BALANCE_THRESHOLD}`,
        'No monthly service charges'
      ];
    } else {
      return [
        `Minimum Balance: ₹${this.accountRules.CURRENT.MIN_BALANCE}`,
        `Overdraft Limit: ₹${account.overdraftLimit || 0}`,
        `Monthly Service Charge: ₹${account.monthlyServiceCharge}`,
        'No withdrawal limits'
      ];
    }
  }

  isLowBalance(account: Account): boolean {
    const threshold = account.accountType === AccountType.SAVINGS
      ? this.accountRules.SAVINGS.LOW_BALANCE_THRESHOLD
      : this.accountRules.CURRENT.LOW_BALANCE_THRESHOLD;
    
    return account.balance < threshold;
  }

  getAvailableBalance(account: Account): number {
    if (account.accountType === AccountType.CURRENT && account.overdraftLimit) {
      return account.balance + account.overdraftLimit;
    }
    return account.balance;
  }

  refreshBalance(): void {
    if (this.accountId) {
      this.store.dispatch(checkBalance({ accountId: this.accountId }));
    }
  }

  navigateToTransactions(account: Account): void {
    this.router.navigateByUrl(`/banking/transactions/${account.id}`);
  }

  navigateToDeposit(account: Account): void {
    this.router.navigateByUrl(`/banking/deposit/${account.id}`);
  }

  navigateToWithdraw(account: Account): void {
    this.router.navigateByUrl(`/banking/withdraw/${account.id}`);
  }

  closeAccount(account: Account): void {
    if (confirm(`Are you sure you want to close account ${account.accountNumber}? This action cannot be undone.`)) {
      this.store.dispatch(deleteAccount({ accountId: account.id }));
      this.router.navigateByUrl('/banking/accounts');
    }
  }

  goBack(): void {
    this.router.navigateByUrl('/banking/accounts');
  }

  canPerformTransactions(account: Account): boolean {
    return account.status === AccountStatus.ACTIVE;
  }
}