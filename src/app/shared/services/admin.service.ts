import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { ADMIN_CONFIG } from '../config/admin.config';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private authService: AuthService) {}

  isAdmin(): Observable<boolean> {
    return this.authService.user$.pipe(
      map(user => {
        if (!user) return false;
        return user.email === ADMIN_CONFIG.adminEmail;
      })
    );
  }

  async isAdminAsync(): Promise<boolean> {
    const currentUser = await this.authService.user();
    if (!currentUser) return false;
    return currentUser.email === ADMIN_CONFIG.adminEmail;
  }
} 