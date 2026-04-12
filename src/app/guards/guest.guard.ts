import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario YA está logueado, lo mandamos directo al sistema (home)
  if (authService.isLoggedIn()) {
    router.navigate(['/home']);
    return false; // Bloqueamos el acceso a la vista de login/registro
  }

  // Si no tiene sesión, es un invitado, lo dejamos pasar al login
  return true;
};