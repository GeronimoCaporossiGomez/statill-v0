import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../servicios/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get token from auth service
  const token = authService.getToken();

  // Clone the request and add the authorization header if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle the request and catch 401 errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If unauthorized, logout and redirect to landing
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/landing']);
      }
      return throwError(() => error);
    })
  );
};

