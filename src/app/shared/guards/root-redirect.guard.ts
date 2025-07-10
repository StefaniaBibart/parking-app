import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class RootRedirectGuard implements CanActivate {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  canActivate(): Observable<UrlTree> {
    return toObservable(this.authService.user).pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          return of(this.router.createUrlTree(['/login']));
        }
        return this.authService.isAdmin$.pipe(
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
