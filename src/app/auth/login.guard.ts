import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { map, filter, take } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

export const LoginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.userResource.status).pipe(
    filter((status) => status === 'resolved'),
    take(1),
    map(() => {
      if (authService.user()) {
        if (authService.isAdmin()) {
          return router.createUrlTree(['/admin/dashboard']);
        }
        return router.createUrlTree(['/home']);
      }
      return true;
    })
  );
}; 