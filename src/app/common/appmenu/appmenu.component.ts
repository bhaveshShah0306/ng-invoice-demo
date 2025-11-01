import { CommonModule } from '@angular/common';
import { Component, DoCheck } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { ProductService } from '../../service/product.service';

@Component({
  selector: 'app-appmenu',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    CommonModule
  ],
  templateUrl: './appmenu.component.html',
  styleUrl: './appmenu.component.css'
})
export class AppmenuComponent implements DoCheck {
  
  /**
   * Controls menu visibility
   * Hidden on login/register pages
   */
  showmenu = false;
  
  constructor(
    private router: Router,
    public service: ProductService
  ) {}

  /**
   * Check current route on every change detection cycle
   * Hide menu on login/register pages
   */
  ngDoCheck(): void {
    const currenturl = this.router.url;
    
    // Hide menu on authentication pages
    if (currenturl === '/login' || currenturl === '/register') {
      this.showmenu = false;
    } else {
      this.showmenu = true;
    }
  }

  /**
   * Get current logged-in username from localStorage
   * @returns Username or 'Guest' if not logged in
   */
  getUsername(): string {
    const username = localStorage.getItem('username');
    return username ? username : 'Guest';
  }

  /**
   * Check if user is logged in
   * @returns boolean
   */
  isLoggedIn(): boolean {
    return localStorage.getItem('username') !== null;
  }

  /**
   * Logout the current user
   * Clears localStorage and navigates to login
   */
  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      this.router.navigateByUrl('/login');
    }
  }
}
