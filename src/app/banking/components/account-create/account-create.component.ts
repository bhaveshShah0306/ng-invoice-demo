// src/app/banking/components/account-create/account-create.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AccountType, CreateAccountRequest, ACCOUNT_RULES } from '../../models/account.model';
import { createAccount } from '../../store/account.actions';
import { selectAccountsLoading, selectAccountError } from '../../store/account.selectors';

@Component({
  selector: 'app-account-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatDividerModule,
    MatStepperModule
  ],
  templateUrl: './account-create.component.html',
  styleUrl: './account-create.component.css'
})
export class AccountCreateComponent implements OnInit {
  accountForm!: FormGroup;
  personalInfoForm!: FormGroup;
  accountTypeForm!: FormGroup;
  initialDepositForm!: FormGroup;

  accountTypes = [
    { value: AccountType.SAVINGS, label: 'Savings Account' },
    { value: AccountType.CURRENT, label: 'Current Account' }
  ];

  selectedAccountType: AccountType | null = null;
  accountRules = ACCOUNT_RULES;

  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router
  ) {
    this.loading$ = this.store.select(selectAccountsLoading);
    this.error$ = this.store.select(selectAccountError);
  }

  ngOnInit(): void {
    this.initializeForms();
  }

  initializeForms(): void {
    // Personal Information Form
    this.personalInfoForm = this.fb.group({
      accountHolderName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });

    // Account Type Form
    this.accountTypeForm = this.fb.group({
      accountType: ['', Validators.required]
    });

    // Initial Deposit Form
    this.initialDepositForm = this.fb.group({
      initialDeposit: ['', [Validators.required, Validators.min(100)]]
    });

    // Watch for account type changes to update deposit validation
    this.accountTypeForm.get('accountType')?.valueChanges.subscribe(type => {
      this.selectedAccountType = type;
      this.updateDepositValidation(type);
    });
  }

  updateDepositValidation(accountType: AccountType): void {
    const depositControl = this.initialDepositForm.get('initialDeposit');
    if (!depositControl) return;

    if (accountType === AccountType.SAVINGS) {
      depositControl.setValidators([
        Validators.required,
        Validators.min(ACCOUNT_RULES.SAVINGS.INITIAL_DEPOSIT_MIN)
      ]);
    } else if (accountType === AccountType.CURRENT) {
      depositControl.setValidators([
        Validators.required,
        Validators.min(ACCOUNT_RULES.CURRENT.INITIAL_DEPOSIT_MIN)
      ]);
    }

    depositControl.updateValueAndValidity();
  }

  getMinDeposit(): number {
    if (this.selectedAccountType === AccountType.SAVINGS) {
      return ACCOUNT_RULES.SAVINGS.INITIAL_DEPOSIT_MIN;
    } else if (this.selectedAccountType === AccountType.CURRENT) {
      return ACCOUNT_RULES.CURRENT.INITIAL_DEPOSIT_MIN;
    }
    return 0;
  }

  getAccountFeatures(): string[] {
    if (this.selectedAccountType === AccountType.SAVINGS) {
      return [
        `Minimum Balance: ₹${ACCOUNT_RULES.SAVINGS.MIN_BALANCE}`,
        `Interest Rate: ${ACCOUNT_RULES.SAVINGS.INTEREST_RATE}% per annum`,
        `Withdrawal Limit: ₹${ACCOUNT_RULES.SAVINGS.WITHDRAWAL_LIMIT} per transaction`,
        'No monthly service charges',
        'Ideal for personal savings'
      ];
    } else if (this.selectedAccountType === AccountType.CURRENT) {
      return [
        `Minimum Balance: ₹${ACCOUNT_RULES.CURRENT.MIN_BALANCE}`,
        `Overdraft Facility: ₹${ACCOUNT_RULES.CURRENT.OVERDRAFT_LIMIT}`,
        `Monthly Service Charge: ₹${ACCOUNT_RULES.CURRENT.MONTHLY_SERVICE_CHARGE}`,
        'No withdrawal limits',
        'Ideal for business transactions'
      ];
    }
    return [];
  }

  onSubmit(): void {
    if (this.personalInfoForm.invalid || 
        this.accountTypeForm.invalid || 
        this.initialDepositForm.invalid) {
      return;
    }

    const createRequest: CreateAccountRequest = {
      accountHolderName: this.personalInfoForm.value.accountHolderName,
      email: this.personalInfoForm.value.email,
      phone: this.personalInfoForm.value.phone,
      accountType: this.accountTypeForm.value.accountType,
      initialDeposit: this.initialDepositForm.value.initialDeposit
    };

    this.store.dispatch(createAccount({ request: createRequest }));
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
      this.router.navigateByUrl('/banking/accounts');
    }
  }

  // Form validation helper methods
  getErrorMessage(formGroup: FormGroup, fieldName: string): string {
    const control = formGroup.get(fieldName);
    
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email';
    }
    if (control?.hasError('minlength')) {
      return `Minimum ${control.errors?.['minlength'].requiredLength} characters required`;
    }
    if (control?.hasError('pattern')) {
      return 'Please enter a valid 10-digit phone number';
    }
    if (control?.hasError('min')) {
      return `Minimum amount is ₹${control.errors?.['min'].min}`;
    }
    
    return '';
  }
}