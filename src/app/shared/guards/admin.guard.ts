import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate() {
    return this.authService.isAdmin$.pipe(
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
