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

  if (authService.isOwner()) {
    return true;
  }

  // If authenticated but not owner, redirect to home
  if (authService.isAuthenticated()) {
    router.navigate(['/home']);
    return false;
  }

  // If not authenticated, redirect to landing
  router.navigate(['/landing']);
  return false;
};

/**
 * Guard for routes that require store access (owner or cashier)
 * Requires: Valid token + email_verified + (store_role = 'owner' OR 'cashier')
 */
export const storeAccessGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isCashier()) {
    return true;
  }

  // If authenticated but not cashier/owner, redirect to home
  if (authService.isAuthenticated()) {
    router.navigate(['/home']);
    return false;
  }

  // If not authenticated, redirect to landing
  router.navigate(['/landing']);
  return false;
};

