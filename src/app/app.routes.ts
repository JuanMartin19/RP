import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login').then(m => m.Login)
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/register/register').then(m => m.Register)
  },

  {
    path: 'landing',
    loadComponent: () =>
      import('./pages/landing/landing').then(m => m.Landing)
  },

  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout/main-layout').then(m => m.MainLayout),

    children: [

      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home').then(m => m.Home)
      },

      {
        path: 'groups',
        loadComponent: () =>
          import('./pages/groups/groups').then(m => m.Groups)
      },

      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/perfil/perfil').then(m => m.Perfil)
      },

      {
        path: 'usuarios',
        loadComponent: () =>
          import('./pages/usuarios/usuarios').then(m => m.Usuarios)
      },

      {
        path: 'ticket',
        loadComponent: () =>
          import('./pages/ticket/ticket').then(m => m.Ticket)
      }

    ]
  }

];