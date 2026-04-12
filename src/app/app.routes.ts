// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  
  // --- RUTAS PÚBLICAS (Vigiladas por guestGuard) ---
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/register/register').then(m => m.Register)
  },
  {
    path: 'landing',
    loadComponent: () => import('./pages/landing/landing').then(m => m.Landing)
  },

  // --- RUTAS PRIVADAS (Vigiladas por authGuard) ---
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then(m => m.Home)
      },
      {
        path: 'dashboard/:id',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
        children: [
          {
            path: '',
            redirectTo: 'resumen',
            pathMatch: 'full'
          },
          {
            path: 'resumen',
            loadComponent: () => import('./pages/dashboard/resumen/resumen').then(m => m.Resumen)
          },
          {
            path: 'kanban',
            loadComponent: () => import('./pages/dashboard/kanban/kanban').then(m => m.Kanban)
          },
          {
            path: 'lista',
            loadComponent: () => import('./pages/dashboard/lista/lista').then(m => m.Lista)
          },
          {
            path: 'gestion',
            loadComponent: () => import('./pages/dashboard/gestion/gestion').then(m => m.Gestion)
          },
          // CORRECCIÓN: La ruta ticket AHORA es hija directa del dashboard/:id
          {
            path: 'ticket', 
            loadComponent: () => import('./pages/ticket/ticket').then(m => m.Ticket)
          }
        ]
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'groups',
        loadComponent: () => import('./pages/groups/groups').then(m => m.Groups)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/usuarios/usuarios').then(m => m.Usuarios)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/perfil/perfil').then(m => m.Perfil)
      }
    ]
  },
  
  {
    path: '**',
    redirectTo: 'login'
  }
];