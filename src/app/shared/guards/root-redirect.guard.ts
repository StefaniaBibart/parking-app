import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
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

  canActivate(): Observable<UrlTree> {
    return this.authService.user$.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          console.log('login redirect root-redirect');
          return of(this.router.createUrlTree(['/login']));
        }
        return this.adminService.isAdmin().pipe(
          map((isAdmin) => {
            if (isAdmin) {
              return this.router.createUrlTree(['/admin/dashboard']);
            } else {
              return this.router.createUrlTree(['/home']);
            }
          })
        );
      })
    );
  }
}
