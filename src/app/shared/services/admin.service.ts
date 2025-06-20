import { Injectable, computed } from '@angular/core';
import { AuthService } from './auth.service';
import { ADMIN_CONFIG } from '../config/admin.config';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private authService: AuthService) {}

  isAdmin = computed(() => {
    const user = this.authService.user();
    if (!user) return false;
    return user.email === ADMIN_CONFIG.adminEmail;
  });

  async isAdminAsync(): Promise<boolean> {
    const currentUser = await this.authService.getCurrentUser();
    if (!currentUser) return false;
    return currentUser.email === ADMIN_CONFIG.adminEmail;
  }
}
