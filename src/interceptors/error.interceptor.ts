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
      
      // Manejo específico para el Error 403 (Prohibido / Acceso Denegado)
      if (error.status === 403) {
        
        // Obtenemos el mensaje exacto que nos mandó el API Gateway
        const mensajeError = error.error?.data?.message || '';

        // 1. CASO GRAVE: Ya no pertenece al equipo.
        // (El API Gateway siempre manda este mensaje específico cuando ya no estás en la tabla grupo_miembros)
        if (mensajeError.includes('Ya no perteneces a este equipo')) {
          
          // Solo si lo corrieron del equipo lo mandamos al inicio, no al login completo
          router.navigate(['/home']);
          setTimeout(() => {
            messageSvc.add({ 
              severity: 'error', 
              summary: 'Expulsado', 
              detail: 'Ya no tienes acceso a ese grupo.' 
            });
          }, 100);

        } else {
          // 2. CASO LEVE: Solo intentó usar un botón sin permiso (ej. cambiar estado).
          // Mostramos el mensaje (ej: "Acceso denegado. Se requiere: ticket:edit:state")
          // PERO NO LO SACAMOS.
          messageSvc.add({ 
            severity: 'warn', // Naranja para que sepa que es una advertencia de permisos
            summary: 'Permiso Denegado', 
            detail: mensajeError || 'No tienes permiso para realizar esta acción.' 
          });
        }
      }
      
      return throwError(() => error);
    })
  );
};