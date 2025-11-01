// src/app/banking/components/account-list/account-list.component.ts

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Account, AccountStatus, AccountType } from '../../models/account.model';
import { loadAccounts, deleteAccount } from '../../store/account.actions';
import { selectAllAccounts, selectAccountsLoading } from '../../store/account.selectors';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinner
  ],
  templateUrl: './account-list.component.html',
  styleUrl: './account-list.component.css'
})
export class AccountListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'accountNumber',
    'accountHolderName',
    'accountType',
    'balance',
    'status',
    'createdDate',
    'action'
  ];
  
  dataSource!: MatTableDataSource<Account>;
  accounts$: Observable<Account[]>;
  loading$: Observable<boolean>;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  subscription = new Subscription();

  constructor(
    private store: Store,
    private router: Router
  ) {
    this.accounts$ = this.store.select(selectAllAccounts);
    this.loading$ = this.store.select(selectAccountsLoading);
  }

  ngOnInit(): void {
    this.loadAccounts();
    
    const accountsSub = this.accounts$.subscribe(accounts => {
      this.dataSource = new MatTableDataSource(accounts);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      
      // Custom filter for nested properties
      this.dataSource.filterPredicate = (data: Account, filter: string) => {
        const searchStr = filter.toLowerCase();
        return (
          data.accountNumber.toLowerCase().includes(searchStr) ||
          data.accountHolderName.toLowerCase().includes(searchStr) ||
          data.accountType.toLowerCase().includes(searchStr) ||
          data.status.toLowerCase().includes(searchStr) ||
          data.email.toLowerCase().includes(searchStr)
        );
      };
    });
    
    this.subscription.add(accountsSub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadAccounts(): void {
    this.store.dispatch(loadAccounts());
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  createAccount(): void {
    this.router.navigateByUrl('/banking/create-account');
  }

  viewAccountDetails(accountId: number): void {
    this.router.navigateByUrl(`/banking/account/${accountId}`);
  }

  closeAccount(account: Account): void {
    if (confirm(`Are you sure you want to close account ${account.accountNumber}?`)) {
      this.store.dispatch(deleteAccount({ accountId: account.id }));
    }
  }

  getAccountTypeColor(type: AccountType): string {
    return type === AccountType.SAVINGS ? 'primary' : 'accent';
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

  isAccountActive(status: AccountStatus): boolean {
    return status === AccountStatus.ACTIVE;
  }
}