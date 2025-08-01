import { Component, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../shared/services/auth.service';
import { take } from 'rxjs';
import { tap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  imports: [MaterialModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);

  isDarkTheme = false;
  isAdmin = this.authService.isAdmin;

  ngOnInit(): void {
    this.themeService.isDarkTheme$.subscribe((isDark) => {
      this.isDarkTheme = isDark;
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  async navigateToHome() {
    const isAdmin = this.authService.isAdmin();
    if (isAdmin) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
  }
}
