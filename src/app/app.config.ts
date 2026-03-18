import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeuix/themes/lara';

import { HasPermissionDirective } from './directives/has-permission.directive';
import { PermissionsService } from './services/permissions.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    PermissionsService,
    HasPermissionDirective,
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Lara
      },
    }),
  ],
};