import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'landing'
  },
  {
    path: 'landing',
    loadComponent: () =>
      import('./pages/landing/landing.component').then(m => m.LandingPageComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/registro/registro.component').then(m => m.RegisterComponent)
  },
  {
    path: '**',
    redirectTo: 'landing'
  }
];
