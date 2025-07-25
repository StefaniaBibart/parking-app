import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpParams,
} from '@angular/common/http';
import { AuthService } from '../shared/services/auth.service';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  private readonly authService = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (req.url.includes('?auth=')) {
      return next.handle(req);
    }

    const user = this.authService.user();
    if (!user) {
      return next.handle(req);
    }
    const modifiedReq = req.clone({
      params: new HttpParams().set('auth', user.token || ''),
    });
    return next.handle(modifiedReq);
  }
}
