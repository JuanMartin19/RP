import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { Landing } from './pages/landing/landing';
import { Home } from './pages/home/home';
import { MainLayout } from './layouts/main-layout/main-layout';
import { Groups } from './pages/groups/groups';
import { Perfil } from './pages/perfil/perfil';

export const routes: Routes = [

  {
    path: '',
    component: Landing
  },

  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },

  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: 'home',
        component: Home
      },
      {
        path: 'groups',
        component: Groups
      },
      {
        path: 'perfil',
        component: Perfil
      }
    ]
  },
];