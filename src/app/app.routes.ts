import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  {
    path: 'confirmacion-codigo',
    loadComponent: () =>
      import('./auth/Confirmation Code/Confirm.component').then(m => m.ConfirmComponent)
  },
  {
    path: 'landing',
    loadComponent: () =>
    import('./home/landing/landing.component').then(m => m.LandingComponent)
  },
    {
    path: "stock",
    loadComponent: () =>
      import("../app/comercio/stock/stock.component").then(m => m.StockComponent)
  },
  {
    path: "catalogo",
    loadComponent: () =>
      import("../app/comercio/catalogo/catalogo.component").then(m => m.CatalogoComponent)
  },
  {
    path: "busqueda",
    loadComponent: () =>
      import("./home/busqueda/busqueda.component").then(m => m.HomeComponent)
  },
    {
    path: "home",
    loadComponent: () =>
      import("./home/home/home.component").then(m => m.HomeComponent)
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
    path: 'configuracion',
    loadComponent: () =>
    import("../app/configuracion/configuracion.component").then(m => m.ConfiguracionComponent)
  },
  {
    path: 'ayuda',
    loadComponent: () =>
    import("../app/ayuda/ayuda.component").then(m => m.AyudaComponent)
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
      {
    path: 'mapa',

    loadComponent: () =>
    import("./pages/mapa-pagina/mapa-pagina.component").then(m => m.MapaPaginaComponent)
  },
    ,
      {
    path: 'catalogo',
    loadComponent: () =>
    import("../app/comercio/catalogo/catalogo.component").then(m => m.CatalogoComponent)
  },
    {
    path: "puntos",
    loadComponent: () =>
      import("../app/puntos/puntos.component").then(m => m.PuntosComponent)
  },
  {
    path: "preordenes",
    loadComponent: () =>
      import("../app/preordenes/preordenes.component").then(m => m.PreordenesComponent)
  },
  {
    path: "negocio/:id",
    loadComponent: () =>
      import("../app/negocio/negocio.component").then(m => m.NegocioComponent)
  },
];
