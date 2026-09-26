import { Routes } from '@angular/router';

export const Auth_Routes: Routes = [
    {
         path: '', loadComponent: () => import('./auth').then((m) => m.Auth),
         children:[
             { path: 'login', loadComponent: () => import('./login/login').then((m) => m.Login),},
             { path: 'register', loadComponent: () => import('./register/register').then((m) => m.Register),},
             { path: 'forgot-password', loadComponent: () => import('./forgot-password/forgot-password').then((m) => m.ForgotPassword),},
             { path: 'reset-password', loadComponent: () => import('./reset-password/reset-password').then((m) => m.ResetPassword),},
             { path: 'otp-verification', loadComponent: () => import('./otp-verification/otp-verification').then((m) => m.OtpVerification),},
             { path: 'lock-screen', loadComponent: () => import('./lock-screen/lock-screen').then((m) => m.LockScreen),},
             { path: 'two-factor-authentication', loadComponent: () => import('./two-factor-authentication/two-factor-authentication').then((m) => m.TwoFactorAuthentication),},
             { path: 'session-expired', loadComponent: () => import('./session-expired/session-expired').then((m) => m.SessionExpired),},
         ]
    },
    // {path: 'terms-of-service', loadComponent: () => import('./terms-of-service/terms-of-service').then((m) => m.TermsOfService),},
    // {path: 'privacy-policy', loadComponent: () => import('./privacy-policy/privacy-policy').then((m) => m.PrivacyPolicy),},
    // {path: 'error-500', loadComponent: () => import('./error/error-500/error-500').then((m) => m.Error500),},
    // {path: 'error-404', loadComponent: () => import('./error/error-404/error-404').then((m) => m.Error404),},
    // {path: 'error-403', loadComponent: () => import('./error/error-403/error-403').then((m) => m.Error403),},
    // {path: 'coming-soon', loadComponent: () => import('./coming-soon/coming-soon').then((m) => m.ComingSoon),},
    // {path: 'maintenance', loadComponent: () => import('./maintenance/maintenance').then((m) => m.Maintenance),},
];
