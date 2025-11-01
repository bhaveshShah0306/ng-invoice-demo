import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './common/about/about.component';
import { ContactComponent } from './common/contact/contact.component';
import { CustomerComponent } from './common/customer/customer.component';
import { AddComponent } from './common/add/add.component';
import { StatusComponent } from './common/status/status.component';
import { authGuard } from './Guard/auth.guard';
import { childauthGuard } from './Guard/childauth.guard';
import { authdGuard } from './Guard/authd.guard';
import { LoginComponent } from './common/login/login.component';
import { RegisterComponent } from './common/register/register.component';
import { ProductComponent } from './common/product/product.component';
import { LearnComponent } from './common/learn/learn.component';
import { NewproductComponent } from './common/newproduct/newproduct.component';
import { MaskComponent } from './common/mask/mask.component';
import { ListComponent } from './Invoice/list/list.component';
import { AddinvoiceComponent } from './Invoice/addinvoice/addinvoice.component';
import { AccountListComponent } from './banking/components/account-list/account-list.component';
import { AccountCreateComponent } from './banking/components/account-create/account-create.component';
import { AccountDetailsComponent } from './banking/components/account-details/account-details.component';

export const routes: Routes = [
    // ============================================================================
    // PUBLIC ROUTES (No Authentication Required)
    // ============================================================================
    {
        path: 'login', 
        component: LoginComponent
    },
    {
        path: 'register', 
        component: RegisterComponent
    },

    // ============================================================================
    // PROTECTED ROUTES (Authentication Required)
    // ============================================================================
    {
        path: '', 
        component: HomeComponent, 
        canActivate: [authGuard]
    },
    {
        path: 'about', 
        component: AboutComponent, 
        canActivate: [authGuard]
    },
    {
        path: 'about/:submenu/:id', 
        component: AboutComponent, 
        canActivate: [authGuard]
    },
    {
        path: 'contact', 
        loadComponent: () => import('./common/contact/contact.component').then(m => m.ContactComponent),
        canActivate: [authGuard]
    },
    {
        path: 'customer', 
        component: CustomerComponent,
        canActivate: [authGuard],
        canActivateChild: [childauthGuard],
        canDeactivate: [authdGuard],
        children: [
            {
                path: 'add', 
                component: AddComponent, 
                canActivate: [authGuard]
            },
            {
                path: 'edit/:id', 
                component: AddComponent
            }
        ]
    },
    {
        path: 'product', 
        component: ProductComponent,
        canActivate: [authGuard]
    },
    {
        path: 'learn', 
        component: LearnComponent,
        canActivate: [authGuard]
    },
    {
        path: 'productnew', 
        component: NewproductComponent,
        canActivate: [authGuard]
    },
    {
        path: 'mask', 
        component: MaskComponent,
        canActivate: [authGuard]
    },
    {
        path: 'invoice', 
        component: ListComponent,
        canActivate: [authGuard]
    },
    {
        path: 'createinvoice', 
        component: AddinvoiceComponent,
        canActivate: [authGuard]
    },
    {
        path: 'editinvoice/:invoiceno', 
        component: AddinvoiceComponent,
        canActivate: [authGuard]
    },

    // ============================================================================
    // BANKING ROUTES (Protected)
    // ============================================================================
    {
        path: 'banking',
        canActivate: [authGuard],
        children: [
            {
                path: '',
                redirectTo: 'accounts',
                pathMatch: 'full'
            },
            {
                path: 'accounts',
                component: AccountListComponent,
                title: 'My Accounts - Banking App'
            },
            {
                path: 'create-account',
                component: AccountCreateComponent,
                title: 'Create Account - Banking App'
            },
            {
                path: 'account/:id',
                component: AccountDetailsComponent,
                title: 'Account Details - Banking App'
            }
        ]
    },

    // ============================================================================
    // 404 PAGE - MUST BE LAST
    // ============================================================================
    {
        path: '**', 
        component: StatusComponent
    }
];