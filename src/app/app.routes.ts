import { Routes } from '@angular/router';
import { authGuard, activeUserGuard, ownerGuard, storeAccessGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  // Public routes (no authentication required)
  {
    path: 'landing',
    loadComponent: () =>
      import('./home/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'busqueda',
    loadComponent: () =>
      import('./home/busqueda/busqueda.component').then(m => m.HomeComponent)
  },
  {
    path: 'catalogo',
    loadComponent: () =>
      import('../app/comercio/catalogo/catalogo.component').then(m => m.CatalogoComponent)
  },
  {
    path: 'mapa',
    loadComponent: () =>
      import('./pages/mapa-pagina/mapa-pagina.component').then(m => m.MapaPaginaComponent)
  },
  {
    path: 'negocio/:id',
    loadComponent: () =>
      import('../app/negocio/negocio.component').then(m => m.NegocioComponent)
  },
  // Requires authentication (any authenticated user)
  {
    path: 'confirmacion-codigo',
    loadComponent: () =>
      import('./auth/Confirmation Code/Confirm.component').then(m => m.ConfirmComponent),
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('../app/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [authGuard]
  },
  {
    path: 'puntos',
    loadComponent: () =>
      import('../app/puntos/puntos.component').then(m => m.PuntosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'preordenes',
    loadComponent: () =>
      import('../app/preordenes/preordenes.component').then(m => m.PreordenesComponent),
    canActivate: [authGuard]
  },
  // Requires active user (authenticated + email verified)
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home/home.component').then(m => m.HomeComponent),
    canActivate: [activeUserGuard]
  },
  {
  path: 'carrito',
  loadComponent: () => import('./pages/carrito/carrito.component').then(m => m.CarritoComponent),
  canActivate: [activeUserGuard]
},
{
  path: 'orden-confirmacion',
  loadComponent: () => import('./pages/Confirmation/Confirmation.component').then(m => m.OrdenConfirmacionComponent),
  canActivate: [activeUserGuard]
},
  {
    path: 'crear-comercio',
    loadComponent: () =>
      import('../app/comercio/crear-comercio/crear-comercio.component').then(m => m.CrearComercioComponent),
    canActivate: [activeUserGuard]
  },
  // Requires store owner role
  {
    path: 'stock',
    loadComponent: () =>
      import('../app/comercio/stock/stock.component').then(m => m.StockComponent),
    canActivate: [ownerGuard]
  },
  {
    path: 'escanear',
    loadComponent: () =>
      import('../app/comercio/escanear/escanear.component').then(m => m.EscanearComponent),
    canActivate: [storeAccessGuard] // Owner or cashier
  },
  {
    path: 'estadisticas',
    loadComponent: () =>
      import('../app/comercio/estadisticas/estadisticas.component').then(m => m.EstadisticasComponent),
    canActivate: [ownerGuard]
  },
  {
    path: 'configuracion',
    loadComponent: () =>
      import('../app/configuracion/configuracion.component').then(m => m.ConfiguracionComponent),
    canActivate: [ownerGuard]
  },
  {
    path: 'ayuda',
    loadComponent: () =>
      import('../app/ayuda/ayuda.component').then(m => m.AyudaComponent)
  },
];
