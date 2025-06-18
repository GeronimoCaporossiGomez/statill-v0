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
    path: 'perfil',
    loadComponent: () =>
    import("../app/perfil/perfil.component").then(m => m.PerfilComponent)
  },
    {
    path: 'crear-comercio',
    loadComponent: () =>
    import("../app/comercio/crear-comercio/crear-comercio.component").then(m => m.CrearComercioComponent)
  },
    {
    path: 'escanear',
    loadComponent: () =>
    import("../app/comercio/escanear/escanear.component").then(m => m.EscanearComponent)
  },
    {
    path: 'estadisticas',
    loadComponent: () =>
    import("../app/comercio/estadisticas/estadisticas.component").then(m => m.EstadisticasComponent)
  },
];
