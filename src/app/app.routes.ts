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
    import('./home/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: "home",
    loadComponent: () =>
      import("../app/home/home/home.component").then(m => m.HomeComponent)
  },
  {
    path: 'carrito',
    loadComponent: () =>
      import('./pages/carrito/carrito.component').then(m => m.CarritoComponent)
}];