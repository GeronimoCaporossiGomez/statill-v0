import { Routes } from '@angular/router';
import {
  authGuard,
  activeUserGuard,
  ownerGuard,
  storeAccessGuard,
  allowCreateCommerceGuard,
} from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full',
  },
  // Public routes (no authentication required)
  {
    path: 'landing',
    loadComponent: () =>
      import('./home/landing/landing.component').then(
        (m) => m.LandingComponent,
      ),
  },
  {
    path: 'busqueda',
    loadComponent: () =>
      import('./home/busqueda/busqueda.component').then((m) => m.HomeComponent),
  },
  {
    path: 'catalogo',
    loadComponent: () =>
      import('./comercio/catalogo/catalogo.component').then(
        (m) => m.CatalogoComponent,
      ),
  },
  {
    path: 'mapa',
    loadComponent: () =>
      import('./pages/mapa-pagina/mapa-pagina.component').then(
        (m) => m.MapaPaginaComponent,
      ),
  },
  {
    path: 'negocio/:id',
    loadComponent: () =>
      import('./negocio/negocio.component').then((m) => m.NegocioComponent),
  },
  // Requires authentication (any authenticated user)
  {
    path: 'confirmacion-codigo',
    loadComponent: () =>
      import('./auth/Confirmation Code/Confirm.component').then(
        (m) => m.ConfirmComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./perfil/perfil.component').then((m) => m.PerfilComponent),
    canActivate: [authGuard],
  },
  {
    path: 'puntos',
    loadComponent: () =>
      import('./puntos/puntos.component').then((m) => m.PuntosComponent),
    canActivate: [authGuard],
  },
  {
    path: 'preordenes',
    loadComponent: () =>
      import('./preordenes/preordenes.component').then(
        (m) => m.PreordenesComponent,
      ),
    canActivate: [authGuard],
  },
  // Requires active user (authenticated + email verified)
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'crear-comercio',
    loadComponent: () =>
      import('./comercio/crear-comercio/crear-comercio.component').then(
        (m) => m.CrearComercioComponent,
      ),
    canActivate: [activeUserGuard, allowCreateCommerceGuard],
  },
  {
    path: 'menu-local',
    loadComponent: () =>
      import('./comercio/menu-local/menu-local.component').then(
        (m) => m.MenuLocalComponent,
      ),
    //canActivate: [storeAccessGuard] // Owner o Cashier
  },
  {
    path: 'ventas-locales',
    loadComponent: () =>
      import('./comercio/ventas-locales/ventas-locales.component').then(
        (m) => m.VentasLocalesComponent,
      ),
    //canActivate: [storeAccessGuard]
  },
  {
    path: 'carrito',
    loadComponent: () =>
      import('./pages/carrito/carrito.component').then(
        (m) => m.CarritoComponent,
      ),
    canActivate: [activeUserGuard],
  },
  {
    path: 'orden-confirmacion',
    loadComponent: () =>
      import('./pages/Confirmation/Confirmation.component').then(
        (m) => m.OrdenConfirmacionComponent,
      ),
    canActivate: [activeUserGuard],
  },
  {
    path: 'metodo-pago-no-disponible',
    loadComponent: () =>
      import(
        './pages/metodo-pago-no-disponible/metodo-pago-no-disponible.component'
      ).then((m) => m.MetodoPagoNoDisponibleComponent),
    canActivate: [activeUserGuard],
  },
  // Requires store owner role
  {
    path: 'stock',
    loadComponent: () =>
      import('./comercio/stock/stock.component').then((m) => m.StockComponent),
    //canActivate: [ownerGuard]
  },
  {
    path: 'ordenes-tienda',
    loadComponent: () =>
      import('./comercio/ordenes-tienda/ordenes-tienda.component').then(
        (m) => m.OrdenesTiendaComponent,
      ),
    //canActivate: [storeAccessGuard] // Owner o Cashier
  },
  {
    path: 'escanear',
    loadComponent: () =>
      import('./comercio/escanear/escanear.component').then(
        (m) => m.EscanearComponent,
      ),
    //canActivate: [storeAccessGuard] // Owner or cashier
  },
  {
    path: 'estadisticas',
    loadComponent: () =>
      import('./comercio/estadisticas/estadisticas.component').then(
        (m) => m.EstadisticasComponent,
      ),
    //canActivate: [ownerGuard]
  },
  {
    path: 'configuracion',
    loadComponent: () =>
      import('./configuracion/configuracion.component').then(
        (m) => m.ConfiguracionComponent,
      ),
    //canActivate: [ownerGuard]
  },
  {
    path: 'ayuda',
    loadComponent: () =>
      import('./ayuda/ayuda.component').then((m) => m.AyudaComponent),
  },
];
