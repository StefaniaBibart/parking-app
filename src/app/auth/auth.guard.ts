import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { filter, map, take } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.userResource.status).pipe(
    filter((status) => status === 'resolved'),
    take(1),
    map(() => {
      const user = authService.user();
      if (!user) {
        return router.createUrlTree(['/login']);
      }

      const isAdminRoute = route.data['isAdminRoute'] === true;
      const isAdmin = authService.isAdmin();

      if (isAdminRoute) {
        if (isAdmin) {
          return true;
        } else {
          return router.createUrlTree(['/home']);
        }
      } else {
        if (isAdmin) {
          return router.createUrlTree(['/admin/dashboard']);
        } else {
          return true;
        }
      }
    })
  );
};
