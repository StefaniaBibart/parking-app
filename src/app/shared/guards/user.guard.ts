import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AdminService } from '../services/admin.service';

@Injectable({
  providedIn: 'root',
})
export class UserGuard implements CanActivate {
  constructor(private adminService: AdminService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const isAdmin = await this.adminService.isAdminAsync();

    if (isAdmin) {
      this.router.navigate(['/admin/dashboard']);
      return false;
    }

    return true;
  }
}
