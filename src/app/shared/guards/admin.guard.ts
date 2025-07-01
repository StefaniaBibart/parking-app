import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { map, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private adminService: AdminService, private router: Router) {}

  canActivate() {
    return this.adminService.isAdmin().pipe(
      take(1),
      map((isAdmin) => {
        if (!isAdmin) {
          this.router.navigate(['/home']);
          return false;
        }
        return true;
      })
    );
  }
}
