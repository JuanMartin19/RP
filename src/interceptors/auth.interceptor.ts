import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
  const token = match ? decodeURIComponent(match[2]) : null;

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Borramos cookies directamente si expira el token
        document.cookie = `access_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
        document.cookie = `user=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};