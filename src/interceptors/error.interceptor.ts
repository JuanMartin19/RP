// src/app/interceptors/error.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core'; // <-- Importamos Injector
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const messageSvc = inject(MessageService);
  
  // Usamos el inyector de Angular en lugar de inyectar el servicio directamente
  const injector = inject(Injector); 

  return next(req).pipe(
    catchError((error) => {
      // Si el backend nos lanza un 401 (No autorizado) o 403 (Prohibido)
      if (error.status === 401 || error.status === 403) {
        
        // ¡Magia! Obtenemos el AuthService solo en el momento en que hay un error.
        // Esto rompe la dependencia circular.
        const authSvc = injector.get(AuthService);
        
        authSvc.logout(); 

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