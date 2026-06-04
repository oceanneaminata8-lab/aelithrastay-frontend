import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = localStorage.getItem('access_token');
  const isAuthRequest = req.url.includes('/api/auth/login/') || req.url.includes('/api/auth/refresh/');

  const request = token && !isAuthRequest
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const refresh = localStorage.getItem('refresh_token');
      if (error.status !== 401 || !refresh || isAuthRequest) {
        if (error.status === 401) {
          auth.logout();
        }
        return throwError(() => error);
      }

      return auth.refreshAccessToken().pipe(
        switchMap(({ access }) => next(
          req.clone({
            setHeaders: {
              Authorization: `Bearer ${access}`
            }
          })
        )),
        catchError((refreshError) => {
          auth.logout();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
