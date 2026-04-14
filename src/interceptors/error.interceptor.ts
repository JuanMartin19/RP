import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const messageSvc = inject(MessageService);

  return next(req).pipe(
    catchError((error) => {
      // Ignoramos el 401 aquí porque authInterceptor ya lo maneja
      if (error.status === 403) {
        
        // Borramos cookies directamente
        document.cookie = `access_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
        document.cookie = `user=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
        
        router.navigate(['/login']);

        setTimeout(() => {
          messageSvc.add({ 
            severity: 'error', 
            summary: 'Acceso Denegado', 
            detail: error.error?.data?.message || 'Tus permisos han cambiado.' 
          });
        }, 100);
      }
      
      return throwError(() => error);
    })
  );
};