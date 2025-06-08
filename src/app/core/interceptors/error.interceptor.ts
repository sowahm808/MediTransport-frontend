import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired, try to refresh
        if (authService.getRefreshToken()) {
          return authService.refreshToken().pipe(
            switchMap(() => {
              // Retry the original request with new token
              const token = authService.getToken();
              const authReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${token}`)
              });
              return next(authReq);
            }),
            catchError(() => {
              // Refresh failed, logout user
              authService.logout();
              return throwError(() => error);
            })
          );
        } else {
          // No refresh token, logout user
          authService.logout();
        }
      }

      return throwError(() => error);
    })
  );
};
