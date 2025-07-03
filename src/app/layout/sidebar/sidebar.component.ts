import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { AdminService } from '../../shared/services/admin.service';
import { AuthService } from '../../shared/services/auth.service';
import { Observable, take } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  imports: [MaterialModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  isDarkTheme = false;
  isAdmin$: Observable<boolean>;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private adminService: AdminService,
    private authService: AuthService
  ) {
    this.isAdmin$ = this.adminService.isAdmin();
  }

  ngOnInit(): void {
    this.themeService.isDarkTheme$.subscribe((isDark) => {
      this.isDarkTheme = isDark;
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  async navigateToHome() {
    const isAdmin = await this.adminService.isAdminAsync();
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
    // TODO: refactor to this.authService.logout();
    this.authService.logout().pipe(take(1)).subscribe();
  }
}
