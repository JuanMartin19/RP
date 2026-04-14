// src/app/interceptors/error.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthService } from '../app/services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authSvc = inject(AuthService);
  const messageSvc = inject(MessageService);

  return next(req).pipe(
    catchError((error) => {
      // Si el backend nos lanza un 401 (No autorizado) o 403 (Prohibido)
      if (error.status === 401 || error.status === 403) {
        
        // 1. Borramos la sesión local y redirigimos al login
        authSvc.logout(); 

        // 2. Le mostramos un mensaje explicando por qué lo sacamos
        setTimeout(() => {
          messageSvc.add({ 
            severity: 'error', 
            summary: 'Acceso Denegado', 
            detail: error.error?.data?.message || 'Tus permisos han cambiado o tu cuenta fue desactivada.' 
          });
        }, 100);
      }
      
      return throwError(() => error);
    })
  );
};