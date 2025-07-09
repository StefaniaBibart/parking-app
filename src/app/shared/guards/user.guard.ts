import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, filter, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate() {
    return this.authService.isAdmin$.pipe(
      take(1),
      map(isAdmin => {
        if (isAdmin) {
          this.router.navigate(['/admin/dashboard']);
          return false;
        }
        return true;
      })
    );
  }
}
