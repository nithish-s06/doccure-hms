import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    { path: '', loadChildren: () => import('./features/auth/auth.routes').then((m) => m.Auth_Routes), },
    { path: '', loadChildren: () => import('./features/pages/pages.routes').then((m) => m.Pages_Routes), },
    {
        path: '**',
        redirectTo: 'error-404',
        pathMatch: 'full'
    },
];
