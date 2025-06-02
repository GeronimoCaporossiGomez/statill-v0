import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    loadComponent: () =>
      import('../home/landing/landing.component').then(m => m.LandingComponent)
  },
];
