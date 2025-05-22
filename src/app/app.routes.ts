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
    path: '**',
    redirectTo: 'landing'
  }
];
