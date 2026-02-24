import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { Landing } from './pages/landing/landing';

export const routes: Routes = [
    // Landing (home)
    {
        path: '',
        component: Landing
    },

    // Auth
    {
        path: 'login',
        component: Login
    },
    {
        path: 'register',
        component: Register
    },

    // Ruta comodín (por si escriben algo mal)
    {
        path: '**',
        redirectTo: ''
    }
];