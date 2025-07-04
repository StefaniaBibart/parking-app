import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map, tap, take, mergeMap} from 'rxjs/operators';

import { AuthService } from '../shared/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    router: RouterStateSnapshot,
  ):
    | boolean
    | UrlTree
    | Promise<boolean | UrlTree>
    | Observable<boolean | UrlTree> {
    return this.authService.authState$.pipe(
      take(1),
      map((user) => {
        if (user) {
          return true;
        }
        console.log('login redirect auth-guard');
        return this.router.createUrlTree(['/login']);
      }),
    );
  }
}
