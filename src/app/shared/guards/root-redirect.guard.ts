import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RootRedirectGuard implements CanActivate {
  constructor(
    private adminService: AdminService,
    private router: Router,
    private authService: AuthService
  ) {}

  async canActivate(): Promise<boolean> {
    const user = await this.authService.user();

    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    const isAdmin = await this.adminService.isAdminAsync();

    if (isAdmin) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }

    return false;
  }
}
