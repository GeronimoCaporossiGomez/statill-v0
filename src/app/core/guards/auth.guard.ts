import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

/**
 * Guard for routes that require authentication (any authenticated user)
 * Requires: Valid token
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to landing if not authenticated
  router.navigate(['/landing']);
  return false;
};

/**
 * Guard for routes that require an active user (authenticated + email verified)
 * Requires: Valid token + email_verified = true
 */
export const activeUserGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isActiveUser()) {
    return true;
  }

  // If authenticated but not verified, redirect to activation page
  if (authService.isAuthenticated()) {
    router.navigate(['/confirmacion-codigo']);
    return false;
  }

  // If not authenticated, redirect to landing
  router.navigate(['/landing']);
  return false;
};

/**
 * Guard for routes that require store owner role
 * Requires: Valid token + email_verified + store_role = 'owner'
 */
export const ownerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔐 OwnerGuard: Verificando acceso...');
  
  // Get current user
  const user = authService.getCurrentUser();
  console.log('👤 Usuario actual:', user);

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    console.log('❌ Usuario no autenticado');
    router.navigate(['/landing']);
    return false;
  }

  // Check if user is active (email verified)
  if (!authService.isActiveUser()) {
    console.log('❌ Usuario no tiene email verificado');
    router.navigate(['/confirmacion-codigo']);
    return false;
  }

  // Check if user is owner
  if (!user || user.store_role !== 'owner') {
    console.log('❌ Usuario no es owner. store_role:', user?.store_role);
    alert('Esta sección es solo para propietarios de tiendas.');
    router.navigate(['/home']);
    return false;
  }

  console.log('✅ Acceso permitido a usuario owner');
  return true;
};

/**
 * Guard for routes that require store access (owner or cashier)
 * Requires: Valid token + email_verified + (store_role = 'owner' OR 'cashier')
 */
export const storeAccessGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔐 StoreAccessGuard: Verificando acceso...');
  
  // Get current user
  const user = authService.getCurrentUser();
  console.log('👤 Usuario actual:', user);

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    console.log('❌ Usuario no autenticado');
    router.navigate(['/landing']);
    return false;
  }

  // Check if user is active (email verified)
  if (!authService.isActiveUser()) {
    console.log('❌ Usuario no tiene email verificado');
    router.navigate(['/confirmacion-codigo']);
    return false;
  }

  // Check if user has store access (owner or cashier)
  if (!user || (user.store_role !== 'owner' && user.store_role !== 'cashier')) {
    console.log('❌ Usuario no tiene acceso a tienda. store_role:', user?.store_role);
    alert('Esta sección es solo para propietarios o cajeros de tiendas.');
    router.navigate(['/home']);
    return false;
  }

  console.log('✅ Acceso permitido a usuario con rol:', user.store_role);
  return true;
};