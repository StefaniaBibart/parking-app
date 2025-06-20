import { Component } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { AdminService } from '../../shared/services/admin.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [MaterialModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  isDarkTheme = this.themeService.isDarkTheme;
  isAdmin = this.adminService.isAdmin;

  constructor(
    private router: Router,
    public themeService: ThemeService,
    private adminService: AdminService,
    private authService: AuthService
  ) {}

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
    this.authService.logout();
  }
}
